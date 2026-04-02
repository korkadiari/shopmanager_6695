'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { CreditCard, Zap, Users, Package, Calendar, Download, ArrowUpCircle, ArrowDownCircle, CheckCircle, Clock, XCircle, AlertTriangle, ChevronDown, ChevronUp, TrendingUp, Store, ShoppingCart, FileText, X, Check, Star } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


// ─── Types ───────────────────────────────────────────────────────────────────
interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  limits: { shops: number; users: number; products: number; transactions: number };
  color: string;
  popular?: boolean;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'Payée' | 'En attente' | 'Échouée';
  period: string;
  plan: string;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'trial' | 'suspended';
  renewalDate: string;
  shops: number;
  users: number;
  mrr: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 100_000,
    currency: 'GNF',
    period: 'mois',
    color: 'slate',
    features: ['1 boutique', '3 utilisateurs', '500 produits', 'Rapports basiques', 'Support email'],
    limits: { shops: 1, users: 3, products: 500, transactions: 1000 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 350_000,
    currency: 'GNF',
    period: 'mois',
    color: 'amber',
    popular: true,
    features: ['5 boutiques', '15 utilisateurs', '5 000 produits', 'Rapports avancés', 'IA intégrée', 'Support prioritaire'],
    limits: { shops: 5, users: 15, products: 5000, transactions: 10000 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 700_000,
    currency: 'GNF',
    period: 'mois',
    color: 'violet',
    features: ['Boutiques illimitées', 'Utilisateurs illimités', 'Produits illimités', 'API accès', 'SLA garanti', 'Support dédié'],
    limits: { shops: 999, users: 999, products: 999999, transactions: 999999 },
  },
];

const currentPlan = plans[1]; // Pro

const usageMetrics = {
  shops: { used: 3, limit: 5, label: 'Boutiques', icon: Store },
  users: { used: 9, limit: 15, label: 'Utilisateurs', icon: Users },
  products: { used: 2_847, limit: 5000, label: 'Produits', icon: Package },
  transactions: { used: 6_420, limit: 10000, label: 'Transactions/mois', icon: ShoppingCart },
};

const invoices: Invoice[] = [
  { id: 'inv-001', number: 'INV-2026-012', date: '01 Avr 2026', amount: 350_000, status: 'Payée', period: 'Avr 2026', plan: 'Pro' },
  { id: 'inv-002', number: 'INV-2026-011', date: '01 Mar 2026', amount: 350_000, status: 'Payée', period: 'Mar 2026', plan: 'Pro' },
  { id: 'inv-003', number: 'INV-2026-010', date: '01 Fév 2026', amount: 350_000, status: 'Payée', period: 'Fév 2026', plan: 'Pro' },
  { id: 'inv-004', number: 'INV-2026-009', date: '01 Jan 2026', amount: 100_000, status: 'Payée', period: 'Jan 2026', plan: 'Starter' },
  { id: 'inv-005', number: 'INV-2025-012', date: '01 Déc 2025', amount: 100_000, status: 'Payée', period: 'Déc 2025', plan: 'Starter' },
  { id: 'inv-006', number: 'INV-2025-011', date: '01 Nov 2025', amount: 100_000, status: 'Échouée', period: 'Nov 2025', plan: 'Starter' },
];

const tenants: Tenant[] = [
  { id: 't1', name: 'Boutique Conakry SARL', email: 'admin@conakry.gn', plan: 'Pro', status: 'active', renewalDate: '01 Mai 2026', shops: 3, users: 9, mrr: 350_000 },
  { id: 't2', name: 'Kindia Commerce', email: 'contact@kindia.gn', plan: 'Starter', status: 'active', renewalDate: '15 Avr 2026', shops: 1, users: 2, mrr: 100_000 },
  { id: 't3', name: 'Labé Distribution', email: 'info@labe.gn', plan: 'Enterprise', status: 'active', renewalDate: '01 Jun 2026', shops: 8, users: 24, mrr: 700_000 },
  { id: 't4', name: 'Mamou Tech', email: 'mamou@tech.gn', plan: 'Pro', status: 'trial', renewalDate: '20 Avr 2026', shops: 2, users: 5, mrr: 0 },
  { id: 't5', name: 'Faranah Store', email: 'store@faranah.gn', plan: 'Starter', status: 'suspended', renewalDate: '—', shops: 1, users: 1, mrr: 0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtNum(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n);
}

function fmt(n: number) {
  return fmtNum(n) + ' GNF';
}

function pct(used: number, limit: number) {
  if (limit >= 999) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

function barColor(p: number) {
  if (p >= 90) return 'bg-red-500';
  if (p >= 70) return 'bg-amber-500';
  return 'bg-emerald-500';
}

const statusBadge: Record<Invoice['status'], { label: string; cls: string; icon: React.ElementType }> = {
  'Payée': { label: 'Payée', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', icon: CheckCircle },
  'En attente': { label: 'En attente', cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30', icon: Clock },
  'Échouée': { label: 'Échouée', cls: 'bg-red-500/15 text-red-400 border border-red-500/30', icon: XCircle },
};

const tenantStatusBadge: Record<Tenant['status'], { label: string; cls: string }> = {
  active: { label: 'Actif', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  trial: { label: 'Essai', cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
  suspended: { label: 'Suspendu', cls: 'bg-red-500/15 text-red-400 border border-red-500/30' },
};

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, current, onSelect }: { plan: Plan; current: boolean; onSelect: () => void }) {
  const colorMap: Record<string, string> = {
    slate: 'border-slate-600 bg-slate-800/60',
    amber: 'border-amber-500/60 bg-amber-500/5',
    violet: 'border-violet-500/60 bg-violet-500/5',
  };
  const btnMap: Record<string, string> = {
    slate: 'bg-slate-700 hover:bg-slate-600 text-white',
    amber: 'bg-amber-500 hover:bg-amber-400 text-slate-900',
    violet: 'bg-violet-600 hover:bg-violet-500 text-white',
  };
  return (
    <div className={`relative rounded-xl border p-5 flex flex-col gap-4 transition-all ${colorMap[plan.color]} ${current ? 'ring-2 ring-amber-500' : ''}`}>
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
          <Star size={10} /> Populaire
        </span>
      )}
      {current && (
        <span className="absolute top-3 right-3 bg-amber-500/20 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-500/40">
          Actuel
        </span>
      )}
      <div>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{plan.name}</p>
        <p className="text-2xl font-bold text-white mt-1">{fmt(plan.price)}<span className="text-sm font-normal text-slate-400">/{plan.period}</span></p>
      </div>
      <ul className="space-y-1.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
            <Check size={13} className="text-emerald-400 shrink-0" />{f}
          </li>
        ))}
      </ul>
      {!current && (
        <button onClick={onSelect} className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${btnMap[plan.color]}`}>
          {plan.price > currentPlan.price ? 'Passer à ce plan' : 'Rétrograder'}
        </button>
      )}
    </div>
  );
}

// ─── Upgrade/Downgrade Modal ──────────────────────────────────────────────────
function PlanChangeModal({ plan, onClose, onConfirm }: { plan: Plan; onClose: () => void; onConfirm: () => void }) {
  const isUpgrade = plan.price > currentPlan.price;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {isUpgrade
              ? <ArrowUpCircle size={22} className="text-emerald-400" />
              : <ArrowDownCircle size={22} className="text-amber-400" />}
            <h2 className="text-base font-bold text-white">
              {isUpgrade ? 'Passer au plan' : 'Rétrograder vers'} {plan.name}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Plan actuel</span>
              <span className="text-white font-semibold">{currentPlan.name} — {fmt(currentPlan.price)}/mois</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Nouveau plan</span>
              <span className="text-white font-semibold">{plan.name} — {fmt(plan.price)}/mois</span>
            </div>
            <div className="border-t border-slate-700 pt-3 flex justify-between text-sm">
              <span className="text-slate-400">Différence mensuelle</span>
              <span className={`font-bold ${plan.price > currentPlan.price ? 'text-emerald-400' : 'text-amber-400'}`}>
                {plan.price > currentPlan.price ? '+' : ''}{fmt(plan.price - currentPlan.price)}/mois
              </span>
            </div>
          </div>
          {!isUpgrade && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                En rétrogradant, vous perdrez l'accès aux fonctionnalités avancées. Vos données seront conservées mais certaines boutiques/utilisateurs pourraient être désactivés si les limites sont dépassées.
              </p>
            </div>
          )}
          <p className="text-xs text-slate-500">
            Le changement prendra effet immédiatement. La facturation sera ajustée au prorata pour le reste du mois en cours.
          </p>
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${isUpgrade ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-900'}`}
          >
            Confirmer {isUpgrade ? 'la mise à niveau' : 'la rétrogradation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants'>('overview');
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);

  const renewalDate = '01 Mai 2026';
  const daysLeft = 29;

  function handlePlanSelect(plan: Plan) {
    setSelectedPlan(plan);
  }

  function handleConfirm() {
    setShowConfirm(true);
  }

  function handleFinalConfirm() {
    setShowConfirm(false);
    setSelectedPlan(null);
    // In production: call Supabase/Stripe API here
  }

  function downloadInvoice(inv: Invoice) {
    // In production: generate/fetch PDF from backend
    const content = `FACTURE ${inv.number}\nDate: ${inv.date}\nPériode: ${inv.period}\nPlan: ${inv.plan}\nMontant: ${fmt(inv.amount)}\nStatut: ${inv.status}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppLayout>
      <Topbar title="Abonnement" subtitle="Gestion des plans, usage et facturation" />

      <div className="px-4 lg:px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1 w-fit border border-slate-700">
          {[
            { id: 'overview', label: 'Vue d\'ensemble' },
            { id: 'tenants', label: 'Tenants' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-amber-500 text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* ── Plan Overview + Renewal ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Current Plan Card */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Plan actuel</p>
                    <div className="flex items-center gap-3 mt-1">
                      <h2 className="text-2xl font-bold text-white">{currentPlan.name}</h2>
                      <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40">Actif</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{fmt(currentPlan.price)} / mois · Renouvellement le <span className="text-white font-medium">{renewalDate}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-slate-500" />
                    <span className="text-sm text-slate-400">Visa •••• 4242</span>
                  </div>
                </div>

                {/* Usage bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {Object.entries(usageMetrics).map(([key, m]) => {
                    const p = pct(m.used, m.limit);
                    const Icon = m.icon;
                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Icon size={13} className="text-slate-500" />
                            <span className="text-xs text-slate-400">{m.label}</span>
                          </div>
                          <span className="text-xs text-slate-300 font-medium">
                            {fmtNum(m.used)} / {m.limit >= 999 ? '∞' : fmtNum(m.limit)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${barColor(p)}`}
                            style={{ width: `${m.limit >= 999 ? 60 : p}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-600">{m.limit >= 999 ? 'Illimité' : `${p}% utilisé`}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Renewal Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-amber-400" />
                    <p className="text-sm font-semibold text-slate-300">Prochain renouvellement</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{renewalDate}</p>
                  <p className="text-sm text-slate-400 mt-1">dans <span className="text-amber-400 font-semibold">{daysLeft} jours</span></p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Montant dû</span>
                    <span className="text-white font-bold">{fmt(currentPlan.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Mode de paiement</span>
                    <span className="text-white">Visa •••• 4242</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Renouvellement auto</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1"><CheckCircle size={12} /> Activé</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors border border-slate-700">
                    Mettre à jour le paiement
                  </button>
                  <button className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm transition-colors border border-slate-700">
                    Annuler l'abonnement
                  </button>
                </div>
              </div>
            </div>

            {/* ── Plans Grid ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">Changer de plan</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    current={p.id === currentPlan.id}
                    onSelect={() => handlePlanSelect(p)}
                  />
                ))}
              </div>
            </div>

            {/* ── Billing History ── */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />
                  <h3 className="text-base font-bold text-white">Historique de facturation</h3>
                </div>
                <span className="text-xs text-slate-500">{invoices.length} factures</span>
              </div>

              {/* Table desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['Numéro', 'Date', 'Période', 'Plan', 'Montant', 'Statut', ''].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {invoices.map((inv) => {
                      const s = statusBadge[inv.status];
                      const SIcon = s.icon;
                      return (
                        <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-slate-300 text-xs">{inv.number}</td>
                          <td className="px-5 py-3.5 text-slate-300">{inv.date}</td>
                          <td className="px-5 py-3.5 text-slate-400">{inv.period}</td>
                          <td className="px-5 py-3.5">
                            <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-md">{inv.plan}</span>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-white">{fmt(inv.amount)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.cls}`}>
                              <SIcon size={11} />{s.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => downloadInvoice(inv)}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
                            >
                              <Download size={13} /> Télécharger
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-800">
                {invoices.map((inv) => {
                  const s = statusBadge[inv.status];
                  const SIcon = s.icon;
                  return (
                    <div key={inv.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-slate-300">{inv.number}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>
                          <SIcon size={10} />{s.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{fmt(inv.amount)}</span>
                        <span className="text-xs text-slate-400">{inv.date}</span>
                      </div>
                      <button
                        onClick={() => downloadInvoice(inv)}
                        className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Download size={12} /> Télécharger la facture
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Tenants Tab ── */}
        {activeTab === 'tenants' && (
          <div className="space-y-4">
            {/* Summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Tenants actifs', value: tenants.filter(t => t.status === 'active').length, icon: CheckCircle, color: 'text-emerald-400' },
                { label: 'En essai', value: tenants.filter(t => t.status === 'trial').length, icon: Clock, color: 'text-blue-400' },
                { label: 'Suspendus', value: tenants.filter(t => t.status === 'suspended').length, icon: XCircle, color: 'text-red-400' },
                { label: 'MRR total', value: fmt(tenants.reduce((s, t) => s + t.mrr, 0)), icon: TrendingUp, color: 'text-amber-400' },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                    <Icon size={20} className={m.color} />
                    <div>
                      <p className="text-xs text-slate-500">{m.label}</p>
                      <p className="text-lg font-bold text-white">{m.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tenant list */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Tenants</h3>
              </div>
              <div className="divide-y divide-slate-800">
                {tenants.map((tenant) => {
                  const sb = tenantStatusBadge[tenant.status];
                  const isExpanded = expandedTenant === tenant.id;
                  const tenantInvoices = invoices.slice(0, 3); // mock: same invoices per tenant
                  return (
                    <div key={tenant.id}>
                      <button
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors text-left"
                        onClick={() => setExpandedTenant(isExpanded ? null : tenant.id)}
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                          <Store size={16} className="text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-white truncate">{tenant.name}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sb.cls}`}>{sb.label}</span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{tenant.email}</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-6 text-right shrink-0">
                          <div>
                            <p className="text-xs text-slate-500">Plan</p>
                            <p className="text-sm font-semibold text-white">{tenant.plan}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">MRR</p>
                            <p className="text-sm font-semibold text-amber-400">{tenant.mrr > 0 ? fmt(tenant.mrr) : '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Renouvellement</p>
                            <p className="text-sm text-slate-300">{tenant.renewalDate}</p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-500 shrink-0" /> : <ChevronDown size={16} className="text-slate-500 shrink-0" />}
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 bg-slate-800/30 space-y-4">
                          {/* Usage */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            {[
                              { label: 'Boutiques', value: tenant.shops },
                              { label: 'Utilisateurs', value: tenant.users },
                              { label: 'Plan', value: tenant.plan },
                              { label: 'Statut', value: sb.label },
                            ].map((m) => (
                              <div key={m.label} className="bg-slate-800 rounded-lg p-3">
                                <p className="text-xs text-slate-500">{m.label}</p>
                                <p className="text-sm font-bold text-white mt-0.5">{m.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Invoices for tenant */}
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Factures récentes</p>
                            <div className="space-y-2">
                              {tenantInvoices.map((inv) => {
                                const s = statusBadge[inv.status];
                                const SIcon = s.icon;
                                return (
                                  <div key={inv.id} className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-2.5">
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono text-xs text-slate-400">{inv.number}</span>
                                      <span className="text-xs text-slate-500">{inv.date}</span>
                                      <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>
                                        <SIcon size={10} />{s.label}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-semibold text-white">{fmt(inv.amount)}</span>
                                      <button
                                        onClick={() => downloadInvoice(inv)}
                                        className="text-slate-400 hover:text-amber-400 transition-colors"
                                        title="Télécharger"
                                      >
                                        <Download size={14} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-wrap">
                            <button className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/25 transition-colors flex items-center gap-1.5">
                              <ArrowUpCircle size={13} /> Changer de plan
                            </button>
                            {tenant.status === 'active' && (
                              <button className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/20 transition-colors">
                                Suspendre
                              </button>
                            )}
                            {tenant.status === 'suspended' && (
                              <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                                Réactiver
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Plan Change Modal ── */}
      {selectedPlan && !showConfirm && (
        <PlanChangeModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onConfirm={handleConfirm}
        />
      )}

      {/* ── Confirmation Modal ── */}
      {showConfirm && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Confirmer le changement</h3>
              <p className="text-sm text-slate-400 mt-1">
                Vous allez passer au plan <span className="text-white font-semibold">{selectedPlan.name}</span> pour <span className="text-amber-400 font-semibold">{fmt(selectedPlan.price)}/mois</span>.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors">
                Retour
              </button>
              <button onClick={handleFinalConfirm} className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
