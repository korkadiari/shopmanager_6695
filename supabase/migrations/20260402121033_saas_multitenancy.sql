-- ============================================================
-- SaaS Multi-Tenancy Migration
-- ============================================================

-- 1. TYPES
DROP TYPE IF EXISTS public.subscription_plan_name CASCADE;
CREATE TYPE public.subscription_plan_name AS ENUM ('starter', 'pro', 'enterprise');

DROP TYPE IF EXISTS public.subscription_status CASCADE;
CREATE TYPE public.subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'paused');

DROP TYPE IF EXISTS public.onboarding_step CASCADE;
CREATE TYPE public.onboarding_step AS ENUM ('account', 'business', 'shop', 'plan', 'complete');

-- 2. CORE TABLES

-- Subscription plans catalog
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name public.subscription_plan_name NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_shops INTEGER NOT NULL DEFAULT 1,
  max_users INTEGER NOT NULL DEFAULT 3,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tenants (one per business/company)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  commercial_name TEXT,
  legal_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Guinée',
  logo_url TEXT,
  onboarding_step public.onboarding_step DEFAULT 'account',
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant subscriptions
CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  plan_name public.subscription_plan_name NOT NULL DEFAULT 'starter',
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles (linked to tenants)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shops (per tenant)
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  commercial_name TEXT,
  address TEXT,
  city TEXT,
  phone TEXT,
  manager TEXT,
  logo_url TEXT,
  is_main BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers (per tenant)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  segment TEXT DEFAULT 'Nouveau',
  address TEXT,
  notes TEXT,
  total_purchases NUMERIC(15,2) DEFAULT 0,
  total_debt NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON public.tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON public.user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_shops_tenant_id ON public.shops(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- 4. FUNCTIONS

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. ENABLE RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- subscription_plans: public read
DROP POLICY IF EXISTS "plans_public_read" ON public.subscription_plans;
CREATE POLICY "plans_public_read" ON public.subscription_plans
  FOR SELECT TO public USING (true);

-- user_profiles: own row
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile" ON public.user_profiles
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- tenants: owner manages
DROP POLICY IF EXISTS "tenant_owner_manage" ON public.tenants;
CREATE POLICY "tenant_owner_manage" ON public.tenants
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- tenant_subscriptions: via tenant ownership
DROP POLICY IF EXISTS "tenant_sub_owner_manage" ON public.tenant_subscriptions;
CREATE POLICY "tenant_sub_owner_manage" ON public.tenant_subscriptions
  FOR ALL TO authenticated
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()));

-- shops: via tenant ownership
DROP POLICY IF EXISTS "shops_tenant_owner_manage" ON public.shops;
CREATE POLICY "shops_tenant_owner_manage" ON public.shops
  FOR ALL TO authenticated
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()));

-- customers: via tenant ownership
DROP POLICY IF EXISTS "customers_tenant_owner_manage" ON public.customers;
CREATE POLICY "customers_tenant_owner_manage" ON public.customers
  FOR ALL TO authenticated
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()));

-- 7. TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS tenants_updated_at ON public.tenants;
CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS shops_updated_at ON public.shops;
CREATE TRIGGER shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS customers_updated_at ON public.customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 8. SEED SUBSCRIPTION PLANS
INSERT INTO public.subscription_plans (name, display_name, price_monthly, max_shops, max_users, features)
VALUES
  ('starter', 'Starter', 0, 1, 3, '["1 boutique", "3 utilisateurs", "POS basique", "Rapports simples"]'::jsonb),
  ('pro', 'Pro', 49000, 5, 15, '["5 boutiques", "15 utilisateurs", "POS avancé", "Rapports détaillés", "Notifications SMS/Email", "Gestion fournisseurs"]'::jsonb),
  ('enterprise', 'Enterprise', 149000, 999, 999, '["Boutiques illimitées", "Utilisateurs illimités", "Toutes les fonctionnalités", "Support prioritaire", "API access", "Personnalisation"]'::jsonb)
ON CONFLICT (name) DO NOTHING;
