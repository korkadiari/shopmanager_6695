'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, UserPlus, Percent, X, Phone, Search, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { CartItem } from './POSLayout';

interface CustomerInfo {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  segment: string;
}

interface Props {
  cart: CartItem[];
  discount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  selectedCustomer: string;
  onDiscountChange: (v: number) => void;
  onCustomerChange: (v: string) => void;
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onClear: () => void;
}

// Add New Client Modal
function AddClientModal({
  phone,
  onClose,
  onSaved,
}: {
  phone: string;
  onClose: () => void;
  onSaved: (customer: CustomerInfo) => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({ full_name: '', phone, email: '', segment: 'Nouveau' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError('Le nom est requis'); return; }
    setSaving(true);
    setError('');
    try {
      // Try Supabase first, fall back to local mock
      const { data, error: dbErr } = await supabase
        .from('customers')
        .insert({
          full_name: form.full_name,
          phone: form.phone,
          email: form.email || null,
          segment: form.segment,
        })
        .select()
        .single();

      if (dbErr) {
        // Fallback: create local customer object
        const localCustomer: CustomerInfo = {
          id: `local-${Date.now()}`,
          full_name: form.full_name,
          phone: form.phone,
          email: form.email,
          segment: form.segment,
        };
        onSaved(localCustomer);
      } else {
        onSaved({
          id: data.id,
          full_name: data.full_name,
          phone: data.phone,
          email: data.email,
          segment: data.segment,
        });
      }
    } catch {
      const localCustomer: CustomerInfo = {
        id: `local-${Date.now()}`,
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        segment: form.segment,
      };
      onSaved(localCustomer);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900">Nouveau client</h3>
            <p className="text-xs text-slate-500 mt-0.5">Numéro introuvable — créer le profil</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Ex: Mamadou Bah"
              autoFocus
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+224 6XX XX XX XX"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email <span className="text-slate-400 font-normal">(optionnel)</span></label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="client@email.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Segment</label>
            <select
              value={form.segment}
              onChange={e => setForm(p => ({ ...p, segment: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 transition-colors bg-white"
            >
              <option value="Nouveau">Nouveau</option>
              <option value="Régulier">Régulier</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {saving ? 'Enregistrement...' : 'Ajouter le client'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SalesCart({
  cart, discount, subtotal, discountAmount, total,
  selectedCustomer, onDiscountChange, onCustomerChange,
  onUpdateQuantity, onRemoveItem, onCheckout, onClear,
}: Props) {
  const supabase = createClient();
  const [phoneQuery, setPhoneQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<CustomerInfo | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [discountInput, setDiscountInput] = useState(discount.toString());
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Mock customers for fallback
  const mockCustomers: CustomerInfo[] = [
    { id: 'cust-001', full_name: 'Mamadou Bah', phone: '628456789', segment: 'VIP' },
    { id: 'cust-002', full_name: 'Fatoumata Camara', phone: '624123456', segment: 'Régulier' },
    { id: 'cust-003', full_name: 'Ibrahim Diallo', phone: '621987654', segment: 'Régulier' },
    { id: 'cust-004', full_name: 'Aissatou Sow', phone: '625334455', segment: 'Nouveau' },
    { id: 'cust-005', full_name: 'Oumar Kouyaté', phone: '629112233', segment: 'VIP' },
  ];

  const normalizePhone = (p: string) => p.replace(/[\s\-\+\(\)]/g, '');

  const searchByPhone = async (query: string) => {
    const normalized = normalizePhone(query);
    if (normalized.length < 6) { setFoundCustomer(null); return; }

    setSearching(true);
    try {
      // Try Supabase
      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name, phone, email, segment')
        .ilike('phone', `%${normalized}%`)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setFoundCustomer(data);
        return;
      }

      // Fallback to mock
      const mock = mockCustomers.find(c => normalizePhone(c.phone).includes(normalized));
      if (mock) {
        setFoundCustomer(mock);
      } else {
        setFoundCustomer(null);
      }
    } catch {
      const mock = mockCustomers.find(c => normalizePhone(c.phone).includes(normalized));
      setFoundCustomer(mock || null);
    } finally {
      setSearching(false);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhoneQuery(val);
    setFoundCustomer(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.trim().length >= 6) {
      searchTimeout.current = setTimeout(() => searchByPhone(val), 500);
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchByPhone(phoneQuery);
    }
  };

  const handleSelectFound = () => {
    if (!foundCustomer) return;
    onCustomerChange(foundCustomer.id);
    setPhoneQuery('');
    setFoundCustomer(null);
  };

  const handleNotFound = () => {
    setShowAddModal(true);
  };

  const handleClientAdded = (customer: CustomerInfo) => {
    setFoundCustomer(customer);
    onCustomerChange(customer.id);
    setShowAddModal(false);
    setPhoneQuery('');
    setFoundCustomer(null);
  };

  const handleDiscountBlur = () => {
    const val = parseFloat(discountInput);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      onDiscountChange(val);
    } else {
      setDiscountInput(discount.toString());
    }
  };

  const selectedCustId = selectedCustomer;

  const segmentColor = (seg: string) =>
    seg === 'VIP' ? 'bg-purple-100 text-purple-700' :
    seg === 'Régulier' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600';

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-amber-600" />
            <span className="font-bold text-slate-900 text-sm">Panier</span>
            {cart.length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <X size={12} /> Vider
            </button>
          )}
        </div>

        {/* Client lookup by phone */}
        <div className="px-4 py-3 border-b border-slate-100 space-y-2">
          {/* Phone search */}
          <div className="relative">
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-amber-400 transition-colors bg-slate-50">
              <Phone size={13} className="text-slate-400 shrink-0" />
              <input
                type="tel"
                value={phoneQuery}
                onChange={e => handlePhoneChange(e.target.value)}
                onKeyDown={handlePhoneKeyDown}
                placeholder="Rechercher client par téléphone..."
                className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
              />
              {searching && <Loader2 size={13} className="text-amber-500 animate-spin shrink-0" />}
              {!searching && phoneQuery && (
                <button onClick={() => { setPhoneQuery(''); setFoundCustomer(null); }} className="shrink-0">
                  <X size={13} className="text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* Search result */}
            {phoneQuery.length >= 6 && !searching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {foundCustomer ? (
                  <button
                    onClick={handleSelectFound}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-amber-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <span className="text-amber-700 font-bold text-xs">
                        {foundCustomer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{foundCustomer.full_name}</p>
                      <p className="text-xs text-slate-400">{foundCustomer.phone}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${segmentColor(foundCustomer.segment)}`}>
                      {foundCustomer.segment}
                    </span>
                  </button>
                ) : (
                  <div className="px-3 py-3">
                    <p className="text-xs text-slate-500 mb-2">Aucun client trouvé pour ce numéro</p>
                    <button
                      onClick={handleNotFound}
                      className="flex items-center gap-2 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <UserPlus size={13} />
                      Ajouter ce client
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected customer display */}
          {selectedCustId && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                <UserPlus size={11} className="text-amber-700" />
              </div>
              <span className="text-xs font-semibold text-amber-800 flex-1 truncate">Client sélectionné</span>
              <button
                onClick={() => onCustomerChange('')}
                className="shrink-0 text-amber-500 hover:text-amber-700"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <ShoppingCart size={32} className="text-slate-200 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Panier vide</p>
              <p className="text-xs text-slate-300 mt-1">Cliquez sur un produit pour l&apos;ajouter</p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-amber-700 font-bold text-xs text-center leading-tight px-1">
                      {item.category.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate">{item.name}</p>
                    <p className="text-xs text-amber-600 font-bold tabular-nums mt-0.5">
                      {(item.price / 1000).toFixed(0)}K GNF
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-colors active:scale-90"
                      >
                        <Minus size={11} className="text-slate-600" />
                      </button>
                      <span className="text-sm font-bold text-slate-900 tabular-nums w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:border-green-300 hover:bg-green-50 transition-colors active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={11} className="text-slate-600" />
                      </button>
                      <span className="text-xs text-slate-400 ml-1">max: {item.maxStock}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-bold text-slate-900 tabular-nums">
                      {((item.price * item.quantity) / 1000).toFixed(0)}K
                    </p>
                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount */}
        {cart.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Percent size={14} className="text-amber-600 shrink-0" />
              <span className="text-xs font-semibold text-amber-700 flex-1">Remise</span>
              <input
                type="number"
                min={0}
                max={100}
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                onBlur={handleDiscountBlur}
                className="w-14 text-right text-sm font-bold text-amber-700 bg-transparent outline-none tabular-nums"
              />
              <span className="text-amber-600 font-bold text-sm">%</span>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="px-4 py-3 border-t border-slate-200 space-y-2 bg-white">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Sous-total</span>
            <span className="font-semibold text-slate-700 tabular-nums">{(subtotal / 1000).toFixed(0)}K GNF</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">Remise ({discount}%)</span>
              <span className="font-semibold text-green-600 tabular-nums">- {(discountAmount / 1000).toFixed(0)}K GNF</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-900 text-base">Total</span>
            <span className="font-bold text-amber-600 text-xl tabular-nums">{(total / 1000000).toFixed(3)}M GNF</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className={`
              w-full py-3 rounded-xl font-bold text-sm transition-all duration-150
              ${cart.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:scale-95'
              }
            `}
          >
            {cart.length === 0 ? 'Panier vide' : `Encaisser — ${(total / 1000).toFixed(0)}K GNF`}
          </button>
        </div>
      </div>

      {/* Add New Client Modal */}
      {showAddModal && (
        <AddClientModal
          phone={phoneQuery}
          onClose={() => setShowAddModal(false)}
          onSaved={handleClientAdded}
        />
      )}
    </>
  );
}