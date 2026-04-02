'use client';
import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import {
  Search, Filter, Download, Calendar, User, Package,
  ShoppingCart, LogIn, LogOut, Trash2, Edit3, Plus,
  AlertTriangle, FileText, Settings, ChevronLeft, ChevronRight,
  X, Activity, Shield
} from 'lucide-react';

type ActionType = 'Connexion' | 'Déconnexion' | 'Vente' | 'Stock' | 'Suppression' | 'Modification' | 'Création' | 'Export';
type ModuleType = 'Auth' | 'Point de Vente' | 'Inventaire' | 'Clients' | 'Rapports' | 'Utilisateurs' | 'Paramètres';
type SeverityType = 'info' | 'success' | 'warning' | 'danger';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar: string;
  action: ActionType;
  module: ModuleType;
  description: string;
  shop: string;
  ip: string;
  timestamp: string;
  severity: SeverityType;
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'al001', userId: 'u1', userName: 'Amadou Diallo', userRole: 'Admin', userAvatar: 'AD', action: 'Connexion', module: 'Auth', description: 'Connexion réussie depuis Chrome/Windows', shop: 'Boutique Conakry', ip: '192.168.1.10', timestamp: '2026-04-01 11:15:22', severity: 'info' },
  { id: 'al002', userId: 'u2', userName: 'Fatoumata Bah', userRole: 'Manager', userAvatar: 'FB', action: 'Vente', module: 'Point de Vente', description: 'Vente créée #INV-0848 — 2 800 000 GNF (Samsung Galaxy A55)', shop: 'Boutique Conakry', ip: '192.168.1.12', timestamp: '2026-04-01 11:03:10', severity: 'success' },
  { id: 'al003', userId: 'u3', userName: 'Mamadou Camara', userRole: 'Caissier', userAvatar: 'MC', action: 'Stock', module: 'Inventaire', description: 'Stock mis à jour: Tecno Spark 20 Pro — 8 → 18 unités (+10)', shop: 'Boutique Conakry', ip: '192.168.1.15', timestamp: '2026-04-01 10:45:05', severity: 'info' },
  { id: 'al004', userId: 'u4', userName: 'Aissatou Sow', userRole: 'Caissier', userAvatar: 'AS', action: 'Modification', module: 'Clients', description: 'Client modifié: Ibrahima Koné — Téléphone mis à jour', shop: 'Magasin Kaloum', ip: '192.168.1.20', timestamp: '2026-04-01 10:32:33', severity: 'info' },
  { id: 'al005', userId: 'u1', userName: 'Amadou Diallo', userRole: 'Admin', userAvatar: 'AD', action: 'Export', module: 'Rapports', description: 'Rapport mensuel exporté en PDF — Mars 2026', shop: 'Boutique Conakry', ip: '192.168.1.10', timestamp: '2026-04-01 10:15:00', severity: 'info' },
  { id: 'al006', userId: 'u2', userName: 'Fatoumata Bah', userRole: 'Manager', userAvatar: 'FB', action: 'Stock', module: 'Inventaire', description: 'Alerte stock: Chargeur Rapide 65W — Rupture totale (0 unités)', shop: 'Boutique Conakry', ip: '192.168.1.12', timestamp: '2026-04-01 09:58:44', severity: 'warning' },
  { id: 'al007', userId: 'u6', userName: 'Mariama Kouyaté', userRole: 'Caissier', userAvatar: 'MK', action: 'Vente', module: 'Point de Vente', description: 'Vente créée #INV-0847 — 1 200 000 GNF (Infinix Hot 40i)', shop: 'Boutique Ratoma', ip: '192.168.1.22', timestamp: '2026-04-01 09:42:22', severity: 'success' },
  { id: 'al008', userId: 'u1', userName: 'Amadou Diallo', userRole: 'Admin', userAvatar: 'AD', action: 'Création', module: 'Utilisateurs', description: 'Nouvel utilisateur créé: Sékou Barry (Caissier) — Boutique Labé', shop: 'Boutique Conakry', ip: '192.168.1.10', timestamp: '2026-04-01 09:30:11', severity: 'info' },
  { id: 'al009', userId: 'u3', userName: 'Mamadou Camara', userRole: 'Caissier', userAvatar: 'MC', action: 'Vente', module: 'Point de Vente', description: 'Vente créée #INV-0846 — 950 000 GNF (Tecno Spark 20)', shop: 'Boutique Conakry', ip: '192.168.1.15', timestamp: '2026-04-01 09:15:55', severity: 'success' },
  { id: 'al010', userId: 'u2', userName: 'Fatoumata Bah', userRole: 'Manager', userAvatar: 'FB', action: 'Connexion', module: 'Auth', description: 'Connexion réussie depuis Firefox/Android', shop: 'Boutique Conakry', ip: '192.168.1.12', timestamp: '2026-04-01 08:30:00', severity: 'info' },
  { id: 'al011', userId: 'u1', userName: 'Amadou Diallo', userRole: 'Admin', userAvatar: 'AD', action: 'Suppression', module: 'Inventaire', description: 'Produit supprimé: Écran LCD Tecno Spark 20 (prod-018)', shop: 'Boutique Conakry', ip: '192.168.1.10', timestamp: '2026-03-31 17:45:30', severity: 'danger' },
  { id: 'al012', userId: 'u4', userName: 'Aissatou Sow', userRole: 'Caissier', userAvatar: 'AS', action: 'Vente', module: 'Point de Vente', description: 'Vente créée #INV-0845 — 4 500 000 GNF (Samsung Galaxy A35)', shop: 'Magasin Kaloum', ip: '192.168.1.20', timestamp: '2026-03-31 17:20:15', severity: 'success' },
  { id: 'al013', userId: 'u5', userName: 'Ibrahim Barry', userRole: 'Manager', userAvatar: 'IB', action: 'Déconnexion', module: 'Auth', description: 'Déconnexion manuelle', shop: 'Magasin Kaloum', ip: '192.168.1.18', timestamp: '2026-03-31 16:55:00', severity: 'info' },
  { id: 'al014', userId: 'u1', userName: 'Amadou Diallo', userRole: 'Admin', userAvatar: 'AD', action: 'Modification', module: 'Paramètres', description: 'Paramètres entreprise mis à jour — Nom commercial modifié', shop: 'Boutique Conakry', ip: '192.168.1.10', timestamp: '2026-03-31 16:30:00', severity: 'warning' },
  { id: 'al015', userId: 'u6', userName: 'Mariama Kouyaté', userRole: 'Caissier', userAvatar: 'MK', action: 'Création', module: 'Clients', description: 'Nouveau client créé: Oumar Kouyaté — Kindia', shop: 'Boutique Ratoma', ip: '192.168.1.22', timestamp: '2026-03-31 15:10:44', severity: 'success' },
  { id: 'al016', userId: 'u3', userName: 'Mamadou Camara', userRole: 'Caissier', userAvatar: 'MC', action: 'Stock', module: 'Inventaire', description: 'Stock mis à jour: Samsung Galaxy A15 — 5 → 3 unités (vente)', shop: 'Boutique Conakry', ip: '192.168.1.15', timestamp: '2026-03-31 14:22:10', severity: 'warning' },
  { id: 'al017', userId: 'u2', userName: 'Fatoumata Bah', userRole: 'Manager', userAvatar: 'FB', action: 'Export', module: 'Rapports', description: 'Export Excel — Inventaire complet Boutique Conakry', shop: 'Boutique Conakry', ip: '192.168.1.12', timestamp: '2026-03-31 13:45:00', severity: 'info' },
  { id: 'al018', userId: 'u1', userName: 'Amadou Diallo', userRole: 'Admin', userAvatar: 'AD', action: 'Suppression', module: 'Clients', description: 'Client supprimé: Compte test (C099) — Données effacées', shop: 'Boutique Conakry', ip: '192.168.1.10', timestamp: '2026-03-30 11:00:00', severity: 'danger' },
  { id: 'al019', userId: 'u4', userName: 'Aissatou Sow', userRole: 'Caissier', userAvatar: 'AS', action: 'Connexion', module: 'Auth', description: 'Connexion réussie depuis Safari/iPhone', shop: 'Magasin Kaloum', ip: '192.168.1.20', timestamp: '2026-03-30 08:05:33', severity: 'info' },
  { id: 'al020', userId: 'u1', userName: 'Amadou Diallo', userRole: 'Admin', userAvatar: 'AD', action: 'Modification', module: 'Utilisateurs', description: 'Utilisateur désactivé: Ibrahim Barry (Manager) — Magasin Kaloum', shop: 'Boutique Conakry', ip: '192.168.1.10', timestamp: '2026-03-29 16:00:00', severity: 'warning' },
];

const ACTION_CONFIG: Record<ActionType, { icon: React.ElementType; bg: string; text: string; border: string }> = {
  'Connexion': { icon: LogIn, bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'Déconnexion': { icon: LogOut, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  'Vente': { icon: ShoppingCart, bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'Stock': { icon: Package, bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'Suppression': { icon: Trash2, bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'Modification': { icon: Edit3, bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'Création': { icon: Plus, bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  'Export': { icon: Download, bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
};

const SEVERITY_CONFIG: Record<SeverityType, { dot: string; row: string }> = {
  info: { dot: 'bg-blue-400', row: '' },
  success: { dot: 'bg-green-500', row: '' },
  warning: { dot: 'bg-amber-500', row: 'bg-amber-50/40' },
  danger: { dot: 'bg-red-500', row: 'bg-red-50/40' },
};

const MODULE_ICONS: Record<ModuleType, React.ElementType> = {
  'Auth': Shield,
  'Point de Vente': ShoppingCart,
  'Inventaire': Package,
  'Clients': User,
  'Rapports': FileText,
  'Utilisateurs': User,
  'Paramètres': Settings,
};

const ALL_USERS = ['Tous les utilisateurs', 'Amadou Diallo', 'Fatoumata Bah', 'Mamadou Camara', 'Aissatou Sow', 'Ibrahim Barry', 'Mariama Kouyaté'];
const ALL_MODULES: (ModuleType | 'Tous les modules')[] = ['Tous les modules', 'Auth', 'Point de Vente', 'Inventaire', 'Clients', 'Rapports', 'Utilisateurs', 'Paramètres'];
const ALL_ACTIONS: (ActionType | 'Toutes les actions')[] = ['Toutes les actions', 'Connexion', 'Déconnexion', 'Vente', 'Stock', 'Suppression', 'Modification', 'Création', 'Export'];

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('Tous les utilisateurs');
  const [moduleFilter, setModuleFilter] = useState<ModuleType | 'Tous les modules'>('Tous les modules');
  const [actionFilter, setActionFilter] = useState<ActionType | 'Toutes les actions'>('Toutes les actions');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter(log => {
      const matchSearch = !search ||
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase()) ||
        log.ip.includes(search);
      const matchUser = userFilter === 'Tous les utilisateurs' || log.userName === userFilter;
      const matchModule = moduleFilter === 'Tous les modules' || log.module === moduleFilter;
      const matchAction = actionFilter === 'Toutes les actions' || log.action === actionFilter;
      const matchDateFrom = !dateFrom || log.timestamp >= dateFrom;
      const matchDateTo = !dateTo || log.timestamp <= dateTo + ' 23:59:59';
      return matchSearch && matchUser && matchModule && matchAction && matchDateFrom && matchDateTo;
    });
  }, [search, userFilter, moduleFilter, actionFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleExportCSV = () => {
    const headers = ['ID', 'Utilisateur', 'Rôle', 'Action', 'Module', 'Description', 'Magasin', 'IP', 'Date/Heure'];
    const rows = filtered.map(l => [l.id, l.userName, l.userRole, l.action, l.module, `"${l.description}"`, l.shop, l.ip, l.timestamp]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch('');
    setUserFilter('Tous les utilisateurs');
    setModuleFilter('Tous les modules');
    setActionFilter('Toutes les actions');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters = search || userFilter !== 'Tous les utilisateurs' || moduleFilter !== 'Tous les modules' || actionFilter !== 'Toutes les actions' || dateFrom || dateTo;

  const stats = {
    total: MOCK_AUDIT_LOGS.length,
    today: MOCK_AUDIT_LOGS.filter(l => l.timestamp.startsWith('2026-04-01')).length,
    deletions: MOCK_AUDIT_LOGS.filter(l => l.action === 'Suppression').length,
    warnings: MOCK_AUDIT_LOGS.filter(l => l.severity === 'danger' || l.severity === 'warning').length,
  };

  return (
    <AppLayout>
      <Topbar title="Journal d'audit" subtitle="Traçabilité complète des actions utilisateurs" />
      <div className="px-4 lg:px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total événements', value: stats.total, icon: Activity, bg: 'bg-slate-100', color: 'text-slate-700' },
            { label: 'Aujourd\'hui', value: stats.today, icon: Calendar, bg: 'bg-blue-100', color: 'text-blue-700' },
            { label: 'Suppressions', value: stats.deletions, icon: Trash2, bg: 'bg-red-100', color: 'text-red-700' },
            { label: 'Alertes', value: stats.warnings, icon: AlertTriangle, bg: 'bg-amber-100', color: 'text-amber-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-72 focus-within:border-amber-400 focus-within:bg-white transition-all">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher utilisateur, action, IP..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border transition-colors ${showFilters || hasActiveFilters ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter size={14} />
                Filtres
                {hasActiveFilters && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
              </button>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                  <X size={12} /> Effacer les filtres
                </button>
              )}

              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{filtered.length}</span> événements
                </span>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Download size={14} />
                  Exporter CSV
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Utilisateur</label>
                  <select
                    value={userFilter}
                    onChange={e => { setUserFilter(e.target.value); setPage(1); }}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400"
                  >
                    {ALL_USERS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Module</label>
                  <select
                    value={moduleFilter}
                    onChange={e => { setModuleFilter(e.target.value as ModuleType | 'Tous les modules'); setPage(1); }}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400"
                  >
                    {ALL_MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Action</label>
                  <select
                    value={actionFilter}
                    onChange={e => { setActionFilter(e.target.value as ActionType | 'Toutes les actions'); setPage(1); }}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400"
                  >
                    {ALL_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Période</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-2 bg-white text-slate-700 outline-none focus:border-amber-400"
                    />
                    <span className="text-slate-400 text-xs">→</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => { setDateTo(e.target.value); setPage(1); }}
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-2 bg-white text-slate-700 outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Module</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Magasin</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">IP</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date/Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      <Activity size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium">Aucun événement trouvé</p>
                      <p className="text-xs mt-1">Essayez de modifier vos filtres</p>
                    </td>
                  </tr>
                ) : paginated.map(log => {
                  const actionCfg = ACTION_CONFIG[log.action];
                  const sevCfg = SEVERITY_CONFIG[log.severity];
                  const ActionIcon = actionCfg.icon;
                  const ModuleIcon = MODULE_ICONS[log.module];
                  return (
                    <tr key={log.id} className={`hover:bg-slate-50 transition-colors ${sevCfg.row}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-xs">{log.userAvatar}</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{log.userName}</p>
                            <p className="text-xs text-slate-400">{log.userRole}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${actionCfg.bg} ${actionCfg.text} ${actionCfg.border}`}>
                          <ActionIcon size={11} />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <ModuleIcon size={12} className="text-slate-400" />
                          {log.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${sevCfg.dot}`} />
                          <p className="text-xs text-slate-700 leading-relaxed">{log.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">{log.shop}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-400">{log.ip}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{log.timestamp.split(' ')[0]}</p>
                          <p className="text-xs text-slate-400">{log.timestamp.split(' ')[1]}</p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Affichage {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} sur {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${page === pageNum ? 'bg-amber-500 text-white' : 'border border-slate-200 text-slate-600 hover:bg-white'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
