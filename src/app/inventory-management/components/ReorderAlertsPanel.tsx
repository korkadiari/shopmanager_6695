'use client';
import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle, X, RefreshCw, Package, Clock } from 'lucide-react';

interface ReorderItem {
  productId: string;
  productName: string;
  currentStock: number;
  minThreshold: number;
  maxThreshold: number;
  supplierName: string;
  supplierEmail: string;
  leadTimeDays: number;
  suggestedOrderQty: number;
  shop: string;
}

const LOW_STOCK_ITEMS: ReorderItem[] = [
  { productId: 'prod-001', productName: 'Samsung Galaxy A15', currentStock: 3, minThreshold: 8, maxThreshold: 30, supplierName: 'Diallo Électronique', supplierEmail: 'orders@diallo-elec.gn', leadTimeDays: 5, suggestedOrderQty: 27, shop: 'Boutique Conakry' },
  { productId: 'prod-003', productName: 'Infinix Hot 40i', currentStock: 4, minThreshold: 10, maxThreshold: 40, supplierName: 'TechDistrib GN', supplierEmail: 'supply@techdistrib.gn', leadTimeDays: 3, suggestedOrderQty: 36, shop: 'Boutique Conakry' },
  { productId: 'prod-005', productName: 'Chargeur Rapide 65W', currentStock: 0, minThreshold: 15, maxThreshold: 60, supplierName: 'AccessImport', supplierEmail: 'reorder@accessimport.gn', leadTimeDays: 7, suggestedOrderQty: 60, shop: 'Boutique Conakry' },
  { productId: 'prod-009', productName: 'Powerbank 20000mAh', currentStock: 6, minThreshold: 8, maxThreshold: 25, supplierName: 'AccessImport', supplierEmail: 'reorder@accessimport.gn', leadTimeDays: 7, suggestedOrderQty: 19, shop: 'Boutique Conakry' },
  { productId: 'prod-012', productName: 'Samsung Galaxy A35', currentStock: 2, minThreshold: 5, maxThreshold: 20, supplierName: 'Diallo Électronique', supplierEmail: 'orders@diallo-elec.gn', leadTimeDays: 5, suggestedOrderQty: 18, shop: 'Boutique Conakry' },
  { productId: 'prod-018', productName: 'Écran LCD Tecno Spark 20', currentStock: 0, minThreshold: 5, maxThreshold: 15, supplierName: 'TechDistrib GN', supplierEmail: 'supply@techdistrib.gn', leadTimeDays: 3, suggestedOrderQty: 15, shop: 'Boutique Conakry' },
];

export default function ReorderAlertsPanel() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [recipientEmail, setRecipientEmail] = useState('manager@shopmanager.gn');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visibleItems = LOW_STOCK_ITEMS.filter(i => !dismissed.includes(i.productId));
  const outOfStock = visibleItems.filter(i => i.currentStock === 0);
  const lowStock = visibleItems.filter(i => i.currentStock > 0);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedItems(visibleItems.map(i => i.productId));
  };

  const handleSendAlerts = async () => {
    if (selectedItems.length === 0) return;
    setSending(true);
    setResult(null);

    const alertsToSend = visibleItems.filter(i => selectedItems.includes(i.productId));

    try {
      const res = await fetch('/api/reorder-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alerts: alertsToSend,
          recipientEmail,
          recipientName: 'Gestionnaire',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ sent: data.sent, failed: data.failed });
        setSelectedItems([]);
      } else {
        setResult({ sent: 0, failed: alertsToSend.length });
      }
    } catch {
      setResult({ sent: 0, failed: alertsToSend.length });
    } finally {
      setSending(false);
    }
  };

  if (visibleItems.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-slate-100 bg-red-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Alertes de réapprovisionnement</h3>
            <p className="text-xs text-slate-500">{outOfStock.length} rupture{outOfStock.length !== 1 ? 's' : ''} · {lowStock.length} stock{lowStock.length !== 1 ? 's' : ''} faible{lowStock.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={selectAll} className="text-xs text-amber-600 hover:text-amber-700 font-semibold">Tout sélectionner</button>
          <button
            onClick={handleSendAlerts}
            disabled={selectedItems.length === 0 || sending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {sending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
            {sending ? 'Envoi...' : `Envoyer alertes (${selectedItems.length})`}
          </button>
        </div>
      </div>

      {/* Email recipient */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label className="text-xs font-medium text-slate-600 shrink-0">Destinataire :</label>
        <input
          type="email"
          value={recipientEmail}
          onChange={e => setRecipientEmail(e.target.value)}
          className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          placeholder="email@exemple.com"
        />
      </div>

      {/* Result banner */}
      {result && (
        <div className={`px-4 sm:px-5 py-3 flex items-center gap-2 text-sm font-medium ${result.sent > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.sent > 0 ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
          {result.sent > 0 ? `${result.sent} alerte${result.sent !== 1 ? 's' : ''} envoyée${result.sent !== 1 ? 's' : ''} avec succès` : `Échec d'envoi — vérifiez votre clé RESEND_API_KEY`}
          {result.failed > 0 && result.sent > 0 && ` · ${result.failed} échec${result.failed !== 1 ? 's' : ''}`}
        </div>
      )}

      {/* Items list */}
      <div className="divide-y divide-slate-50">
        {visibleItems.map(item => {
          const isOutOfStock = item.currentStock === 0;
          const isSelected = selectedItems.includes(item.productId);
          return (
            <div
              key={item.productId}
              className={`flex items-start gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'bg-amber-50' : ''}`}
              onClick={() => toggleSelect(item.productId)}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-300'}`}>
                {isSelected && <CheckCircle size={12} className="text-white" />}
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 mt-2 ${isOutOfStock ? 'bg-red-500' : 'bg-amber-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.productName}</p>
                    <p className="text-xs text-slate-500">{item.supplierName} · Délai: {item.leadTimeDays}j</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {isOutOfStock ? 'Rupture' : `${item.currentStock} restants`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Package size={10} />Min: {item.minThreshold} · Max: {item.maxThreshold}</span>
                  <span className="flex items-center gap-1"><Clock size={10} />Commander: {item.suggestedOrderQty} unités</span>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setDismissed(prev => [...prev, item.productId]); }}
                className="p-1 rounded hover:bg-slate-200 transition-colors shrink-0"
                title="Ignorer"
              >
                <X size={12} className="text-slate-400" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
