'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Truck, Search, Plus, Edit2, Trash2, X, Save, Phone, Mail, MapPin, FileText, AlertCircle, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  paid: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  description: string;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  category: string;
  paymentTerms: string;
  creditLimit: number;
  outstandingBalance: number;
  totalOrders: number;
  invoices: Invoice[];
  active: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const PAYMENT_TERMS = ['Net 7', 'Net 15', 'Net 30', 'Net 60', 'Comptant', '50% avance / 50% livraison'];
const CATEGORIES = ['Électronique', 'Accessoires', 'Audio', 'Téléphonie', 'Informatique', 'Autre'];

const STATUS_COLORS: Record<Invoice['status'], string> = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  unpaid: 'bg-red-100 text-red-700',
  overdue: 'bg-red-200 text-red-800',
};
const STATUS_LABELS: Record<Invoice['status'], string> = {
  paid: 'Payé', partial: 'Partiel', unpaid: 'Impayé', overdue: 'En retard',
};

function dbToSupplier(row: Record<string, unknown>): Supplier {
  return {
    id: row.id as string,
    name: (row.name as string) || '',
    contact: (row.contact as string) || '',
    email: (row.email as string) || '',
    phone: (row.phone as string) || '',
    address: (row.address as string) || '',
    city: (row.city as string) || 'Conakry',
    category: (row.category as string) || 'Électronique',
    paymentTerms: (row.payment_terms as string) || 'Net 30',
    creditLimit: Number(row.credit_limit) || 0,
    outstandingBalance: Number(row.outstanding_balance) || 0,
    totalOrders: Number(row.total_orders) || 0,
    invoices: [],
    active: row.active !== false,
  };
}

// ─── Supplier Modal ────────────────────────────────────────────────────────────
interface SupplierModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (s: Supplier) => void;
  saving: boolean;
}

function SupplierModal({ supplier, onClose, onSave, saving }: SupplierModalProps) {
  const [form, setForm] = useState<Supplier>(
    supplier ?? {
      id: '', name: '', contact: '', email: '', phone: '',
      address: '', city: 'Conakry', category: 'Électronique', paymentTerms: 'Net 30',
      creditLimit: 0, outstandingBalance: 0, totalOrders: 0, invoices: [], active: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-slate-800 text-lg">{supplier ? 'Modifier fournisseur' : 'Nouveau fournisseur'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={18} className="text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom du fournisseur *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="Ex: Samsung Electronics GN" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Personne de contact</label>
              <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="Nom du contact" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catégorie</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-white">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="email@fournisseur.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Téléphone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="+224 6XX XX XX XX" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adresse</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="Adresse complète" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ville</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="Ex: Conakry" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Conditions de paiement</label>
              <select value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-white">
                {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Limite de crédit (GNF)</label>
              <input type="number" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: Number(e.target.value) }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="0" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
                <span className="text-sm font-semibold text-slate-700">Fournisseur actif</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 size={14} className="animate-spin" />Enregistrement...</> : <><Save size={14} />Enregistrer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────
interface DeleteConfirmProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}
function DeleteConfirm({ name, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={20} className="text-red-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900 text-center mb-2">Supprimer ce fournisseur ?</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          <span className="font-semibold text-slate-700">{name}</span> sera supprimé définitivement.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">Annuler</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all">Supprimer</button>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const supabase = createClient();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [modalSupplier, setModalSupplier] = useState<Supplier | null | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const fetchTenantId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single();
    return data?.tenant_id || null;
  }, [supabase]);

  const fetchSuppliers = useCallback(async (tid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('tenant_id', tid)
      .order('name');
    if (error) {
      toast.error('Erreur de chargement', { description: error.message });
    } else {
      setSuppliers((data || []).map(row => dbToSupplier(row as Record<string, unknown>)));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTenantId().then(tid => {
      if (tid) { setTenantId(tid); fetchSuppliers(tid); }
      else setLoading(false);
    });
  }, [fetchTenantId, fetchSuppliers]);

  const filtered = suppliers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'Tous' || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleSave = async (s: Supplier) => {
    if (!tenantId) { toast.error('Tenant non trouvé'); return; }
    setSaving(true);
    const payload = {
      tenant_id: tenantId,
      name: s.name,
      contact: s.contact,
      email: s.email,
      phone: s.phone,
      address: s.address,
      city: s.city,
      category: s.category,
      payment_terms: s.paymentTerms,
      credit_limit: s.creditLimit,
      outstanding_balance: s.outstandingBalance,
      total_orders: s.totalOrders,
      active: s.active,
    };

    if (s.id) {
      // Update
      const { data, error } = await supabase.from('suppliers').update(payload).eq('id', s.id).select().single();
      if (error) {
        toast.error('Erreur de mise à jour', { description: error.message });
      } else if (data) {
        setSuppliers(prev => prev.map(x => x.id === s.id ? { ...dbToSupplier(data as Record<string, unknown>), invoices: x.invoices } : x));
        toast.success(s.name, { description: 'Fournisseur mis à jour avec succès' });
      }
    } else {
      // Insert
      const { data, error } = await supabase.from('suppliers').insert(payload).select().single();
      if (error) {
        toast.error('Erreur d\'ajout', { description: error.message });
      } else if (data) {
        setSuppliers(prev => [...prev, dbToSupplier(data as Record<string, unknown>)]);
        toast.success(s.name, { description: 'Fournisseur ajouté avec succès' });
      }
    }
    setSaving(false);
    setModalSupplier(undefined);
  };

  const handleDelete = async (id: string) => {
    const s = suppliers.find(x => x.id === id);
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) {
      toast.error('Erreur de suppression', { description: error.message });
    } else {
      setSuppliers(prev => prev.filter(x => x.id !== id));
      toast.success('Fournisseur supprimé', { description: s?.name });
    }
    setDeleteConfirm(null);
  };

  const totalOutstanding = suppliers.reduce((s, x) => s + x.outstandingBalance, 0);
  const activeCount = suppliers.filter(s => s.active).length;
  const totalOrders = suppliers.reduce((s, x) => s + x.totalOrders, 0);

  return (
    <AppLayout>
      <Topbar title="Fournisseurs" subtitle="Gestion des fournisseurs, factures et soldes" />
      <div className="px-4 lg:px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total fournisseurs', value: suppliers.length, sub: `${activeCount} actifs`, color: 'text-slate-700', bg: 'bg-slate-100', icon: Truck },
            { label: 'Fournisseurs actifs', value: activeCount, sub: 'En activité', color: 'text-green-700', bg: 'bg-green-100', icon: Check },
            { label: 'Soldes impayés', value: fmt(totalOutstanding), sub: `${suppliers.filter(s => s.outstandingBalance > 0).length} fournisseurs`, color: 'text-red-700', bg: 'bg-red-100', icon: AlertCircle },
            { label: 'Total commandes', value: totalOrders, sub: 'Toutes périodes', color: 'text-amber-700', bg: 'bg-amber-100', icon: FileText },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon size={18} className={card.color} />
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{card.label}</p>
              <p className={`text-xl font-bold ${card.color} tabular-nums`}>{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-xs focus-within:border-amber-400 transition-all">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input type="text" placeholder="Rechercher fournisseur, contact..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400 cursor-pointer">
                <option value="Tous">Toutes catégories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={() => setModalSupplier(null)}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                <Plus size={15} />Nouveau fournisseur
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-amber-500" />
            </div>
          ) : (
          <div className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Truck size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucun fournisseur trouvé</p>
              </div>
            ) : (
              filtered.map(supplier => (
                <div key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Supplier Row */}
                  <div className="flex items-center gap-4 px-4 py-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${supplier.active ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                      {supplier.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm">{supplier.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${supplier.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {supplier.active ? 'Actif' : 'Inactif'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">{supplier.category}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Phone size={10} />{supplier.phone}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} />{supplier.email}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} />{supplier.city}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Conditions</p>
                        <p className="text-xs font-semibold text-slate-700">{supplier.paymentTerms}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Commandes</p>
                        <p className="text-sm font-bold text-slate-900">{supplier.totalOrders}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Solde dû</p>
                        <p className={`text-sm font-bold tabular-nums ${supplier.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {supplier.outstandingBalance > 0 ? fmt(supplier.outstandingBalance) : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setExpandedId(expandedId === supplier.id ? null : supplier.id)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-600 px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors font-semibold">
                        <FileText size={13} />
                        <span className="hidden sm:inline">Factures</span>
                        {expandedId === supplier.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      <button onClick={() => setModalSupplier(supplier)}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors" title="Modifier">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(supplier.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors" title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Invoice History (expanded) */}
                  {expandedId === supplier.id && (
                    <div className="px-4 pb-4">
                      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-100">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Historique des factures</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Limite crédit: <span className="font-semibold text-slate-700">{fmt(supplier.creditLimit)}</span></span>
                            {supplier.outstandingBalance > 0 && (
                              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                                Solde dû: {fmt(supplier.outstandingBalance)}
                              </span>
                            )}
                          </div>
                        </div>
                        {supplier.invoices.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-sm">Aucune facture enregistrée</div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {supplier.invoices.map(inv => (
                              <div key={inv.id} className="flex items-center gap-4 px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                  <FileText size={14} className="text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-slate-700">{inv.id}</p>
                                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${STATUS_COLORS[inv.status]}`}>
                                      {STATUS_LABELS[inv.status]}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 truncate mt-0.5">{inv.description}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs font-bold text-slate-900 tabular-nums">{fmt(inv.amount)}</p>
                                  <p className="text-xs text-slate-400">{fmtDate(inv.date)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          )}
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            {filtered.length} fournisseur(s) affiché(s) sur {suppliers.length}
          </div>
        </div>
      </div>

      {modalSupplier !== undefined && (
        <SupplierModal supplier={modalSupplier} onClose={() => setModalSupplier(undefined)} onSave={handleSave} saving={saving} />
      )}
      {deleteConfirm && (
        <DeleteConfirm
          name={suppliers.find(s => s.id === deleteConfirm)?.name ?? ''}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </AppLayout>
  );
}
