'use client';
import React from 'react';
import { ShoppingBag, Clock } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';

// Backend integration: GET /api/sales/recent?shopId=&limit=8
const recentSales = [
  { id: 'sale-001', invoice: 'INV-2026-0847', customer: 'Mamadou Bah', product: 'Samsung Galaxy A15', amount: 2850000, method: 'Orange Money', status: 'paid' as const, time: '14:32' },
  { id: 'sale-002', invoice: 'INV-2026-0846', customer: 'Fatoumata Camara', product: 'Tecno Spark 20 Pro', amount: 1950000, method: 'Cash', status: 'paid' as const, time: '14:18' },
  { id: 'sale-003', invoice: 'INV-2026-0845', customer: 'Ibrahim Diallo', product: 'Infinix Hot 40i', amount: 1450000, method: 'Partiel', status: 'partial' as const, time: '13:55' },
  { id: 'sale-004', invoice: 'INV-2026-0844', customer: 'Aissatou Sow', product: 'Câble USB-C × 3', amount: 150000, method: 'Mobile Money', status: 'paid' as const, time: '13:40' },
  { id: 'sale-005', invoice: 'INV-2026-0843', customer: 'Oumar Kouyaté', product: 'Coque Samsung A15', amount: 85000, method: 'Cash', status: 'paid' as const, time: '13:22' },
  { id: 'sale-006', invoice: 'INV-2026-0842', customer: 'Kadiatou Barry', product: 'Itel P40 + Écouteurs', amount: 1680000, method: 'PayCard', status: 'unpaid' as const, time: '12:58' },
];

const methodColors: Record<string, string> = {
  'Cash': 'bg-green-100 text-green-700',
  'Orange Money': 'bg-orange-100 text-orange-700',
  'Mobile Money': 'bg-blue-100 text-blue-700',
  'PayCard': 'bg-purple-100 text-purple-700',
  'Partiel': 'bg-amber-100 text-amber-700',
};

export default function RecentSalesFeed() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <ShoppingBag size={14} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Ventes récentes</h3>
        </div>
        <Link href="/pos-point-of-sale" className="text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors">
          Voir tout →
        </Link>
      </div>
      <div className="space-y-3">
        {recentSales.map((sale) => (
          <div key={sale.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-amber-700 font-bold text-xs">
                {sale.customer.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800 truncate">{sale.customer}</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums shrink-0">{(sale.amount / 1000).toFixed(0)}K</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{sale.product}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${methodColors[sale.method] ?? 'bg-slate-100 text-slate-600'}`}>
                  {sale.method}
                </span>
                <StatusBadge status={sale.status} />
                <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                  <Clock size={10} />
                  {sale.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}