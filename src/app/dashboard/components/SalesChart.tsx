'use client';
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

// Backend integration: GET /api/dashboard/sales-chart?shopId=&period=
const weeklyData = [
  { day: 'Lun 25', ventes: 38200000, objectif: 45000000 },
  { day: 'Mar 26', ventes: 52100000, objectif: 45000000 },
  { day: 'Mer 27', ventes: 41700000, objectif: 45000000 },
  { day: 'Jeu 28', ventes: 63400000, objectif: 45000000 },
  { day: 'Ven 29', ventes: 55800000, objectif: 45000000 },
  { day: 'Sam 30', ventes: 71200000, objectif: 50000000 },
  { day: 'Dim 31', ventes: 47850000, objectif: 50000000 },
];

const monthlyData = [
  { day: 'S1', ventes: 285000000, objectif: 300000000 },
  { day: 'S2', ventes: 312000000, objectif: 300000000 },
  { day: 'S3', ventes: 278000000, objectif: 300000000 },
  { day: 'S4', ventes: 341000000, objectif: 300000000 },
];

function formatGNF(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-card-lg p-3 text-sm min-w-[180px]">
        <p className="font-semibold text-slate-700 mb-2">{label}</p>
        {payload.map((p) => (
          <div key={`tooltip-${p.name}`} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-slate-500 text-xs">{p.name}</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">{formatGNF(p.value)} GNF</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SalesChart() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const data = period === 'week' ? weeklyData : monthlyData;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <BarChart3 size={16} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Évolution des ventes</h3>
            <p className="text-xs text-slate-500">Chiffre d&apos;affaires vs objectif (GNF)</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['week', 'month'] as const).map((p) => (
            <button
              key={`period-${p}`}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p === 'week' ? '7 jours' : 'Mensuel'}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Plus Jakarta Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatGNF}
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Plus Jakarta Sans' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 4 }} />
          <Legend
            wrapperStyle={{ fontSize: '12px', fontFamily: 'Plus Jakarta Sans', paddingTop: '12px' }}
            formatter={(value) => <span style={{ color: '#64748b' }}>{value}</span>}
          />
          <Bar dataKey="ventes" name="Ventes" fill="#d97706" radius={[4, 4, 0, 0]} />
          <Bar dataKey="objectif" name="Objectif" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}