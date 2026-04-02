'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer,  } from 'recharts';

// Backend integration: GET /api/dashboard/payment-methods?shopId=&date=
const data = [
  { name: 'Cash', value: 18, amount: 8613000, color: '#22c55e' },
  { name: 'Orange Money', value: 35, amount: 16747500, color: '#f97316' },
  { name: 'Mobile Money', value: 28, amount: 13398000, color: '#3b82f6' },
  { name: 'PayCard', value: 12, amount: 5742000, color: '#8b5cf6' },
  { name: 'Partiel', value: 7, amount: 3349500, color: '#f59e0b' },
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; payload: { value: number; amount: number; color: string } }[] }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-card-lg p-3 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
          <span className="font-semibold text-slate-900">{payload[0].name}</span>
        </div>
        <p className="text-slate-600 tabular-nums">{d.value}% des transactions</p>
        <p className="text-slate-500 tabular-nums text-xs">{(d.amount / 1000000).toFixed(2)}M GNF</p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) => {
  if (percent < 0.08) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function PaymentMethodChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5 h-full">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 text-sm">Méthodes de paiement</h3>
        <p className="text-xs text-slate-500">Répartition du jour</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-2">
        {data.map((item) => (
          <div key={`legend-${item.name}`} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 font-medium">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 tabular-nums">{item.value}%</span>
              <span className="text-slate-700 font-semibold tabular-nums">{(item.amount / 1000000).toFixed(2)}M</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}