'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Store, ShoppingBag, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight, Package, Users, MapPin, Activity, RefreshCw, ChevronDown } from 'lucide-react';

const fmt = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Md GNF`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M GNF`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K GNF`;
  return `${n} GNF`;
};

type DatePeriod = 'Aujourd\'hui' | '7 jours' | '30 jours' | 'Annuelle';

const shops = [
  {
    id: 'all', name: 'Tous les magasins', location: 'Vue globale',
    revenue: { "Aujourd'hui": 18_500_000, '7 jours': 525_000_000, '30 jours': 2_100_000_000, 'Annuelle': 25_200_000_000 },
    transactions: { "Aujourd'hui": 52, '7 jours': 1515, '30 jours': 6200, 'Annuelle': 74400 },
    growth: 11, color: '#f59e0b',
    stock: 312, lowStock: 18, outOfStock: 6, customers: 248,
  },
  {
    id: 'S001', name: 'Boutique Conakry', location: 'Madina, Conakry',
    revenue: { "Aujourd'hui": 10_200_000, '7 jours': 285_000_000, '30 jours': 1_140_000_000, 'Annuelle': 13_680_000_000 },
    transactions: { "Aujourd'hui": 30, '7 jours': 820, '30 jours': 3280, 'Annuelle': 39360 },
    growth: 14, color: '#f59e0b',
    stock: 156, lowStock: 9, outOfStock: 3, customers: 142,
  },
  {
    id: 'S002', name: 'Boutique Kindia', location: 'Centre-ville, Kindia',
    revenue: { "Aujourd'hui": 5_100_000, '7 jours': 142_000_000, '30 jours': 568_000_000, 'Annuelle': 6_816_000_000 },
    transactions: { "Aujourd'hui": 14, '7 jours': 410, '30 jours': 1640, 'Annuelle': 19680 },
    growth: 8, color: '#3b82f6',
    stock: 98, lowStock: 6, outOfStock: 2, customers: 67,
  },
  {
    id: 'S003', name: 'Boutique Labé', location: 'Marché Central, Labé',
    revenue: { "Aujourd'hui": 3_200_000, '7 jours': 98_000_000, '30 jours': 392_000_000, 'Annuelle': 4_704_000_000 },
    transactions: { "Aujourd'hui": 8, '7 jours': 285, '30 jours': 1140, 'Annuelle': 13680 },
    growth: -2, color: '#8b5cf6',
    stock: 58, lowStock: 3, outOfStock: 1, customers: 39,
  },
];

const revenueByPeriod: Record<DatePeriod, { name: string; Conakry: number; Kindia: number; Labé: number }[]> = {
  "Aujourd'hui": [
    { name: '8h', Conakry: 1_200_000, Kindia: 600_000, Labé: 400_000 },
    { name: '10h', Conakry: 2_100_000, Kindia: 900_000, Labé: 600_000 },
    { name: '12h', Conakry: 1_800_000, Kindia: 800_000, Labé: 500_000 },
    { name: '14h', Conakry: 2_400_000, Kindia: 1_100_000, Labé: 700_000 },
    { name: '16h', Conakry: 1_600_000, Kindia: 700_000, Labé: 450_000 },
    { name: '18h', Conakry: 1_100_000, Kindia: 1_000_000, Labé: 550_000 },
  ],
  '7 jours': [
    { name: 'Lun', Conakry: 38_000_000, Kindia: 19_000_000, Labé: 13_000_000 },
    { name: 'Mar', Conakry: 52_000_000, Kindia: 24_000_000, Labé: 16_000_000 },
    { name: 'Mer', Conakry: 41_000_000, Kindia: 20_000_000, Labé: 12_000_000 },
    { name: 'Jeu', Conakry: 58_000_000, Kindia: 28_000_000, Labé: 18_000_000 },
    { name: 'Ven', Conakry: 72_000_000, Kindia: 35_000_000, Labé: 22_000_000 },
    { name: 'Sam', Conakry: 89_000_000, Kindia: 42_000_000, Labé: 28_000_000 },
    { name: 'Dim', Conakry: 31_000_000, Kindia: 15_000_000, Labé: 10_000_000 },
  ],
  '30 jours': [
    { name: 'S1', Conakry: 240_000_000, Kindia: 120_000_000, Labé: 80_000_000 },
    { name: 'S2', Conakry: 285_000_000, Kindia: 142_000_000, Labé: 98_000_000 },
    { name: 'S3', Conakry: 310_000_000, Kindia: 155_000_000, Labé: 105_000_000 },
    { name: 'S4', Conakry: 305_000_000, Kindia: 151_000_000, Labé: 109_000_000 },
  ],
  'Annuelle': [
    { name: 'Jan', Conakry: 1_050_000_000, Kindia: 520_000_000, Labé: 360_000_000 },
    { name: 'Fév', Conakry: 980_000_000, Kindia: 490_000_000, Labé: 330_000_000 },
    { name: 'Mar', Conakry: 1_140_000_000, Kindia: 568_000_000, Labé: 392_000_000 },
    { name: 'Avr', Conakry: 1_200_000_000, Kindia: 600_000_000, Labé: 410_000_000 },
    { name: 'Mai', Conakry: 1_100_000_000, Kindia: 550_000_000, Labé: 380_000_000 },
    { name: 'Jun', Conakry: 1_250_000_000, Kindia: 625_000_000, Labé: 430_000_000 },
  ],
};

const topProductsByLocation = [
  { product: 'Samsung Galaxy A55', conakry: 18, kindia: 8, labe: 5, total: 31 },
  { product: 'Tecno Spark 20', conakry: 24, kindia: 12, labe: 7, total: 43 },
  { product: 'Infinix Hot 40', conakry: 20, kindia: 9, labe: 6, total: 35 },
  { product: 'iPhone 14', conakry: 8, kindia: 3, labe: 1, total: 12 },
  { product: 'AirPods Pro', conakry: 15, kindia: 6, labe: 4, total: 25 },
];

const paymentMix = [
  { name: 'Orange Money', value: 42, color: '#f97316' },
  { name: 'Cash', value: 35, color: '#22c55e' },
  { name: 'Mobile Money', value: 15, color: '#3b82f6' },
  { name: 'PayCard', value: 8, color: '#8b5cf6' },
];

const alerts = [
  { id: 'a1', type: 'stock', severity: 'high', message: '6 produits en rupture de stock', shop: 'Tous les magasins', time: 'Il y a 2h' },
  { id: 'a2', type: 'stock', severity: 'medium', message: '18 produits en stock faible', shop: 'Tous les magasins', time: 'Il y a 3h' },
  { id: 'a3', type: 'payment', severity: 'medium', message: '5 clients avec dettes impayées > 30j', shop: 'Boutique Conakry', time: 'Il y a 5h' },
  { id: 'a4', type: 'sales', severity: 'low', message: 'Baisse des ventes -2% vs semaine dernière', shop: 'Boutique Labé', time: 'Hier' },
  { id: 'a5', type: 'stock', severity: 'high', message: 'Chargeur Rapide 65W — Rupture totale', shop: 'Boutique Kindia', time: 'Il y a 1j' },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-bold text-slate-900 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: <span className="text-slate-900">{fmt(p.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function GlobalDashboardPage() {
  const router = useRouter();
  const [selectedShop, setSelectedShop] = useState('all');
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [activePeriod, setActivePeriod] = useState<DatePeriod>("Aujourd'hui");
  const [lastRefresh] = useState('01/04/2026 11:24');

  const currentShop = shops.find(s => s.id === selectedShop) ?? shops[0];
  const currentRevenue = currentShop.revenue[activePeriod];
  const currentTransactions = currentShop.transactions[activePeriod];
  const chartData = revenueByPeriod[activePeriod];

  const severityConfig = {
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
    low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700' },
  };

  const periods: DatePeriod[] = ["Aujourd'hui", '7 jours', '30 jours', 'Annuelle'];

  return (
    <AppLayout>
      <Topbar
        title="Tableau de bord global"
        subtitle="Vue consolidée de tous les magasins"
      />
      <div className="px-4 lg:px-6 xl:px-8 2xl:px-10 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Shop Selector */}
            <div className="relative">
              <button
                onClick={() => setShowShopDropdown(!showShopDropdown)}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-amber-400 transition-colors shadow-sm"
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentShop.color }} />
                {currentShop.name}
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showShopDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showShopDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowShopDropdown(false)} />
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 min-w-[220px] overflow-hidden">
                    {shops.map(shop => (
                      <button
                        key={shop.id}
                        onClick={() => { setSelectedShop(shop.id); setShowShopDropdown(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 transition-colors text-left ${selectedShop === shop.id ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-700'}`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: shop.color }} />
                        <div>
                          <p className="font-semibold">{shop.name}</p>
                          <p className="text-xs text-slate-400">{shop.location}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <RefreshCw size={12} />
              Mis à jour: {lastRefresh}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activePeriod === p ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-amber-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Chiffre d\'affaires total', value: fmt(currentRevenue),
              icon: DollarSign, bg: 'bg-amber-100', color: 'text-amber-600',
              trend: currentShop.growth, sub: `${currentTransactions.toLocaleString('fr-FR')} transactions`
            },
            {
              label: 'Ventes totales', value: currentTransactions.toLocaleString('fr-FR'),
              icon: ShoppingBag, bg: 'bg-blue-100', color: 'text-blue-600',
              trend: 6, sub: 'Transactions validées'
            },
            {
              label: 'Clients actifs', value: currentShop.customers.toString(),
              icon: Users, bg: 'bg-purple-100', color: 'text-purple-600',
              trend: 9, sub: 'Ce mois-ci'
            },
            {
              label: 'Alertes stock', value: `${currentShop.lowStock + currentShop.outOfStock}`,
              icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600',
              trend: -5, sub: `${currentShop.outOfStock} ruptures · ${currentShop.lowStock} faibles`
            },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon size={20} className={card.color} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${card.trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {card.trend > 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {Math.abs(card.trend)}%
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{card.label}</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums leading-tight">{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Shop Performance Cards */}
        {selectedShop === 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {shops.slice(1).map(shop => (
              <div key={shop.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-amber-300 transition-colors cursor-pointer" onClick={() => setSelectedShop(shop.id)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${shop.color}20` }}>
                      <Store size={16} style={{ color: shop.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{shop.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} />{shop.location}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${shop.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {shop.growth > 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {Math.abs(shop.growth)}%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-slate-400">Revenus</p>
                    <p className="text-sm font-bold text-slate-900 tabular-nums">{fmt(shop.revenue[activePeriod])}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Transactions</p>
                    <p className="text-sm font-bold text-slate-900">{shop.transactions[activePeriod].toLocaleString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Clients</p>
                    <p className="text-sm font-bold text-slate-900">{shop.customers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Alertes</p>
                    <p className={`text-sm font-bold ${shop.lowStock + shop.outOfStock > 5 ? 'text-red-600' : 'text-amber-600'}`}>
                      {shop.lowStock + shop.outOfStock}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue by Shop Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900">Revenus par magasin — {activePeriod}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Comparaison des performances</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="Conakry" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Kindia" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Labé" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Mix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-1">Méthodes de paiement</h3>
            <p className="text-xs text-slate-500 mb-4">Répartition globale</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={paymentMix} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {paymentMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {paymentMix.map(p => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-600">{p.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products by Location + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Top Products by Location */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-amber-500" />
                <h3 className="font-bold text-slate-900">Top produits par localisation</h3>
              </div>
              <span className="text-xs text-slate-400">{activePeriod}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Produit</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-amber-600 uppercase tracking-wide">Conakry</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-blue-600 uppercase tracking-wide">Kindia</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-purple-600 uppercase tracking-wide">Labé</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topProductsByLocation.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {i + 1}
                          </div>
                          <span className="font-medium text-slate-900 text-xs">{row.product}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-6 bg-amber-50 text-amber-700 rounded text-xs font-bold">{row.conakry}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-6 bg-blue-50 text-blue-700 rounded text-xs font-bold">{row.kindia}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-6 bg-purple-50 text-purple-700 rounded text-xs font-bold">{row.labe}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-bold text-slate-900 text-xs">{row.total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                <h3 className="font-bold text-slate-900">Alertes</h3>
              </div>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{alerts.length}</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {alerts.map(alert => {
                const cfg = severityConfig[alert.severity as keyof typeof severityConfig];
                return (
                  <div key={alert.id} className={`px-4 py-3 ${cfg.bg} border-l-2 ${alert.severity === 'high' ? 'border-l-red-500' : alert.severity === 'medium' ? 'border-l-amber-500' : 'border-l-blue-400'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${cfg.text}`}>{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Store size={10} />{alert.shop}
                          </span>
                          <span className="text-xs text-slate-400">{alert.time}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${cfg.badge} shrink-0`}>
                        {alert.severity === 'high' ? 'Urgent' : alert.severity === 'medium' ? 'Moyen' : 'Info'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-slate-100">
              <button
                onClick={() => router.push('/inventory-management')}
                className="w-full text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors flex items-center justify-center gap-1 hover:bg-amber-50 py-1.5 rounded-lg"
              >
                <Activity size={12} />
                Voir toutes les alertes
              </button>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              <h3 className="font-bold text-slate-900">Activité récente — Tous les magasins</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { user: 'Amadou Diallo', action: 'Vente #INV-0848 — 2 800 000 GNF', shop: 'Boutique Conakry', time: 'Il y a 12 min', type: 'sale', avatar: 'AD' },
              { user: 'Fatoumata Bah', action: 'Stock mis à jour: Tecno Spark 20 (+10)', shop: 'Boutique Kindia', time: 'Il y a 28 min', type: 'stock', avatar: 'FB' },
              { user: 'Mariama Kouyaté', action: 'Vente #INV-0847 — 1 200 000 GNF', shop: 'Boutique Labé', time: 'Il y a 45 min', type: 'sale', avatar: 'MK' },
              { user: 'Mamadou Camara', action: 'Nouveau client enregistré: Ibrahima Koné', shop: 'Boutique Conakry', time: 'Il y a 1h', type: 'customer', avatar: 'MC' },
              { user: 'Aissatou Sow', action: 'Vente #INV-0846 — 950 000 GNF', shop: 'Boutique Kindia', time: 'Il y a 1h 20min', type: 'sale', avatar: 'AS' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-xs">{item.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{item.user}</p>
                  <p className="text-xs text-slate-500 truncate">{item.action}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                    <Store size={10} />{item.shop}
                  </span>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
