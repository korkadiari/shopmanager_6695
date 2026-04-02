-- ============================================================
-- Business Data Migration: products, suppliers, sales, shifts
-- ============================================================

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  shop_id         UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  brand           TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT '',
  model           TEXT NOT NULL DEFAULT '',
  purchase_price  NUMERIC NOT NULL DEFAULT 0,
  sale_price      NUMERIC NOT NULL DEFAULT 0,
  stock           INTEGER NOT NULL DEFAULT 0,
  threshold       INTEGER NOT NULL DEFAULT 10,
  supplier_name   TEXT NOT NULL DEFAULT '',
  imei            TEXT,
  status          TEXT NOT NULL DEFAULT 'in_stock',
  last_updated    TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id   ON public.products(shop_id);

-- ─── SUPPLIERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suppliers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  contact             TEXT NOT NULL DEFAULT '',
  email               TEXT NOT NULL DEFAULT '',
  phone               TEXT NOT NULL DEFAULT '',
  address             TEXT NOT NULL DEFAULT '',
  city                TEXT NOT NULL DEFAULT 'Conakry',
  category            TEXT NOT NULL DEFAULT 'Électronique',
  payment_terms       TEXT NOT NULL DEFAULT 'Net 30',
  credit_limit        NUMERIC NOT NULL DEFAULT 0,
  outstanding_balance NUMERIC NOT NULL DEFAULT 0,
  total_orders        INTEGER NOT NULL DEFAULT 0,
  active              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_tenant_id ON public.suppliers(tenant_id);

-- ─── SUPPLIER INVOICES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_invoices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  tenant_id   UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_ref TEXT NOT NULL DEFAULT '',
  amount      NUMERIC NOT NULL DEFAULT 0,
  paid        NUMERIC NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'unpaid',
  description TEXT NOT NULL DEFAULT '',
  invoice_date TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_invoices_supplier_id ON public.supplier_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_tenant_id   ON public.supplier_invoices(tenant_id);

-- ─── SALES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sales (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  shop_id        UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  customer_id    UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_ref    TEXT NOT NULL DEFAULT '',
  subtotal       NUMERIC NOT NULL DEFAULT 0,
  discount       NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total          NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Espèces',
  payment_status TEXT NOT NULL DEFAULT 'paid',
  cashier_name   TEXT NOT NULL DEFAULT '',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_tenant_id   ON public.sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_shop_id     ON public.sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON public.sales(customer_id);

-- ─── SALE ITEMS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sale_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id      UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  quantity     INTEGER NOT NULL DEFAULT 1,
  unit_price   NUMERIC NOT NULL DEFAULT 0,
  total_price  NUMERIC NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id    ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items(product_id);

-- ─── SHIFTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shifts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  shop_name    TEXT NOT NULL DEFAULT '',
  employee_id  TEXT NOT NULL DEFAULT '',
  employee_name TEXT NOT NULL DEFAULT '',
  employee_role TEXT NOT NULL DEFAULT 'Caissier',
  shift_date   DATE NOT NULL,
  shift_type   TEXT NOT NULL DEFAULT 'Matin',
  hours        TEXT NOT NULL DEFAULT '08:00 - 14:00',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shifts_tenant_id  ON public.shifts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shifts_shift_date ON public.shifts(shift_date);

-- ─── ENABLE RLS ──────────────────────────────────────────────
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts            ENABLE ROW LEVEL SECURITY;

-- ─── HELPER FUNCTION ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ─── RLS POLICIES: PRODUCTS ──────────────────────────────────
DROP POLICY IF EXISTS "tenant_manage_products" ON public.products;
CREATE POLICY "tenant_manage_products"
ON public.products FOR ALL TO authenticated
USING (tenant_id = public.get_user_tenant_id())
WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ─── RLS POLICIES: SUPPLIERS ─────────────────────────────────
DROP POLICY IF EXISTS "tenant_manage_suppliers" ON public.suppliers;
CREATE POLICY "tenant_manage_suppliers"
ON public.suppliers FOR ALL TO authenticated
USING (tenant_id = public.get_user_tenant_id())
WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ─── RLS POLICIES: SUPPLIER INVOICES ─────────────────────────
DROP POLICY IF EXISTS "tenant_manage_supplier_invoices" ON public.supplier_invoices;
CREATE POLICY "tenant_manage_supplier_invoices"
ON public.supplier_invoices FOR ALL TO authenticated
USING (tenant_id = public.get_user_tenant_id())
WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ─── RLS POLICIES: SALES ─────────────────────────────────────
DROP POLICY IF EXISTS "tenant_manage_sales" ON public.sales;
CREATE POLICY "tenant_manage_sales"
ON public.sales FOR ALL TO authenticated
USING (tenant_id = public.get_user_tenant_id())
WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ─── RLS POLICIES: SALE ITEMS ────────────────────────────────
DROP POLICY IF EXISTS "tenant_manage_sale_items" ON public.sale_items;
CREATE POLICY "tenant_manage_sale_items"
ON public.sale_items FOR ALL TO authenticated
USING (
  sale_id IN (
    SELECT id FROM public.sales WHERE tenant_id = public.get_user_tenant_id()
  )
)
WITH CHECK (
  sale_id IN (
    SELECT id FROM public.sales WHERE tenant_id = public.get_user_tenant_id()
  )
);

-- ─── RLS POLICIES: SHIFTS ────────────────────────────────────
DROP POLICY IF EXISTS "tenant_manage_shifts" ON public.shifts;
CREATE POLICY "tenant_manage_shifts"
ON public.shifts FOR ALL TO authenticated
USING (tenant_id = public.get_user_tenant_id())
WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER set_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_sales_updated_at ON public.sales;
CREATE TRIGGER set_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_shifts_updated_at ON public.shifts;
CREATE TRIGGER set_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
