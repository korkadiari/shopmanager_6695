'use client';
import React, { useState } from 'react';
import { X, Package, ArrowRight, ArrowLeft, RotateCcw, Clock } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  model: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  threshold: number;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  imei?: string;
}

interface Props {
  product: Product;
  onClose: () => void;
}

// Backend integration: GET /api/inventory/{productId}/movements
const mockMovements = [
  { id: 'mv-001', type: 'out', qty: 2, reason: 'Vente — INV-2026-0847', date: '31/03/2026 14:32', user: 'Amadou Diallo' },
  { id: 'mv-002', type: 'out', qty: 1, reason: 'Vente — INV-2026-0831', date: '30/03/2026 11:15', user: 'Mariama Bah' },
  { id: 'mv-003', type: 'in', qty: 10, reason: 'Réapprovisionnement — Diallo Électronique', date: '28/03/2026 09:00', user: 'Amadou Diallo' },
  { id: 'mv-004', type: 'out', qty: 3, reason: 'Vente — INV-2026-0812', date: '27/03/2026 16:44', user: 'Mariama Bah' },
  { id: 'mv-005', type: 'adjustment', qty: -1, reason: 'Ajustement inventaire — produit endommagé', date: '25/03/2026 10:30', user: 'Amadou Diallo' },
  { id: 'mv-006', type: 'in', qty: 5, reason: 'Réapprovisionnement — Diallo Électronique', date: '20/03/2026 08:15', user: 'Amadou Diallo' },
];

const tabs = ['Détails', 'Mouvements'];

export default function ProductDrawer({ product, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('Détails');

  const margin = product.purchasePrice > 0
    ? (((product.salePrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(1)
    : '—';

  const stockPct = Math.min(100, (product.stock / (product.threshold * 2)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-card-lg flex flex-col h-full animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              product.status === 'out_of_stock' ? 'bg-red-100' :
              product.status === 'low_stock' ? 'bg-amber-100' : 'bg-green-100'
            }`}>
              <Package size={18} className={
                product.status === 'out_of_stock' ? 'text-red-500' :
                product.status === 'low_stock' ? 'text-amber-500' : 'text-green-500'
              } />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm leading-tight">{product.name}</h2>
              <p className="text-xs text-slate-500">{product.model} · {product.brand}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5">
          {tabs.map((tab) => (
            <button
              key={`drawer-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-amber-500 text-amber-600' :'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
          {activeTab === 'Détails' && (
            <>
              {/* Status + stock level */}
              <div className="flex items-center justify-between">
                <StatusBadge status={product.status} size="md" />
                <span className="text-xs text-slate-400">Mis à jour: {product.lastUpdated}</span>
              </div>

              {/* Stock level bar */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Niveau de stock</span>
                  <span className={`text-lg font-bold tabular-nums ${
                    product.stock === 0 ? 'text-red-600' :
                    product.stock <= product.threshold ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {product.stock} unités
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      product.stock === 0 ? 'bg-red-400' :
                      product.stock <= product.threshold ? 'bg-amber-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${stockPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>0</span>
                  <span>Seuil: {product.threshold}</span>
                  <span>{product.threshold * 2}</span>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tarification</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">Prix achat</p>
                    <p className="text-base font-bold text-slate-900 tabular-nums">{(product.purchasePrice / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-slate-400">GNF</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-amber-600 mb-1">Prix vente</p>
                    <p className="text-base font-bold text-amber-700 tabular-nums">{(product.salePrice / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-amber-500">GNF</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-green-600 mb-1">Marge</p>
                    <p className="text-base font-bold text-green-700 tabular-nums">+{margin}%</p>
                    <p className="text-xs text-green-500">{((product.salePrice - product.purchasePrice) / 1000).toFixed(0)}K GNF</p>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Informations produit</p>
                <div className="space-y-2">
                  {[
                    { label: 'Catégorie', value: product.category },
                    { label: 'Marque', value: product.brand },
                    { label: 'Modèle', value: product.model },
                    { label: 'Fournisseur', value: product.supplier },
                    { label: 'Seuil d\'alerte', value: `${product.threshold} unités` },
                    ...(product.imei ? [{ label: 'IMEI', value: product.imei }] : []),
                  ].map((row) => (
                    <div key={`detail-${row.label}`} className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-sm text-slate-500">{row.label}</span>
                      <span className="text-sm font-semibold text-slate-800 font-mono">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock value */}
              <div className="bg-slate-900 rounded-xl p-4 text-white">
                <p className="text-xs text-slate-400 mb-1">Valeur totale en stock</p>
                <p className="text-2xl font-bold tabular-nums text-amber-400">
                  {((product.salePrice * product.stock) / 1000000).toFixed(3)}M GNF
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {product.stock} × {(product.salePrice / 1000).toFixed(0)}K GNF
                </p>
              </div>
            </>
          )}

          {activeTab === 'Mouvements' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Historique des mouvements</p>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{mockMovements.length} entrées</span>
              </div>
              {mockMovements.map((mv) => (
                <div key={mv.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    mv.type === 'in' ? 'bg-green-100' :
                    mv.type === 'out' ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    {mv.type === 'in' ? <ArrowRight size={14} className="text-green-600" /> :
                     mv.type === 'out' ? <ArrowLeft size={14} className="text-red-600" /> :
                     <RotateCcw size={14} className="text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-bold tabular-nums ${
                        mv.type === 'in' ? 'text-green-600' : mv.type === 'out' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {mv.type === 'in' ? '+' : ''}{mv.qty > 0 && mv.type === 'out' ? '-' : ''}{mv.qty} unités
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock size={10} />{mv.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 truncate">{mv.reason}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Par: {mv.user}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Fermer
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all active:scale-95">
            Modifier le produit
          </button>
        </div>
      </div>
    </div>
  );
}