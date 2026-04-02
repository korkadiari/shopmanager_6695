import React from 'react';

type StatusType =
  | 'paid' | 'partial' | 'unpaid' | 'overdue' |'in_stock'| 'low_stock' | 'out_of_stock' |'active'| 'inactive' |'vip' | 'regular' | 'new';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  paid:          { label: 'Payé',           className: 'bg-green-100 text-green-700 border-green-200' },
  partial:       { label: 'Partiel',        className: 'bg-amber-100 text-amber-700 border-amber-200' },
  unpaid:        { label: 'Impayé',         className: 'bg-red-100 text-red-700 border-red-200' },
  overdue:       { label: 'En retard',      className: 'bg-red-100 text-red-800 border-red-300' },
  in_stock:      { label: 'En stock',       className: 'bg-green-100 text-green-700 border-green-200' },
  low_stock:     { label: 'Stock faible',   className: 'bg-amber-100 text-amber-700 border-amber-200' },
  out_of_stock:  { label: 'Rupture',        className: 'bg-red-100 text-red-700 border-red-200' },
  active:        { label: 'Actif',          className: 'bg-green-100 text-green-700 border-green-200' },
  inactive:      { label: 'Inactif',        className: 'bg-slate-100 text-slate-600 border-slate-200' },
  vip:           { label: 'VIP',            className: 'bg-purple-100 text-purple-700 border-purple-200' },
  regular:       { label: 'Régulier',       className: 'bg-blue-100 text-blue-700 border-blue-200' },
  new:           { label: 'Nouveau',        className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`
        inline-flex items-center font-semibold border rounded-full
        ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'}
        ${config.className}
      `}
    >
      {config.label}
    </span>
  );
}