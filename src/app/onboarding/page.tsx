'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Store, Building2, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Loader2, User, Phone, MapPin } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface OnboardingData {
  // Step 1: Account
  fullName: string;
  // Step 2: Business
  businessName: string;
  commercialName: string;
  legalName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  businessCity: string;
  // Step 3: First Shop
  shopName: string;
  shopCity: string;
  shopAddress: string;
  shopPhone: string;
  // Step 4: Plan
  selectedPlan: 'starter' | 'pro' | 'enterprise';
}

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  max_shops: number;
  max_users: number;
  features: string[];
}

const STEPS = [
  { id: 1, label: 'Compte', icon: User },
  { id: 2, label: 'Entreprise', icon: Building2 },
  { id: 3, label: 'Boutique', icon: Store },
  { id: 4, label: 'Abonnement', icon: CreditCard },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    businessName: '',
    commercialName: '',
    legalName: '',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    businessCity: '',
    shopName: '',
    shopCity: '',
    shopAddress: '',
    shopPhone: '',
    selectedPlan: 'starter',
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      // Check if already onboarded
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, onboarding_complete')
        .eq('owner_id', user.id)
        .maybeSingle();
      if (tenant?.onboarding_complete) { router.replace('/dashboard'); return; }
      // Pre-fill name
      const name = user.user_metadata?.full_name || '';
      setData(prev => ({ ...prev, fullName: name, businessEmail: user.email || '' }));
    };
    init();

    // Load plans
    supabase.from('subscription_plans').select('*').eq('is_active', true).then(({ data: p }) => {
      if (p) setPlans(p);
    });
  }, []);

  const update = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) return data.fullName.trim().length > 0;
    if (step === 2) return data.businessName.trim().length > 0 && data.businessCity.trim().length > 0;
    if (step === 3) return data.shopName.trim().length > 0 && data.shopCity.trim().length > 0;
    return true;
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get selected plan id
      const plan = plans.find(p => p.name === data.selectedPlan);

      // 1. Create tenant
      const { data: tenant, error: tenantErr } = await supabase
        .from('tenants')
        .insert({
          owner_id: user.id,
          business_name: data.businessName,
          commercial_name: data.commercialName || data.businessName,
          legal_name: data.legalName || data.businessName,
          phone: data.businessPhone,
          email: data.businessEmail,
          address: data.businessAddress,
          city: data.businessCity,
          onboarding_step: 'complete',
          onboarding_complete: true,
        })
        .select()
        .single();
      if (tenantErr) throw tenantErr;

      // 2. Create subscription
      await supabase.from('tenant_subscriptions').insert({
        tenant_id: tenant.id,
        plan_id: plan?.id,
        plan_name: data.selectedPlan,
        status: 'trialing',
      });

      // 3. Create first shop
      await supabase.from('shops').insert({
        tenant_id: tenant.id,
        name: data.shopName,
        commercial_name: data.shopName,
        address: data.shopAddress,
        city: data.shopCity,
        phone: data.shopPhone,
        is_main: true,
        is_active: true,
      });

      // 4. Update user profile with tenant
      await supabase.from('user_profiles').upsert({
        id: user.id,
        tenant_id: tenant.id,
        email: user.email || '',
        full_name: data.fullName,
        role: 'admin',
      }, { onConflict: 'id' });

      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Onboarding error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const planColors: Record<string, string> = {
    starter: 'border-slate-300',
    pro: 'border-amber-400',
    enterprise: 'border-purple-400',
  };
  const planBg: Record<string, string> = {
    starter: 'bg-slate-50',
    pro: 'bg-amber-50',
    enterprise: 'bg-purple-50',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50 flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow">
          <Store size={20} className="text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900">ShopManager</span>
        <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full ml-1">SaaS</span>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isDone = s.id < step;
          return (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive ? 'bg-amber-500 text-white shadow' :
                isDone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {isDone ? <CheckCircle size={13} /> : <Icon size={13} />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-0.5 rounded ${isDone ? 'bg-green-300' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg p-6 sm:p-8">

        {/* Step 1: Account */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Bienvenue sur ShopManager</h2>
            <p className="text-sm text-slate-500 mb-6">Commençons par vos informations de compte</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom complet *</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={e => update('fullName', e.target.value)}
                  placeholder="Ex: Mamadou Diallo"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Votre entreprise</h2>
            <p className="text-sm text-slate-500 mb-6">Renseignez les informations de votre entreprise</p>
            <div className="space-y-4">
              {[
                { label: 'Nom commercial *', key: 'businessName', placeholder: 'Ex: Boutique Diallo', icon: Building2 },
                { label: 'Nom commercial (enseigne)', key: 'commercialName', placeholder: 'Ex: Diallo & Fils', icon: Store },
                { label: 'Raison sociale', key: 'legalName', placeholder: 'Ex: SARL Diallo Commerce', icon: Building2 },
                { label: 'Téléphone', key: 'businessPhone', placeholder: '+224 6XX XX XX XX', icon: Phone },
                { label: 'Ville *', key: 'businessCity', placeholder: 'Ex: Conakry', icon: MapPin },
                { label: 'Adresse', key: 'businessAddress', placeholder: 'Ex: Madina, Ratoma', icon: MapPin },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    value={data[f.key as keyof OnboardingData]}
                    onChange={e => update(f.key as keyof OnboardingData, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: First Shop */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Votre première boutique</h2>
            <p className="text-sm text-slate-500 mb-6">Configurez votre point de vente principal</p>
            <div className="space-y-4">
              {[
                { label: 'Nom de la boutique *', key: 'shopName', placeholder: 'Ex: Boutique Conakry' },
                { label: 'Ville *', key: 'shopCity', placeholder: 'Ex: Conakry' },
                { label: 'Adresse', key: 'shopAddress', placeholder: 'Ex: Madina, Ratoma' },
                { label: 'Téléphone', key: 'shopPhone', placeholder: '+224 6XX XX XX XX' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    value={data[f.key as keyof OnboardingData]}
                    onChange={e => update(f.key as keyof OnboardingData, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Plan */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Choisissez votre plan</h2>
            <p className="text-sm text-slate-500 mb-6">Essai gratuit de 14 jours — aucune carte requise</p>
            <div className="space-y-3">
              {(plans.length > 0 ? plans : [
                { id: '1', name: 'starter', display_name: 'Starter', price_monthly: 100000, max_shops: 1, max_users: 3, features: ['1 boutique', '3 utilisateurs', 'POS basique', 'Rapports simples'] },
                { id: '2', name: 'pro', display_name: 'Pro', price_monthly: 350000, max_shops: 5, max_users: 15, features: ['5 boutiques', '15 utilisateurs', 'POS avancé', 'Rapports détaillés', 'Notifications SMS/Email'] },
                { id: '3', name: 'enterprise', display_name: 'Enterprise', price_monthly: 700000, max_shops: 999, max_users: 999, features: ['Boutiques illimitées', 'Utilisateurs illimités', 'Toutes les fonctionnalités', 'Support prioritaire'] },
              ] as Plan[]).map(plan => (
                <button
                  key={plan.name}
                  onClick={() => update('selectedPlan', plan.name)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    data.selectedPlan === plan.name
                      ? `${planColors[plan.name]} ${planBg[plan.name]} shadow-sm`
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{plan.display_name}</span>
                      {plan.name === 'pro' && (
                        <span className="text-xs bg-amber-500 text-white font-semibold px-2 py-0.5 rounded-full">Populaire</span>
                      )}
                    </div>
                    <div className="text-right">
                      {plan.price_monthly === 0 ? (
                        <span className="font-bold text-green-600 text-sm">Gratuit</span>
                      ) : (
                        <span className="font-bold text-slate-900 text-sm">{(plan.price_monthly / 1000).toFixed(0)}K GNF<span className="text-xs text-slate-400 font-normal">/mois</span></span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.features?.slice(0, 3).map((f: string, i: number) => (
                      <span key={i} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">Vous pouvez changer de plan à tout moment depuis les paramètres</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Retour
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
            >
              Continuer
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {loading ? 'Configuration...' : 'Commencer'}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center">
        En continuant, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité
      </p>
    </div>
  );
}
