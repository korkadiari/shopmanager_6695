'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import { Users, Search, Plus, Eye, Phone, MapPin, TrendingUp, AlertCircle, Star, X, ShoppingBag, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Purchase {
  id: string;
  date: string;
  invoice: string;
  items: string;
  total: number;
  paid: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  installments?: Installment[];
}

interface Installment {
  id: string;
  amount: number;
  date: string;
  method: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string;
  segment: 'vip' | 'regular' | 'new';
  totalPurchases: number;
  totalSpent: number;
  totalDebt: number;
  lastPurchase: string;
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'overdue';
  joinDate: string;
  purchases: Purchase[];
}

const fmt = (n: number) => new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

function dbToCustomer(row: Record<string, unknown>): Customer {
  const segment = (row.segment as string) || 'Nouveau';
  const segmentKey: Customer['segment'] = segment === 'VIP' ? 'vip' : segment === 'Régulier' ? 'regular' : 'new';
  const totalDebt = Number(row.total_debt) || 0;
  const paymentStatus: Customer['paymentStatus'] = totalDebt > 0 ? 'partial' : 'paid';
  return {
    id: row.id as string,
    name: (row.full_name as string) || '',
    phone: (row.phone as string) || '',
    location: (row.address as string) || 'Conakry',
    segment: segmentKey,
    totalPurchases: 0,
    totalSpent: Number(row.total_purchases) || 0,
    totalDebt,
    lastPurchase: row.updated_at ? new Date(row.updated_at as string).toISOString().split('T')[0] : '',
    paymentStatus,
    joinDate: row.created_at ? new Date(row.created_at as string).toISOString().split('T')[0] : '',
    purchases: [],
  };
}

// ─── Partial Payment Modal ────────────────────────────────────────────────────
interface PartialPaymentModalProps {
  customer: Customer;
  purchase: Purchase;
  onClose: () => void;
  onSave: (customerId: string, purchaseId: string, installment: Installment) => void;
}

function PartialPaymentModal({ customer, purchase, onClose, onSave }: PartialPaymentModalProps) {
  const remaining = purchase.total - purchase.paid;
  const installmentCount = purchase.installments?.length || 0;
  const maxInstallments = 3;
  const canAddMore = installmentCount < maxInstallments;

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Espèces');
  const [isProcessing, setIsProcessing] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const isValid = parsedAmount > 0 && parsedAmount <= remaining;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 800));
    const installment: Installment = {
      id: `i-${Date.now()}`,
      amount: parsedAmount,
      date: new Date().toISOString().split('T')[0],
      method,
    };
    onSave(customer.id, purchase.id, installment);
    toast.success('Paiement enregistré', { description: `${fmt(parsedAmount)} reçu de ${customer.name} — Solde mis à jour` });
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-bold text-slate-900">Enregistrer un paiement</h2>
            <p className="text-xs text-slate-500 mt-0.5">{customer.name} · {purchase.invoice}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Versements ({installmentCount}/{maxInstallments})</span>
              {!canAddMore && <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">Limite atteinte</span>}
            </div>
            <div className="flex gap-2 mb-3">
              {Array.from({ length: maxInstallments }).map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-full ${i < installmentCount ? 'bg-amber-500' : 'bg-slate-200'}`} />
              ))}
            </div>
            {purchase.installments && purchase.installments.length > 0 && (
              <div className="space-y-1.5">
                {purchase.installments.map((inst, idx) => (
                  <div key={inst.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Versement {idx + 1} · {inst.method}</span>
                    <span className="font-semibold text-green-700">{fmt(inst.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Total facture</p>
              <p className="text-sm font-bold text-slate-900">{fmt(purchase.total)}</p>
            </div>
            <div className={`rounded-lg p-3 border ${customer.totalDebt > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-xs font-semibold mb-1 ${customer.totalDebt > 0 ? 'text-red-600' : 'text-slate-500'}`}>Reste à payer</p>
              <p className={`text-sm font-bold tabular-nums ${customer.totalDebt > 0 ? 'text-red-700' : 'text-slate-400'}`}>
                {customer.totalDebt > 0 ? fmt(customer.totalDebt) : 'Aucune dette'}
              </p>
            </div>
          </div>
          {canAddMore ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Montant du versement (GNF)</label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-colors bg-slate-50">
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Max: ${fmt(remaining)}`}
                    className="flex-1 text-base font-bold text-slate-900 bg-transparent outline-none tabular-nums" />
                  <span className="text-sm text-slate-500 font-semibold">GNF</span>
                </div>
                {parsedAmount > remaining && <p className="text-xs text-red-500 mt-1">Le montant dépasse le solde restant</p>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {[Math.round(remaining / 3), Math.round(remaining / 2), remaining].map((amt, i) => (
                  <button key={i} onClick={() => setAmount(amt.toString())}
                    className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-semibold hover:bg-amber-100 transition-colors">
                    {i === 0 ? '1/3' : i === 1 ? '1/2' : 'Tout'} · {fmt(amt)}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Méthode de paiement</label>
                <select value={method} onChange={e => setMethod(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 bg-white cursor-pointer">
                  <option>Espèces</option>
                  <option>Orange Money</option>
                  <option>Mobile Money</option>
                  <option>PayCard</option>
                </select>
              </div>
              {parsedAmount > 0 && parsedAmount <= remaining && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-700">Nouveau solde après paiement</span>
                  <span className="text-base font-bold text-green-700">{fmt(remaining - parsedAmount)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <AlertCircle size={20} className="text-red-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-red-700">Limite de 3 versements atteinte</p>
              <p className="text-xs text-red-500 mt-1">Ce client a déjà effectué 3 versements partiels.</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
          {canAddMore && (
            <button onClick={handleSubmit} disabled={!isValid || isProcessing}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${isValid && !isProcessing ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
              {isProcessing ? <><Loader2 size={15} className="animate-spin" />Traitement...</> : <><CheckCircle2 size={15} />Confirmer</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const supabase = createClient();
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'vip' | 'regular' | 'new'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid' | 'overdue'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerLocation, setNewCustomerLocation] = useState('');
  const [newCustomerSegment, setNewCustomerSegment] = useState<'new' | 'regular' | 'vip'>('new');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentModal, setPaymentModal] = useState<{ customer: Customer; purchase: Purchase } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const fetchTenantId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single();
    return data?.tenant_id || null;
  }, [supabase]);

  const fetchCustomers = useCallback(async (tid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', tid)
      .order('full_name');
    if (error) {
      toast.error('Erreur de chargement', { description: error.message });
    } else {
      setCustomers((data || []).map(row => dbToCustomer(row as Record<string, unknown>)));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTenantId().then(tid => {
      if (tid) { setTenantId(tid); fetchCustomers(tid); }
      else setLoading(false);
    });
  }, [fetchTenantId, fetchCustomers]);

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchSegment = segmentFilter === 'all' || c.segment === segmentFilter;
    const matchStatus = statusFilter === 'all' || c.paymentStatus === statusFilter;
    return matchSearch && matchSegment && matchStatus;
  });

  const totalDebt = customers.reduce((s, c) => s + c.totalDebt, 0);
  const vipCount = customers.filter(c => c.segment === 'vip').length;
  const debtors = customers.filter(c => c.totalDebt > 0).length;

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      toast.error('Veuillez remplir le nom et le téléphone');
      return;
    }
    if (!tenantId) { toast.error('Tenant non trouvé'); return; }
    setSaving(true);
    const segmentLabel = newCustomerSegment === 'vip' ? 'VIP' : newCustomerSegment === 'regular' ? 'Régulier' : 'Nouveau';
    const { data, error } = await supabase
      .from('customers')
      .insert({
        tenant_id: tenantId,
        full_name: newCustomerName,
        phone: newCustomerPhone,
        email: newCustomerEmail || null,
        address: newCustomerLocation || 'Conakry',
        segment: segmentLabel,
        total_purchases: 0,
        total_debt: 0,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erreur d\'ajout', { description: error.message });
    } else if (data) {
      setCustomers(prev => [...prev, dbToCustomer(data as Record<string, unknown>)]);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      setNewCustomerLocation('');
      setNewCustomerSegment('new');
      setShowAddModal(false);
      toast.success(`Client ${newCustomerName} ajouté avec succès`);
    }
    setSaving(false);
  };

  const handleInstallmentSave = (customerId: string, purchaseId: string, installment: Installment) => {
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      const updatedPurchases = c.purchases.map(p => {
        if (p.id !== purchaseId) return p;
        const newPaid = p.paid + installment.amount;
        const newInstallments = [...(p.installments || []), installment];
        const newStatus: Purchase['status'] = newPaid >= p.total ? 'paid' : 'partial';
        return { ...p, paid: newPaid, status: newStatus, installments: newInstallments };
      });
      const newTotalDebt = updatedPurchases.reduce((s, p) => s + Math.max(0, p.total - p.paid), 0);
      const hasUnpaid = updatedPurchases.some(p => p.status !== 'paid');
      const newPaymentStatus: Customer['paymentStatus'] = newTotalDebt === 0 ? 'paid' : hasUnpaid ? 'partial' : 'paid';
      return { ...c, purchases: updatedPurchases, totalDebt: newTotalDebt, paymentStatus: newPaymentStatus };
    }));
  };

  const canRegisterPayment = (customer: Customer) =>
    ['partial', 'unpaid', 'overdue'].includes(customer.paymentStatus);

  const segmentBadge = (segment: Customer['segment']) => {
    if (segment === 'vip') return 'bg-purple-100 text-purple-700';
    if (segment === 'regular') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-600';
  };
  const segmentLabel = (segment: Customer['segment']) => segment === 'vip' ? 'VIP' : segment === 'regular' ? 'Régulier' : 'Nouveau';

  return (
    <AppLayout>
      <Topbar title="Clients" subtitle="Gestion de la clientèle et suivi des dettes" />
      <div className="px-4 lg:px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Clients', value: customers.length.toString(), icon: Users, bg: 'bg-blue-100', color: 'text-blue-600', sub: `${vipCount} VIP` },
            { label: 'Clients VIP', value: vipCount.toString(), icon: Star, bg: 'bg-purple-100', color: 'text-purple-600', sub: 'Fidèles actifs' },
            { label: 'Total Dettes', value: fmt(totalDebt), icon: AlertCircle, bg: 'bg-red-100', color: 'text-red-600', sub: `${debtors} clients débiteurs` },
            { label: 'Chiffre d\'affaires', value: fmt(customers.reduce((s, c) => s + c.totalSpent, 0)), icon: TrendingUp, bg: 'bg-green-100', color: 'text-green-600', sub: 'Cumulé total' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon size={20} className={card.color} />
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{card.label}</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums leading-tight">{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-xs focus-within:border-amber-400 transition-all">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input type="text" placeholder="Rechercher client, téléphone..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value as typeof segmentFilter)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400 cursor-pointer">
                <option value="all">Tous segments</option>
                <option value="vip">VIP</option>
                <option value="regular">Régulier</option>
                <option value="new">Nouveau</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400 cursor-pointer">
                <option value="all">Tous statuts</option>
                <option value="paid">Payé</option>
                <option value="partial">Partiel</option>
                <option value="unpaid">Impayé</option>
                <option value="overdue">En retard</option>
              </select>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                <Plus size={15} />Nouveau client
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-amber-500" />
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Client', 'Téléphone', 'Localisation', 'Segment', 'Total dépensé', 'Dette', 'Statut paiement', 'Date d\'inscription', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-slate-400">
                      <Users size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Aucun client trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(customer => (
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-amber-700">{customer.name.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{customer.name}</p>
                            <p className="text-xs text-slate-400">{customer.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone size={12} className="text-slate-400" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin size={12} className="text-slate-400" />
                          {customer.location}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${segmentBadge(customer.segment)}`}>
                          {segmentLabel(customer.segment)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 tabular-nums">{fmt(customer.totalSpent)}</td>
                      <td className="px-4 py-3">
                        {customer.totalDebt > 0 ? (
                          <span className="text-sm font-bold text-red-600 tabular-nums">{fmt(customer.totalDebt)}</span>
                        ) : (
                          <span className="text-sm text-green-600 font-semibold">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={customer.paymentStatus === 'paid' ? 'active' : customer.paymentStatus === 'partial' ? 'pending' : 'inactive'}
                          label={customer.paymentStatus === 'paid' ? 'Payé' : customer.paymentStatus === 'partial' ? 'Partiel' : customer.paymentStatus === 'unpaid' ? 'Impayé' : 'En retard'}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{customer.joinDate ? fmtDate(customer.joinDate) : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedCustomer(customer)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors" title="Voir détails">
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-900">Nouveau client</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom complet *</label>
                <input value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="Ex: Mamadou Bah"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Téléphone *</label>
                <input value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} placeholder="+224 6XX XX XX XX"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                <input type="email" value={newCustomerEmail} onChange={e => setNewCustomerEmail(e.target.value)} placeholder="email@exemple.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Localisation</label>
                <input value={newCustomerLocation} onChange={e => setNewCustomerLocation(e.target.value)} placeholder="Ex: Ratoma, Conakry"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Segment</label>
                <select value={newCustomerSegment} onChange={e => setNewCustomerSegment(e.target.value as typeof newCustomerSegment)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-white cursor-pointer">
                  <option value="new">Nouveau</option>
                  <option value="regular">Régulier</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleAddCustomer} disabled={saving}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 size={15} className="animate-spin" />Enregistrement...</> : 'Ajouter le client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-700">{selectedCustomer.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">{selectedCustomer.name}</h2>
                  <p className="text-xs text-slate-500">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Total dépensé</p>
                  <p className="text-base font-bold text-slate-900">{fmt(selectedCustomer.totalSpent)}</p>
                </div>
                <div className={`rounded-xl p-3 border ${selectedCustomer.totalDebt > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <p className="text-xs text-slate-500 mb-1">Dette actuelle</p>
                  <p className={`text-base font-bold ${selectedCustomer.totalDebt > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {selectedCustomer.totalDebt > 0 ? fmt(selectedCustomer.totalDebt) : 'Aucune dette'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin size={14} className="text-slate-400" />
                <span>{selectedCustomer.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Calendar size={14} className="text-slate-400" />
                <span>Client depuis {selectedCustomer.joinDate ? fmtDate(selectedCustomer.joinDate) : '—'}</span>
              </div>
              {selectedCustomer.purchases.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingBag size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun achat enregistré</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {paymentModal && (
        <PartialPaymentModal
          customer={paymentModal.customer}
          purchase={paymentModal.purchase}
          onClose={() => setPaymentModal(null)}
          onSave={handleInstallmentSave}
        />
      )}
    </AppLayout>
  );
}
