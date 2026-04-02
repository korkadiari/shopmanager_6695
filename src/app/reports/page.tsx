'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, FileText, Table2, Store, Package, ArrowUpRight, ArrowDownRight, Eye, Download, Search, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

type Period = 'daily' | 'weekly' | 'monthly' | 'annual';
type ReportTab = 'analytics' | 'invoices';

const dailyData = [
  { name: 'Lun', ventes: 4_200_000, transactions: 12 },
  { name: 'Mar', ventes: 6_800_000, transactions: 19 },
  { name: 'Mer', ventes: 5_100_000, transactions: 15 },
  { name: 'Jeu', ventes: 7_400_000, transactions: 22 },
  { name: 'Ven', ventes: 9_200_000, transactions: 28 },
  { name: 'Sam', ventes: 11_500_000, transactions: 35 },
  { name: 'Dim', ventes: 3_800_000, transactions: 10 },
];

const weeklyData = [
  { name: 'S1', ventes: 38_000_000, transactions: 112 },
  { name: 'S2', ventes: 42_500_000, transactions: 128 },
  { name: 'S3', ventes: 35_200_000, transactions: 98 },
  { name: 'S4', ventes: 48_100_000, transactions: 145 },
];

const monthlyData = [
  { name: 'Jan', ventes: 145_000_000, transactions: 420 },
  { name: 'Fév', ventes: 132_000_000, transactions: 385 },
  { name: 'Mar', ventes: 168_000_000, transactions: 490 },
  { name: 'Avr', ventes: 155_000_000, transactions: 445 },
  { name: 'Mai', ventes: 178_000_000, transactions: 512 },
  { name: 'Jun', ventes: 162_000_000, transactions: 468 },
  { name: 'Jul', ventes: 190_000_000, transactions: 548 },
  { name: 'Aoû', ventes: 175_000_000, transactions: 505 },
  { name: 'Sep', ventes: 188_000_000, transactions: 540 },
  { name: 'Oct', ventes: 202_000_000, transactions: 582 },
  { name: 'Nov', ventes: 215_000_000, transactions: 620 },
  { name: 'Déc', ventes: 248_000_000, transactions: 715 },
];

const annualData = [
  { name: '2022', ventes: 1_200_000_000, transactions: 3_450 },
  { name: '2023', ventes: 1_580_000_000, transactions: 4_620 },
  { name: '2024', ventes: 1_920_000_000, transactions: 5_580 },
  { name: '2025', ventes: 2_158_000_000, transactions: 6_290 },
  { name: '2026', ventes: 480_000_000, transactions: 1_380 },
];

const topProducts = [
  { rank: 1, name: 'Samsung Galaxy A55', category: 'Smartphones', sold: 48, revenue: 134_400_000, trend: 12 },
  { rank: 2, name: 'Tecno Spark 20', category: 'Smartphones', sold: 62, revenue: 58_900_000, trend: 8 },
  { rank: 3, name: 'Infinix Hot 40', category: 'Smartphones', sold: 55, revenue: 66_000_000, trend: -3 },
  { rank: 4, name: 'iPhone 14', category: 'Smartphones', sold: 15, revenue: 127_500_000, trend: 22 },
  { rank: 5, name: 'AirPods Pro', category: 'Accessoires', sold: 38, revenue: 45_600_000, trend: 5 },
  { rank: 6, name: 'Samsung A15', category: 'Smartphones', sold: 71, revenue: 99_400_000, trend: -1 },
];

const shopPerformance = [
  { name: 'Boutique Conakry', location: 'Madina, Conakry', revenue: 285_000_000, transactions: 820, growth: 14, color: '#f59e0b' },
  { name: 'Boutique Kindia', location: 'Centre-ville, Kindia', revenue: 142_000_000, transactions: 410, growth: 8, color: '#3b82f6' },
  { name: 'Boutique Labé', location: 'Marché Central, Labé', revenue: 98_000_000, transactions: 285, growth: -2, color: '#8b5cf6' },
];

const paymentMix = [
  { name: 'Orange Money', value: 42, color: '#f97316' },
  { name: 'Cash', value: 35, color: '#22c55e' },
  { name: 'Mobile Money', value: 15, color: '#3b82f6' },
  { name: 'PayCard', value: 8, color: '#8b5cf6' },
];

type InvoiceStatus = 'Payée' | 'En attente' | 'Partielle' | 'Annulée';

interface Invoice {
  id: string;
  number: string;
  client: string;
  email: string;
  shop: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  status: InvoiceStatus;
  items: { name: string; qty: number; price: number }[];
}

const MOCK_INVOICES: Invoice[] = [
  { id: 'inv1', number: 'INV-2026-0234', client: 'Ibrahima Koné', email: 'ibrahima@email.com', shop: 'Boutique Conakry', date: '2026-04-01', dueDate: '2026-04-15', amount: 2_800_000, paid: 2_800_000, status: 'Payée', items: [{ name: 'Samsung Galaxy A55', qty: 1, price: 2_800_000 }] },
  { id: 'inv2', number: 'INV-2026-0233', client: 'Mariama Diallo', email: 'mariama@email.com', shop: 'Boutique Conakry', date: '2026-04-01', dueDate: '2026-04-15', amount: 950_000, paid: 500_000, status: 'Partielle', items: [{ name: 'Tecno Spark 20', qty: 1, price: 950_000 }] },
  { id: 'inv3', number: 'INV-2026-0232', client: 'Oumar Bah', email: 'oumar@email.com', shop: 'Boutique Kindia', date: '2026-03-31', dueDate: '2026-04-14', amount: 1_200_000, paid: 0, status: 'En attente', items: [{ name: 'Infinix Hot 40', qty: 2, price: 600_000 }] },
  { id: 'inv4', number: 'INV-2026-0231', client: 'Fatoumata Sow', email: 'fatoumata@email.com', shop: 'Boutique Labé', date: '2026-03-30', dueDate: '2026-04-13', amount: 8_500_000, paid: 8_500_000, status: 'Payée', items: [{ name: 'iPhone 14', qty: 1, price: 8_500_000 }] },
  { id: 'inv5', number: 'INV-2026-0230', client: 'Amadou Camara', email: 'amadou@email.com', shop: 'Boutique Conakry', date: '2026-03-29', dueDate: '2026-04-12', amount: 450_000, paid: 0, status: 'Annulée', items: [{ name: 'AirPods Pro', qty: 1, price: 450_000 }] },
  { id: 'inv6', number: 'INV-2026-0229', client: 'Aissatou Barry', email: 'aissatou@email.com', shop: 'Boutique Kindia', date: '2026-03-28', dueDate: '2026-04-11', amount: 1_400_000, paid: 700_000, status: 'Partielle', items: [{ name: 'Samsung A15', qty: 2, price: 700_000 }] },
  { id: 'inv7', number: 'INV-2026-0228', client: 'Mamadou Kouyaté', email: 'mamadou@email.com', shop: 'Boutique Conakry', date: '2026-03-27', dueDate: '2026-04-10', amount: 3_200_000, paid: 3_200_000, status: 'Payée', items: [{ name: 'Samsung Galaxy A55', qty: 1, price: 2_800_000 }, { name: 'AirPods Pro', qty: 1, price: 400_000 }] },
  { id: 'inv8', number: 'INV-2026-0227', client: 'Kadiatou Diallo', email: 'kadiatou@email.com', shop: 'Boutique Labé', date: '2026-03-26', dueDate: '2026-04-09', amount: 600_000, paid: 0, status: 'En attente', items: [{ name: 'Infinix Hot 40', qty: 1, price: 600_000 }] },
];

const fmt = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Md GNF`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M GNF`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K GNF`;
  return `${n} GNF`;
};

const periodLabels: Record<Period, string> = {
  daily: 'Quotidien (7 derniers jours)',
  weekly: 'Hebdomadaire (4 semaines)',
  monthly: 'Mensuel (12 mois)',
  annual: 'Annuel',
};

const periodData: Record<Period, typeof dailyData> = {
  daily: dailyData,
  weekly: weeklyData,
  monthly: monthlyData,
  annual: annualData,
};

const periodKPIs: Record<Period, { revenue: number; transactions: number; avgTicket: number; growth: number }> = {
  daily: { revenue: 48_000_000, transactions: 141, avgTicket: 340_426, growth: 12 },
  weekly: { revenue: 163_800_000, transactions: 483, avgTicket: 339_130, growth: 8 },
  monthly: { revenue: 2_158_000_000, transactions: 6_290, avgTicket: 343_085, growth: 14 },
  annual: { revenue: 2_158_000_000, transactions: 6_290, avgTicket: 343_085, growth: 14 },
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-bold text-slate-900 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-slate-600">{p.name}: <span className="font-semibold text-slate-900">{typeof p.value === 'number' && p.value > 10000 ? fmt(p.value) : p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

const statusConfig: Record<InvoiceStatus, { color: string; icon: React.ElementType; label: string }> = {
  'Payée': { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Payée' },
  'En attente': { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'En attente' },
  'Partielle': { color: 'bg-blue-100 text-blue-700', icon: AlertCircle, label: 'Partielle' },
  'Annulée': { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Annulée' },
};

interface InvoiceDetailModalProps {
  invoice: Invoice;
  onClose: () => void;
}

function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
  const cfg = statusConfig[invoice.status];
  const StatusIcon = cfg.icon;
  const balance = invoice.amount - invoice.paid;

  const handleDownload = () => {
    alert(`Téléchargement PDF — ${invoice.number}\n\nIntégration backend requise pour générer le PDF.`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-amber-500" />
            <h2 className="font-bold text-slate-900">{invoice.number}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <XCircle size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${cfg.color} w-fit`}>
            <StatusIcon size={14} />
            <span className="text-sm font-semibold">{cfg.label}</span>
          </div>

          {/* Client & Shop */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Client</p>
              <p className="font-semibold text-slate-800">{invoice.client}</p>
              <p className="text-xs text-slate-400">{invoice.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Magasin</p>
              <p className="font-semibold text-slate-800">{invoice.shop}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Date émission</p>
              <p className="text-sm font-medium text-slate-700">{invoice.date}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Échéance</p>
              <p className="text-sm font-medium text-slate-700">{invoice.dueDate}</p>
            </div>
          </div>

          {/* Items */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Articles</p>
            </div>
            {invoice.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.qty} × {fmt(item.price)}</p>
                </div>
                <p className="text-sm font-bold text-slate-900">{fmt(item.qty * item.price)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Montant total</span>
              <span className="font-bold text-slate-900">{fmt(invoice.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Montant payé</span>
              <span className="font-semibold text-green-700">{fmt(invoice.paid)}</span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                <span className="text-amber-600 font-semibold">Solde restant</span>
                <span className="font-bold text-amber-700">{fmt(balance)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">Fermer</button>
          <button onClick={handleDownload} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
            <Download size={15} /> Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [shopFilter, setShopFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<ReportTab>('analytics');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('Tous');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const kpis = periodKPIs[period];
  const chartData = periodData[period];

  const handleExport = (type: 'excel' | 'pdf') => {
    alert(`Export ${type.toUpperCase()} — Rapport ${periodLabels[period]}\n\nFonctionnalité disponible avec l'intégration backend.`);
  };

  const filteredInvoices = MOCK_INVOICES.filter(inv => {
    const matchSearch = inv.number.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.client.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.shop.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchStatus = invoiceStatusFilter === 'Tous' || inv.status === invoiceStatusFilter;
    return matchSearch && matchStatus;
  });

  const invoiceStats = {
    total: MOCK_INVOICES.length,
    paid: MOCK_INVOICES.filter(i => i.status === 'Payée').length,
    pending: MOCK_INVOICES.filter(i => i.status === 'En attente').length,
    partial: MOCK_INVOICES.filter(i => i.status === 'Partielle').length,
    totalAmount: MOCK_INVOICES.reduce((s, i) => s + i.amount, 0),
    paidAmount: MOCK_INVOICES.reduce((s, i) => s + i.paid, 0),
  };

  return (
    <AppLayout>
      <Topbar title="Rapports & Factures" subtitle="Analyse des performances et gestion des factures" />
      <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 max-w-screen-2xl mx-auto space-y-4 sm:space-y-6">

        {/* Main Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'analytics' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <BarChart3 size={15} />
            <span className="hidden sm:inline">Analytique</span>
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'invoices' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <FileText size={15} />
            <span className="hidden sm:inline">Factures</span>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{MOCK_INVOICES.length}</span>
          </button>
        </div>

        {/* ─── ANALYTICS TAB ─── */}
        {activeTab === 'analytics' && (
          <>
            {/* Period Selector & Export */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm flex-wrap">
                {(['daily', 'weekly', 'monthly', 'annual'] as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${period === p ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    {p === 'daily' ? 'Jour' : p === 'weekly' ? 'Semaine' : p === 'monthly' ? 'Mois' : 'Année'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={shopFilter}
                  onChange={e => setShopFilter(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">Tous les magasins</option>
                  {shopPerformance.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
                <button
                  onClick={() => handleExport('excel')}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <Table2 size={14} />
                  <span className="hidden sm:inline">Excel</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <FileText size={14} />
                  <span className="hidden sm:inline">PDF</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Chiffre d\'affaires', value: fmt(kpis.revenue), icon: DollarSign, bg: 'bg-amber-100', color: 'text-amber-600', trend: kpis.growth, sub: periodLabels[period] },
                { label: 'Transactions', value: kpis.transactions.toLocaleString('fr-FR'), icon: ShoppingBag, bg: 'bg-blue-100', color: 'text-blue-600', trend: 6, sub: 'Ventes effectuées' },
                { label: 'Ticket moyen', value: fmt(kpis.avgTicket), icon: BarChart3, bg: 'bg-purple-100', color: 'text-purple-600', trend: 3, sub: 'Par transaction' },
                { label: 'Croissance', value: `+${kpis.growth}%`, icon: TrendingUp, bg: 'bg-green-100', color: 'text-green-600', trend: kpis.growth, sub: 'vs période précédente' },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <card.icon size={16} className={card.color} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full ${card.trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {card.trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {Math.abs(card.trend)}%
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{card.label}</p>
                  <p className="text-base sm:text-xl font-bold text-slate-900 tabular-nums leading-tight">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-1 hidden sm:block">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Sales Chart + Payment Mix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Évolution des ventes</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{periodLabels[period]}</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barSize={period === 'annual' ? 40 : 24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ventes" name="Ventes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Méthodes de paiement</h3>
                <p className="text-xs text-slate-500 mb-3">Répartition des transactions</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={paymentMix} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                      {paymentMix.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
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

            {/* Top Products + Shop Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Package size={15} className="text-amber-500" />
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Top Produits</h3>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:block">{periodLabels[period]}</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {topProducts.map(p => (
                    <div key={p.rank} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${p.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {p.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.category} · {p.sold} vendus</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">{fmt(p.revenue)}</p>
                        <p className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${p.trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {p.trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {Math.abs(p.trend)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Store size={15} className="text-amber-500" />
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Performance par Magasin</h3>
                  </div>
                </div>
                <div className="p-4 sm:p-5 space-y-4">
                  {shopPerformance.map((shop, i) => {
                    const totalRevenue = shopPerformance.reduce((s, sh) => s + sh.revenue, 0);
                    const pct = Math.round((shop.revenue / totalRevenue) * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{shop.name}</p>
                            <p className="text-xs text-slate-400">{shop.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">{fmt(shop.revenue)}</p>
                            <p className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${shop.growth > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {shop.growth > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                              {Math.abs(shop.growth)}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: shop.color }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-500 w-8 text-right">{pct}%</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{shop.transactions} transactions</p>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Transactions — {periodLabels[period]}</p>
                  <ResponsiveContainer width="100%" height={90}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="transactions" name="Transactions" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── INVOICES TAB ─── */}
        {activeTab === 'invoices' && (
          <>
            {/* Invoice Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total factures', value: invoiceStats.total, color: 'text-slate-700', bg: 'bg-slate-100' },
                { label: 'Payées', value: invoiceStats.paid, color: 'text-green-700', bg: 'bg-green-100' },
                { label: 'En attente', value: invoiceStats.pending, color: 'text-amber-700', bg: 'bg-amber-100' },
                { label: 'Partielles', value: invoiceStats.partial, color: 'text-blue-700', bg: 'bg-blue-100' },
                { label: 'Montant total', value: fmt(invoiceStats.totalAmount), color: 'text-slate-700', bg: 'bg-slate-100' },
                { label: 'Montant encaissé', value: fmt(invoiceStats.paidAmount), color: 'text-green-700', bg: 'bg-green-100' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                  <p className="text-xs text-slate-500 mb-1 truncate">{s.label}</p>
                  <p className={`text-base sm:text-lg font-bold ${s.color} tabular-nums`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={invoiceSearch}
                  onChange={e => setInvoiceSearch(e.target.value)}
                  placeholder="Rechercher par numéro, client, magasin..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={invoiceStatusFilter}
                  onChange={e => setInvoiceStatusFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  <option value="Tous">Tous les statuts</option>
                  <option value="Payée">Payée</option>
                  <option value="En attente">En attente</option>
                  <option value="Partielle">Partielle</option>
                  <option value="Annulée">Annulée</option>
                </select>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Exporter</span>
                </button>
              </div>
            </div>

            {/* Invoice Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Facture</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Magasin</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredInvoices.map(inv => {
                      const cfg = statusConfig[inv.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                                <FileText size={14} className="text-amber-600" />
                              </div>
                              <div>
                                <p className="font-mono text-xs font-semibold text-slate-800">{inv.number}</p>
                                <p className="text-xs text-slate-400 hidden sm:block">Éch: {inv.dueDate}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800 text-sm">{inv.client}</p>
                            <p className="text-xs text-slate-400 hidden sm:block">{inv.email}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-sm hidden md:table-cell">{inv.shop}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">{inv.date}</td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-bold text-slate-900 tabular-nums text-sm">{fmt(inv.amount)}</p>
                            {inv.paid < inv.amount && inv.paid > 0 && (
                              <p className="text-xs text-green-600">Payé: {fmt(inv.paid)}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                              <StatusIcon size={11} />
                              <span className="hidden sm:inline">{cfg.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors"
                                title="Voir détails"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => { setSelectedInvoice(inv); }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                                title="Télécharger PDF"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredInvoices.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <FileText size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Aucune facture trouvée</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </AppLayout>
  );
}
