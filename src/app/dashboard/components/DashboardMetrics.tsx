'use client';
import React from 'react';
import MetricCard from '@/components/ui/MetricCard';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  CreditCard,
  Users,
  Package,
} from 'lucide-react';

// Backend integration: GET /api/dashboard/metrics?shopId=&date=
const metrics = [
  {
    id: 'metric-revenue',
    label: "Chiffre d'affaires du jour",
    value: '47 850 000 GNF',
    subValue: 'Objectif: 50 000 000 GNF',
    trend: 12,
    trendLabel: 'vs hier (42 700 000 GNF)',
    icon: TrendingUp,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    variant: 'default' as const,
    colSpan: 'col-span-1 md:col-span-2',
  },
  {
    id: 'metric-sales',
    label: 'Ventes du jour',
    value: '34',
    subValue: '28 confirmées · 6 en cours',
    trend: 8,
    trendLabel: 'vs hier (31 ventes)',
    icon: ShoppingBag,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    variant: 'default' as const,
    colSpan: 'col-span-1',
  },
  {
    id: 'metric-stock-alert',
    label: 'Alertes stock faible',
    value: '5 produits',
    subValue: '2 en rupture totale',
    trend: -2,
    trendLabel: 'Nécessite réapprovisionnement',
    icon: AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    variant: 'alert' as const,
    colSpan: 'col-span-1',
  },
  {
    id: 'metric-receivables',
    label: 'Créances clients',
    value: '12 300 000 GNF',
    subValue: '8 clients avec solde dû',
    trend: -5,
    trendLabel: 'Paiements partiels en attente',
    icon: CreditCard,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    variant: 'warning' as const,
    colSpan: 'col-span-1',
  },
  {
    id: 'metric-customers',
    label: 'Clients du jour',
    value: '29',
    subValue: '4 nouveaux clients enregistrés',
    trend: 15,
    trendLabel: 'vs hier (25 clients)',
    icon: Users,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    variant: 'success' as const,
    colSpan: 'col-span-1',
  },
  {
    id: 'metric-inventory',
    label: 'Valeur du stock',
    value: '284 500 000 GNF',
    subValue: '312 références actives',
    trend: 3,
    trendLabel: 'Mise à jour il y a 2h',
    icon: Package,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    variant: 'default' as const,
    colSpan: 'col-span-1',
  },
];

export default function DashboardMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Hero metric spans 2 cols */}
      <div className="sm:col-span-2">
        <MetricCard
          label={metrics[0].label}
          value={metrics[0].value}
          subValue={metrics[0].subValue}
          trend={metrics[0].trend}
          trendLabel={metrics[0].trendLabel}
          icon={metrics[0].icon}
          iconBg={metrics[0].iconBg}
          iconColor={metrics[0].iconColor}
          variant={metrics[0].variant}
          className="h-full"
        />
      </div>
      {metrics.slice(1).map((m) => (
        <MetricCard
          key={m.id}
          label={m.label}
          value={m.value}
          subValue={m.subValue}
          trend={m.trend}
          trendLabel={m.trendLabel}
          icon={m.icon}
          iconBg={m.iconBg}
          iconColor={m.iconColor}
          variant={m.variant}
        />
      ))}
    </div>
  );
}