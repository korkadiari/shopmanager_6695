'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Users, TrendingUp, ShoppingCart, Award, Clock, BarChart3, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(n);

type Role = 'Caissier' | 'Manager';

interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

interface StaffMember {
  id: string;
  name: string;
  avatar: string;
  role: Role;
  shop: string;
  salesCount: number;
  revenue: number;
  avgTransaction: number;
  shiftHours: number;
  topProducts: TopProduct[];
  trend: number;
}

const MOCK_STAFF: StaffMember[] = [
  {
    id: 'u1', name: 'Mamadou Camara', avatar: 'MC', role: 'Caissier', shop: 'Boutique Conakry',
    salesCount: 142, revenue: 48_500_000, avgTransaction: 341_549, shiftHours: 168, trend: 12,
    topProducts: [
      { name: 'Samsung Galaxy A15', qty: 18, revenue: 51_300_000 },
      { name: 'Tecno Spark 20 Pro', qty: 14, revenue: 27_300_000 },
      { name: 'Chargeur Rapide 65W', qty: 32, revenue: 4_480_000 },
    ],
  },
  {
    id: 'u2', name: 'Hawa Camara', avatar: 'HC', role: 'Caissier', shop: 'Boutique Conakry',
    salesCount: 118, revenue: 38_200_000, avgTransaction: 323_729, shiftHours: 152, trend: 5,
    topProducts: [
      { name: 'Infinix Hot 40i', qty: 22, revenue: 31_900_000 },
      { name: 'Câble USB-C 2m', qty: 45, revenue: 2_250_000 },
      { name: 'Coque Samsung A15', qty: 28, revenue: 1_260_000 },
    ],
  },
  {
    id: 'u3', name: 'Fatoumata Bah', avatar: 'FB', role: 'Manager', shop: 'Boutique Conakry',
    salesCount: 87, revenue: 62_100_000, avgTransaction: 714_000, shiftHours: 176, trend: 18,
    topProducts: [
      { name: 'Samsung Galaxy A35', qty: 8, revenue: 36_000_000 },
      { name: 'Tecno Camon 20', qty: 10, revenue: 32_000_000 },
      { name: 'Écouteurs Bluetooth TWS', qty: 12, revenue: 3_000_000 },
    ],
  },
  {
    id: 'u4', name: 'Aissatou Sow', avatar: 'AS', role: 'Manager', shop: 'Boutique Kindia',
    salesCount: 64, revenue: 41_800_000, avgTransaction: 653_125, shiftHours: 160, trend: -3,
    topProducts: [
      { name: 'Tecno Pova 6 Neo', qty: 9, revenue: 18_900_000 },
      { name: 'Samsung Galaxy A05', qty: 11, revenue: 19_250_000 },
      { name: 'Powerbank 20000mAh', qty: 5, revenue: 4_000_000 },
    ],
  },
  {
    id: 'u5', name: 'Boubacar Kouyaté', avatar: 'BK', role: 'Caissier', shop: 'Boutique Labé',
    salesCount: 95, revenue: 29_700_000, avgTransaction: 312_631, shiftHours: 144, trend: -8,
    topProducts: [
      { name: 'Itel P40', qty: 20, revenue: 24_000_000 },
      { name: 'Itel A70', qty: 18, revenue: 13_500_000 },
      { name: 'Verre trempé A15', qty: 40, revenue: 1_200_000 },
    ],
  },
  {
    id: 'u6', name: 'Mariama Kouyaté', avatar: 'MK', role: 'Caissier', shop: 'Boutique Kindia',
    salesCount: 103, revenue: 33_400_000, avgTransaction: 324_271, shiftHours: 156, trend: 7,
    topProducts: [
      { name: 'Infinix Smart 8', qty: 25, revenue: 23_750_000 },
      { name: 'Chargeur Rapide 33W', qty: 30, revenue: 2_850_000 },
      { name: 'Support voiture magnétique', qty: 15, revenue: 1_800_000 },
    ],
  },
];

const ROLE_COLORS: Record<Role, string> = {
  Caissier: 'bg-amber-100 text-amber-700',
  Manager: 'bg-blue-100 text-blue-700',
};

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function TeamPerformancePage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'Tous'>('Tous');
  const [shopFilter, setShopFilter] = useState('Tous');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const shops = ['Tous', ...Array.from(new Set(MOCK_STAFF.map(s => s.shop)))];

  const filtered = MOCK_STAFF.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'Tous' || s.role === roleFilter;
    const matchShop = shopFilter === 'Tous' || s.shop === shopFilter;
    return matchSearch && matchRole && matchShop;
  });

  const totalRevenue = MOCK_STAFF.reduce((s, x) => s + x.revenue, 0);
  const totalSales = MOCK_STAFF.reduce((s, x) => s + x.salesCount, 0);
  const avgTransaction = totalRevenue / totalSales;
  const totalHours = MOCK_STAFF.reduce((s, x) => s + x.shiftHours, 0);

  const chartData = filtered.map(s => ({
    name: s.name.split(' ')[0],
    ventes: s.salesCount,
    revenu: Math.round(s.revenue / 1_000_000),
  }));

  const topPerformer = [...MOCK_STAFF].sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <AppLayout>
      <Topbar title="Performance Équipe" subtitle="Métriques des caissiers et managers par période" />
      <div className="px-4 lg:px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total ventes équipe', value: totalSales.toString(), sub: 'Ce mois', color: 'text-slate-700', bg: 'bg-slate-100', icon: ShoppingCart },
            { label: 'Chiffre d\'affaires', value: fmt(totalRevenue), sub: 'Cumulé équipe', color: 'text-green-700', bg: 'bg-green-100', icon: TrendingUp },
            { label: 'Transaction moyenne', value: fmt(avgTransaction), sub: 'Par vente', color: 'text-amber-700', bg: 'bg-amber-100', icon: BarChart3 },
            { label: 'Heures de travail', value: `${totalHours}h`, sub: 'Total équipe', color: 'text-blue-700', bg: 'bg-blue-100', icon: Clock },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon size={18} className={card.color} />
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{card.label}</p>
              <p className={`text-xl font-bold ${card.color} tabular-nums leading-tight`}>{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Top Performer Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Award size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-100 uppercase tracking-wide">Meilleure performance ce mois</p>
            <p className="font-bold text-white text-lg">{topPerformer.name}</p>
            <p className="text-xs text-amber-100">{topPerformer.role} · {topPerformer.shop}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-white tabular-nums">{fmt(topPerformer.revenue)}</p>
            <p className="text-xs text-amber-100">{topPerformer.salesCount} ventes</p>
          </div>
        </div>

        {/* Chart + Table */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-amber-500" />
              Revenu par membre (M GNF)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: number) => [`${value}M GNF`, 'Revenu']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="revenu" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sales Count Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShoppingCart size={16} className="text-amber-500" />
              Nombre de ventes
            </h3>
            <div className="space-y-3">
              {[...MOCK_STAFF].sort((a, b) => b.salesCount - a.salesCount).map((s, i) => {
                const max = Math.max(...MOCK_STAFF.map(x => x.salesCount));
                const pct = (s.salesCount / max) * 100;
                return (
                  <div key={s.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">{s.name.split(' ')[0]}</span>
                      <span className="text-xs font-bold text-slate-900 tabular-nums">{s.salesCount}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-xs focus-within:border-amber-400 transition-all">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input type="text" placeholder="Rechercher un membre..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as Role | 'Tous')}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400 cursor-pointer">
                <option value="Tous">Tous rôles</option>
                <option value="Caissier">Caissier</option>
                <option value="Manager">Manager</option>
              </select>
              <select value={shopFilter} onChange={e => setShopFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400 cursor-pointer">
                {shops.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.map((member, idx) => (
              <div key={member.id}>
                <div
                  className="flex items-center gap-4 px-4 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                >
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-bold w-5 shrink-0">{idx + 1}</div>
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{member.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_COLORS[member.role]}`}>{member.role}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{member.shop}</p>
                  </div>
                  <div className="hidden sm:grid grid-cols-4 gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Ventes</p>
                      <p className="text-sm font-bold text-slate-900 tabular-nums">{member.salesCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Revenu</p>
                      <p className="text-sm font-bold text-green-700 tabular-nums">{fmt(member.revenue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Moy. transaction</p>
                      <p className="text-sm font-bold text-slate-700 tabular-nums">{fmt(member.avgTransaction)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Heures</p>
                      <p className="text-sm font-bold text-blue-700 tabular-nums">{member.shiftHours}h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold ${member.trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {member.trend >= 0 ? '+' : ''}{member.trend}%
                    </span>
                    {expandedId === member.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </div>

                {/* Top Products Expanded */}
                {expandedId === member.id && (
                  <div className="px-4 pb-4">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-100">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                          <Award size={12} className="text-amber-500" />
                          Top produits vendus par {member.name.split(' ')[0]}
                        </p>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {member.topProducts.map((p, i) => (
                          <div key={i} className="flex items-center gap-4 px-4 py-3">
                            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                              <span className="text-amber-700 font-bold text-xs">{i + 1}</span>
                            </div>
                            <p className="flex-1 text-sm font-semibold text-slate-700">{p.name}</p>
                            <span className="text-xs text-slate-500">{p.qty} unités</span>
                            <span className="text-sm font-bold text-green-700 tabular-nums">{fmt(p.revenue)}</span>
                          </div>
                        ))}
                      </div>
                      {/* Mobile metrics */}
                      <div className="sm:hidden grid grid-cols-2 gap-3 p-4 border-t border-slate-200">
                        <div className="bg-white rounded-lg p-3 text-center">
                          <p className="text-xs text-slate-400">Ventes</p>
                          <p className="text-lg font-bold text-slate-900">{member.salesCount}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <p className="text-xs text-slate-400">Heures</p>
                          <p className="text-lg font-bold text-blue-700">{member.shiftHours}h</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center col-span-2">
                          <p className="text-xs text-slate-400">Revenu total</p>
                          <p className="text-lg font-bold text-green-700">{fmt(member.revenue)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Aucun membre trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
