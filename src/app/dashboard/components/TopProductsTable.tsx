'use client';
import React from 'react';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';

// Backend integration: GET /api/dashboard/top-products?shopId=&date=&limit=8
const topProducts = [
  { id: 'prod-001', rank: 1, name: 'Samsung Galaxy A15', category: 'Téléphones', sold: 8, revenue: 22800000, trend: 24, trendDir: 'up' as const },
  { id: 'prod-002', rank: 2, name: 'Tecno Spark 20 Pro', category: 'Téléphones', sold: 6, revenue: 11700000, trend: 12, trendDir: 'up' as const },
  { id: 'prod-003', rank: 3, name: 'Infinix Hot 40i', category: 'Téléphones', sold: 5, revenue: 7250000, trend: -8, trendDir: 'down' as const },
  { id: 'prod-004', rank: 4, name: 'Câble USB-C (lot 3)', category: 'Accessoires', sold: 22, revenue: 1100000, trend: 45, trendDir: 'up' as const },
  { id: 'prod-005', rank: 5, name: 'Itel P40', category: 'Téléphones', sold: 4, revenue: 4800000, trend: 5, trendDir: 'up' as const },
  { id: 'prod-006', rank: 6, name: 'Chargeur Rapide 33W', category: 'Accessoires', sold: 14, revenue: 1960000, trend: -15, trendDir: 'down' as const },
  { id: 'prod-007', rank: 7, name: 'Écouteurs Bluetooth', category: 'Audio', sold: 9, revenue: 2250000, trend: 18, trendDir: 'up' as const },
  { id: 'prod-008', rank: 8, name: 'Powerbank 20000mAh', category: 'Accessoires', sold: 3, revenue: 2400000, trend: 0, trendDir: 'up' as const },
];

const rankColors: Record<number, string> = {
  1: 'text-amber-500',
  2: 'text-slate-400',
  3: 'text-amber-700',
};

export default function TopProductsTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Award size={16} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Produits les plus vendus</h3>
            <p className="text-xs text-slate-500">Aujourd&apos;hui — 31 mars 2026</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">Top 8</span>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-10">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Produit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Catégorie</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Qté vendue</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Chiffre d&apos;affaires</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Tendance</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <span className={`font-bold text-sm tabular-nums ${rankColors[p.rank] ?? 'text-slate-500'}`}>
                    {p.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">{p.category}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{p.sold}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">
                    {(p.revenue / 1000000).toFixed(2)}M GNF
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
                    ${p.trendDir === 'up' && p.trend > 0 ? 'bg-green-100 text-green-700' : p.trendDir === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}
                  `}>
                    {p.trendDir === 'up' && p.trend > 0 ? <TrendingUp size={11} /> : p.trendDir === 'down' ? <TrendingDown size={11} /> : null}
                    {p.trend > 0 ? '+' : ''}{p.trend}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}