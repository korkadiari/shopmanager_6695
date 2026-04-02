'use client';
import React from 'react';
import { Package, AlertTriangle, TrendingDown, CheckCircle, BarChart2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


// Backend integration: GET /api/inventory/summary?shopId=
const cards = [
  { id: 'inv-card-total', label: 'Total produits', value: '312', sub: '18 catégories actives', icon: Package, bg: 'bg-slate-100', color: 'text-slate-600', border: 'border-slate-200', variant: 'default' },
  { id: 'inv-card-instock', label: 'En stock', value: '287', sub: '92% du catalogue', icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600', border: 'border-green-200', variant: 'default' },
  { id: 'inv-card-low', label: 'Stock faible', value: '18', sub: 'Seuil critique atteint', icon: AlertTriangle, bg: 'bg-amber-100', color: 'text-amber-600', border: 'border-amber-200', variant: 'warning' },
  { id: 'inv-card-out', label: 'Rupture de stock', value: '7', sub: 'Réapprovisionnement urgent', icon: TrendingDown, bg: 'bg-red-100', color: 'text-red-600', border: 'border-red-200', variant: 'alert' },
  { id: 'inv-card-value', label: 'Valeur totale stock', value: '284.5M GNF', sub: 'Prix de vente estimé', icon: BarChart2, bg: 'bg-amber-100', color: 'text-amber-600', border: 'border-amber-200', variant: 'default' },
];

const variantBg: Record<string, string> = {
  default: 'bg-white',
  warning: 'bg-amber-50',
  alert: 'bg-red-50',
};

export default function InventoryStockCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.id} className={`rounded-xl border ${c.border} ${variantBg[c.variant]} p-4 shadow-card`}>
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={c.color} />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        );
      })}
    </div>
  );
}