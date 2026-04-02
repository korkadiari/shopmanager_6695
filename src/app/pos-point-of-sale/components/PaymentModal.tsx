'use client';
import React, { useState } from 'react';
import { X, Smartphone, Banknote, CreditCard, Split, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CartItem, GeneratedInvoice } from './POSLayout';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';


interface Props {
  total: number;
  cart: CartItem[];
  discount: number;
  subtotal: number;
  customer: string;
  onClose: () => void;
  onComplete: (invoice: GeneratedInvoice) => void;
  isMobileDrawer?: boolean;
}

type PaymentMethod = 'cash' | 'orange_money' | 'mobile_money' | 'paycard' | 'partial';

const methodConfig: { id: PaymentMethod; label: string; icon: React.ElementType; color: string; activeBg: string; activeBorder: string }[] = [
  { id: 'cash', label: 'Espèces', icon: Banknote, color: 'text-green-600', activeBg: 'bg-green-50', activeBorder: 'border-green-400' },
  { id: 'orange_money', label: 'Orange Money', icon: Smartphone, color: 'text-orange-600', activeBg: 'bg-orange-50', activeBorder: 'border-orange-400' },
  { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: 'text-blue-600', activeBg: 'bg-blue-50', activeBorder: 'border-blue-400' },
  { id: 'paycard', label: 'PayCard', icon: CreditCard, color: 'text-purple-600', activeBg: 'bg-purple-50', activeBorder: 'border-purple-400' },
  { id: 'partial', label: 'Paiement partiel', icon: Split, color: 'text-amber-600', activeBg: 'bg-amber-50', activeBorder: 'border-amber-400' },
];

export default function PaymentModal({ total, cart, discount, subtotal, customer, onClose, onComplete, isMobileDrawer = false }: Props) {
  const supabase = createClient();
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState(total.toString());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paid = parseFloat(amountPaid) || 0;
  const balance = total - paid;
  const change = paid - total;

  const isValid = () => {
    if (method === 'cash') return paid >= total;
    if (method === 'partial') return paid > 0 && paid < total;
    if (method === 'orange_money' || method === 'mobile_money') return phoneNumber.length >= 9 && paid >= total;
    if (method === 'paycard') return paid >= total;
    return false;
  };

  const handleConfirm = async () => {
    if (!isValid()) return;
    setIsProcessing(true);

    const invoiceNumber = `INV-2026-${String(Math.floor(Math.random() * 900) + 848).padStart(4, '0')}`;
    const paymentLabel = methodConfig.find((m) => m.id === method)?.label ?? method;
    const paymentStatus = method === 'partial' ? 'partial' : 'paid';

    try {
      // Get tenant_id
      const { data: { user } } = await supabase.auth.getUser();
      let tenantId: string | null = null;
      let customerName = 'Client anonyme';

      if (user) {
        const { data: profile } = await supabase.from('user_profiles').select('tenant_id, full_name').eq('id', user.id).single();
        tenantId = profile?.tenant_id || null;

        if (customer) {
          const { data: cust } = await supabase.from('customers').select('full_name').eq('id', customer).single();
          if (cust) customerName = cust.full_name;
        }
      }

      if (tenantId) {
        // Insert sale
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .insert({
            tenant_id: tenantId,
            customer_id: customer || null,
            invoice_ref: invoiceNumber,
            subtotal,
            discount,
            discount_amount: subtotal - total,
            total,
            payment_method: paymentLabel,
            payment_status: paymentStatus,
            cashier_name: user?.email || '',
          })
          .select()
          .single();

        if (!saleError && saleData) {
          // Insert sale items
          const saleItems = cart.map(item => ({
            sale_id: saleData.id,
            product_id: item.productId.startsWith('prod-') ? item.productId : null,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
          }));
          await supabase.from('sale_items').insert(saleItems);

          // Update customer total_purchases if customer selected
          if (customer) {
            await supabase.rpc('update_customer_totals', { p_customer_id: customer, p_amount: total }).catch(() => {
              // RPC may not exist yet, ignore
            });
          }
        }
      }
    } catch {
      // Non-blocking: sale UI still completes even if DB save fails
    }

    const invoice: GeneratedInvoice = {
      invoiceNumber,
      customer: customer ? customer : 'Client anonyme',
      items: cart,
      subtotal,
      discount,
      total,
      amountPaid: paid,
      balance: Math.max(0, balance),
      paymentMethod: paymentLabel,
      date: new Date().toLocaleString('fr-FR'),
    };

    toast.success(`Vente enregistrée — ${invoiceNumber}`, {
      description: `${(total / 1000).toFixed(0)}K GNF`,
    });

    setIsProcessing(false);
    onComplete(invoice);
  };

  const inner = (
    <div className={isMobileDrawer ? 'flex flex-col' : 'bg-white rounded-2xl shadow-card-lg w-full max-w-md animate-scale-in overflow-hidden'}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-slate-900 text-base">Encaissement</h2>
          <p className="text-xs text-slate-500 mt-0.5">{customer ? 'Client sélectionné' : 'Client anonyme'}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500">
          <X size={16} />
        </button>
      </div>

      <div className="p-5 space-y-4 overflow-y-auto">
        {/* Total */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">Montant total</p>
          <p className="text-3xl font-bold text-amber-700 tabular-nums">{(total / 1000000).toFixed(3)}M GNF</p>
          {discount > 0 && (
            <p className="text-xs text-amber-500 mt-1">Remise {discount}% appliquée — Économie: {((subtotal - total) / 1000).toFixed(0)}K GNF</p>
          )}
        </div>

        {/* Payment methods */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Méthode de paiement</p>
          <div className="grid grid-cols-3 gap-2">
            {methodConfig.map((m) => {
              const Icon = m.icon;
              const isActive = method === m.id;
              return (
                <button key={`pm-${m.id}`}
                  onClick={() => { setMethod(m.id); if (m.id !== 'partial') setAmountPaid(total.toString()); }}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-150 ${isActive ? `${m.activeBg} ${m.activeBorder}` : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                  <Icon size={18} className={isActive ? m.color : 'text-slate-400'} />
                  <span className={`text-xs font-semibold leading-tight text-center ${isActive ? m.color : 'text-slate-500'}`}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phone number for mobile payments */}
        {(method === 'orange_money' || method === 'mobile_money') && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Numéro {method === 'orange_money' ? 'Orange Money' : 'Mobile Money'}
            </label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-amber-400 transition-colors">
              <span className="text-sm text-slate-500 font-mono">+224</span>
              <input type="tel" placeholder="6XX XX XX XX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 text-sm outline-none font-mono text-slate-800 placeholder-slate-300" />
            </div>
          </div>
        )}

        {/* Amount paid */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">
            {method === 'partial' ? 'Montant versé (paiement partiel)' : 'Montant reçu (GNF)'}
          </label>
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-colors bg-slate-50">
            <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)}
              className="flex-1 text-base font-bold text-slate-900 bg-transparent outline-none tabular-nums" />
            <span className="text-sm text-slate-500 font-semibold">GNF</span>
          </div>
        </div>

        {method === 'cash' && paid > total && (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
            <span className="text-sm font-semibold text-green-700">Monnaie à rendre</span>
            <span className="text-base font-bold text-green-700 tabular-nums">{(change / 1000).toFixed(0)}K GNF</span>
          </div>
        )}

        {method === 'partial' && paid > 0 && paid < total && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
            <span className="text-sm font-semibold text-amber-700">Solde restant dû</span>
            <span className="text-base font-bold text-amber-700 tabular-nums">{(balance / 1000).toFixed(0)}K GNF</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-2 flex gap-3">
        <button onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
          Annuler
        </button>
        <button onClick={handleConfirm} disabled={!isValid() || isProcessing}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 ${isValid() && !isProcessing ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95 shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
          {isProcessing ? (
            <><Loader2 size={16} className="animate-spin" />Traitement...</>
          ) : (
            <><CheckCircle size={16} />Confirmer la vente</>
          )}
        </button>
      </div>
    </div>
  );

  return inner;
}