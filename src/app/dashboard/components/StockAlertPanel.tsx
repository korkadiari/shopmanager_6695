'use client';
import React from 'react';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';

// Low stock threshold: ≤ 5 units triggers alert
const LOW_STOCK_THRESHOLD = 5;

const alerts = [
  { id: 'alert-001', name: 'Tecno Spark 20', category: 'Téléphones', stock: 2, threshold: LOW_STOCK_THRESHOLD, severity: 'critical' as const },
  { id: 'alert-002', name: 'Samsung Galaxy A15', category: 'Téléphones', stock: 3, threshold: LOW_STOCK_THRESHOLD, severity: 'critical' as const },
  { id: 'alert-003', name: 'Chargeur Rapide 65W', category: 'Accessoires', stock: 0, threshold: LOW_STOCK_THRESHOLD, severity: 'out' as const },
  { id: 'alert-004', name: 'Infinix Hot 40 Pro', category: 'Téléphones', stock: 4, threshold: LOW_STOCK_THRESHOLD, severity: 'low' as const },
  { id: 'alert-005', name: 'Coque Transparente A15', category: 'Coques', stock: 5, threshold: LOW_STOCK_THRESHOLD, severity: 'low' as const },
];

const severityConfig = {
  out: { label: 'Rupture', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
  critical: { label: 'Critique', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', border: 'border-red-100' },
  low: { label: 'Faible', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-100' },
};

export default function StockAlertPanel() {
  return (
    <div className="bg-white rounded-xl border border-red-200 shadow-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle size={14} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Alertes stock</h3>
            <p className="text-xs text-red-500 font-medium">{alerts.length} produits ≤ {LOW_STOCK_THRESHOLD} unités</p>
          </div>
        </div>
        <Link href="/inventory-management" className="text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors flex items-center gap-1">
          Gérer <ArrowRight size={12} />
        </Link>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          return (
            <Link
              key={alert.id}
              href={`/inventory-management?alert=${alert.id}`}
              className={`flex items-center gap-3 p-2.5 rounded-lg border ${config.border} ${config.bg} hover:opacity-80 transition-opacity cursor-pointer`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{alert.name}</p>
                <p className="text-xs text-slate-500">{alert.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold tabular-nums ${config.text}`}>
                  {alert.stock === 0 ? 'Rupture' : `${alert.stock} unités`}
                </p>
                <p className="text-xs text-slate-400">seuil: {alert.threshold}</p>
              </div>
            </Link>
          );
        })}
      </div>
      <Link href="/inventory-management">
        <button className="w-full mt-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Package size={13} />
          Commander les réapprovisionnements
        </button>
      </Link>
    </div>
  );
}