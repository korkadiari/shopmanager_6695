'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Users, Shield, Activity, Plus, Search, Edit2, UserX, UserCheck, Check, X, Clock, Package, ShoppingCart, FileText, Settings, Trash2, AlertTriangle, Save } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type Status = 'Actif' | 'Inactif';

interface Permission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface RoleDefinition {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
  permissions: Permission[];
}

interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: Status;
  shop: string;
  lastLogin: string;
  createdAt: string;
  avatar: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: string;
  ip: string;
}

const ALL_MODULES = ['Tableau de bord', 'Point de Vente', 'Inventaire', 'Clients', 'Rapports', 'Utilisateurs', 'Paramètres'];

const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'admin', name: 'Admin', color: 'bg-purple-100 text-purple-700 border border-purple-200', isSystem: true,
    permissions: ALL_MODULES.map(m => ({ module: m, view: true, create: true, edit: true, delete: true })),
  },
  {
    id: 'manager', name: 'Manager', color: 'bg-blue-100 text-blue-700 border border-blue-200', isSystem: true,
    permissions: ALL_MODULES.map(m => ({
      module: m,
      view: true,
      create: !['Utilisateurs', 'Paramètres'].includes(m),
      edit: !['Utilisateurs', 'Paramètres'].includes(m),
      delete: false,
    })),
  },
  {
    id: 'caissier', name: 'Caissier', color: 'bg-amber-100 text-amber-700 border border-amber-200', isSystem: true,
    permissions: ALL_MODULES.map(m => ({
      module: m,
      view: ['Tableau de bord', 'Point de Vente', 'Inventaire', 'Clients'].includes(m),
      create: ['Point de Vente', 'Clients'].includes(m),
      edit: false,
      delete: false,
    })),
  },
];

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Amadou Diallo', email: 'amadou@shopmanager.gn', roleId: 'admin', status: 'Actif', shop: 'Boutique Conakry', lastLogin: '2026-04-01 09:15', createdAt: '2025-01-10', avatar: 'AD' },
  { id: 'u2', name: 'Fatoumata Bah', email: 'fatoumata@shopmanager.gn', roleId: 'manager', status: 'Actif', shop: 'Boutique Conakry', lastLogin: '2026-04-01 08:30', createdAt: '2025-02-15', avatar: 'FB' },
  { id: 'u3', name: 'Mamadou Camara', email: 'mamadou@shopmanager.gn', roleId: 'caissier', status: 'Actif', shop: 'Boutique Conakry', lastLogin: '2026-03-31 17:45', createdAt: '2025-03-01', avatar: 'MC' },
  { id: 'u4', name: 'Aissatou Sow', email: 'aissatou@shopmanager.gn', roleId: 'caissier', status: 'Actif', shop: 'Magasin Kaloum', lastLogin: '2026-04-01 10:00', createdAt: '2025-03-20', avatar: 'AS' },
  { id: 'u5', name: 'Ibrahim Barry', email: 'ibrahim@shopmanager.gn', roleId: 'manager', status: 'Inactif', shop: 'Magasin Kaloum', lastLogin: '2026-03-15 14:20', createdAt: '2025-01-25', avatar: 'IB' },
  { id: 'u6', name: 'Mariama Kouyaté', email: 'mariama@shopmanager.gn', roleId: 'caissier', status: 'Actif', shop: 'Boutique Ratoma', lastLogin: '2026-04-01 07:55', createdAt: '2025-04-05', avatar: 'MK' },
];

const MOCK_LOGS: ActivityLog[] = [
  { id: 'l1', userId: 'u1', userName: 'Amadou Diallo', action: 'Connexion', module: 'Auth', timestamp: '2026-04-01 09:15:22', ip: '192.168.1.10' },
  { id: 'l2', userId: 'u2', userName: 'Fatoumata Bah', action: 'Vente créée #INV-0234', module: 'Point de Vente', timestamp: '2026-04-01 08:45:10', ip: '192.168.1.12' },
  { id: 'l3', userId: 'u3', userName: 'Mamadou Camara', action: 'Produit ajouté: Riz 25kg', module: 'Inventaire', timestamp: '2026-04-01 08:30:05', ip: '192.168.1.15' },
  { id: 'l4', userId: 'u4', userName: 'Aissatou Sow', action: 'Client modifié: Ibrahima Koné', module: 'Clients', timestamp: '2026-04-01 10:02:33', ip: '192.168.1.20' },
  { id: 'l5', userId: 'u1', userName: 'Amadou Diallo', action: 'Rapport exporté (PDF)', module: 'Rapports', timestamp: '2026-03-31 17:30:00', ip: '192.168.1.10' },
];

const MODULE_ICONS: Record<string, React.ElementType> = {
  'Tableau de bord': Activity,
  'Point de Vente': ShoppingCart,
  'Inventaire': Package,
  'Clients': Users,
  'Rapports': FileText,
  'Utilisateurs': Shield,
  'Paramètres': Settings,
};

type Tab = 'users' | 'roles' | 'logs';

// ─── User Modal ───────────────────────────────────────────────────────────────
interface UserModalProps {
  user: User | null;
  roles: RoleDefinition[];
  onClose: () => void;
  onSave: (u: User) => void;
}

function UserModal({ user, roles, onClose, onSave }: UserModalProps) {
  const isNew = !user;
  const [form, setForm] = useState<User>(
    user ?? { id: `u${Date.now()}`, name: '', email: '', roleId: 'caissier', status: 'Actif', shop: 'Boutique Conakry', lastLogin: '-', createdAt: new Date().toISOString().split('T')[0], avatar: '' }
  );
  const [dob, setDob] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const savedUser = { ...form, avatar: initials };

    if (isNew && dob) {
      // Default username = email, default password = DOB (DDMMYYYY)
      const dobFormatted = dob.replace(/-/g, '').slice(6, 8) + dob.replace(/-/g, '').slice(4, 6) + dob.replace(/-/g, '').slice(0, 4);
      setCreatedCredentials({ username: form.email, password: dobFormatted });
      setShowCredentials(true);
    }

    onSave(savedUser);
  };

  if (showCredentials && createdCredentials) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Check size={18} className="text-green-600" /> Utilisateur créé
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800 mb-3">Identifiants par défaut générés :</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-200">
                  <span className="text-xs text-slate-500">Nom d'utilisateur</span>
                  <span className="text-sm font-mono font-bold text-slate-800">{createdCredentials.username}</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-200">
                  <span className="text-xs text-slate-500">Mot de passe (DOB)</span>
                  <span className="text-sm font-mono font-bold text-slate-800">{createdCredentials.password}</span>
                </div>
              </div>
              <p className="text-xs text-amber-700 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ Communiquez ces identifiants à l'utilisateur. Il devra changer son mot de passe à la première connexion.
              </p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <button onClick={onClose} className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors">
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">{user ? 'Modifier utilisateur' : 'Nouvel utilisateur'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={18} className="text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Prénom Nom" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-slate-400 text-xs">(sera utilisé comme nom d'utilisateur)</span></label>
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="email@exemple.com" />
          </div>
          {isNew && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date de naissance <span className="text-slate-400 text-xs">(mot de passe par défaut)</span>
              </label>
              <input
                required
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-xs text-slate-400 mt-1">Le mot de passe sera généré au format JJMMAAAA</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
              <select value={form.roleId} onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option>Actif</option>
                <option>Inactif</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Magasin</label>
            <select value={form.shop} onChange={e => setForm(f => ({ ...f, shop: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option>Boutique Conakry</option>
              <option>Magasin Kaloum</option>
              <option>Boutique Ratoma</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <Save size={15} />Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Create Role Modal ────────────────────────────────────────────────────────
interface CreateRoleModalProps {
  onClose: () => void;
  onSave: (role: RoleDefinition) => void;
}

function CreateRoleModal({ onClose, onSave }: CreateRoleModalProps) {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>(
    ALL_MODULES.map(m => ({ module: m, view: false, create: false, edit: false, delete: false }))
  );

  const togglePerm = (moduleIdx: number, key: keyof Omit<Permission, 'module'>) => {
    setPermissions(prev => prev.map((p, i) => i === moduleIdx ? { ...p, [key]: !p[key] } : p));
  };

  const toggleAll = (moduleIdx: number) => {
    const p = permissions[moduleIdx];
    const allOn = p.view && p.create && p.edit && p.delete;
    setPermissions(prev => prev.map((item, i) => i === moduleIdx
      ? { ...item, view: !allOn, create: !allOn, edit: !allOn, delete: !allOn }
      : item
    ));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const colors = ['bg-green-100 text-green-700 border border-green-200', 'bg-pink-100 text-pink-700 border border-pink-200', 'bg-cyan-100 text-cyan-700 border border-cyan-200', 'bg-orange-100 text-orange-700 border border-orange-200'];
    const role: RoleDefinition = {
      id: `role-${Date.now()}`,
      name: name.trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      isSystem: false,
      permissions,
    };
    onSave(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">Créer un nouveau rôle</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={18} className="text-slate-500" /></button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom du rôle *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Superviseur, Comptable..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Permissions par module</p>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</th>
                    {['Voir', 'Créer', 'Modifier', 'Supprimer'].map(h => (
                      <th key={h} className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                    <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {permissions.map((p, idx) => {
                    const Icon = MODULE_ICONS[p.module] ?? Shield;
                    const allOn = p.view && p.create && p.edit && p.delete;
                    return (
                      <tr key={p.module} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Icon size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-700 text-sm">{p.module}</span>
                          </div>
                        </td>
                        {(['view', 'create', 'edit', 'delete'] as const).map(key => (
                          <td key={key} className="px-3 py-3 text-center">
                            <button
                              onClick={() => togglePerm(idx, key)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto transition-colors ${p[key] ? 'bg-green-100 hover:bg-green-200' : 'bg-slate-100 hover:bg-slate-200'}`}
                            >
                              {p[key] ? <Check size={12} className="text-green-600" /> : <X size={12} className="text-slate-400" />}
                            </button>
                          </td>
                        ))}
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => toggleAll(idx)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto transition-colors ${allOn ? 'bg-amber-100 hover:bg-amber-200' : 'bg-slate-100 hover:bg-slate-200'}`}
                          >
                            {allOn ? <Check size={12} className="text-amber-600" /> : <X size={12} className="text-slate-400" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={!name.trim()} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            <Save size={15} />Créer le rôle
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [roles, setRoles] = useState<RoleDefinition[]>(INITIAL_ROLES);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Tous');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('admin');
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [draftPermissions, setDraftPermissions] = useState<Permission[]>([]);
  const [modalUser, setModalUser] = useState<User | null | undefined>(undefined);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [deleteRoleConfirm, setDeleteRoleConfirm] = useState<string | null>(null);
  const [logSearch, setLogSearch] = useState('');

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'Tous' || roles.find(r => r.id === u.roleId)?.name === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredLogs = MOCK_LOGS.filter(l =>
    l.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.module.toLowerCase().includes(logSearch.toLowerCase())
  );

  const handleSaveUser = (u: User) => {
    setUsers(prev => prev.find(x => x.id === u.id) ? prev.map(x => x.id === u.id ? u : x) : [...prev, u]);
    setModalUser(undefined);
  };

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Actif' ? 'Inactif' : 'Actif' } : u));
  };

  const handleCreateRole = (role: RoleDefinition) => {
    setRoles(prev => [...prev, role]);
  };

  const handleDeleteRole = (roleId: string) => {
    const usersWithRole = users.filter(u => u.roleId === roleId).length;
    if (usersWithRole > 0) {
      alert(`Impossible de supprimer ce rôle : ${usersWithRole} utilisateur(s) l'utilisent.`);
      return;
    }
    setRoles(prev => prev.filter(r => r.id !== roleId));
    if (selectedRoleId === roleId) setSelectedRoleId('admin');
    setDeleteRoleConfirm(null);
  };

  const startEditPermissions = () => {
    const role = roles.find(r => r.id === selectedRoleId);
    if (role) {
      setDraftPermissions(role.permissions.map(p => ({ ...p })));
      setEditingPermissions(true);
    }
  };

  const toggleDraftPerm = (moduleIdx: number, key: keyof Omit<Permission, 'module'>) => {
    setDraftPermissions(prev => prev.map((p, i) => i === moduleIdx ? { ...p, [key]: !p[key] } : p));
  };

  const savePermissions = () => {
    setRoles(prev => prev.map(r => r.id === selectedRoleId ? { ...r, permissions: draftPermissions } : r));
    setEditingPermissions(false);
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const displayPermissions = editingPermissions ? draftPermissions : (selectedRole?.permissions || []);

  const stats = {
    total: users.length,
    actif: users.filter(u => u.status === 'Actif').length,
    admin: users.filter(u => u.roleId === 'admin').length,
    caissier: users.filter(u => u.roleId === 'caissier').length,
  };

  return (
    <AppLayout>
      <Topbar title="Utilisateurs" subtitle="Gestion des accès, rôles et permissions" />
      <div className="px-4 lg:px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total utilisateurs', value: stats.total, color: 'text-slate-700' },
            { label: 'Actifs', value: stats.actif, color: 'text-green-700' },
            { label: 'Admins', value: stats.admin, color: 'text-purple-700' },
            { label: 'Caissiers', value: stats.caissier, color: 'text-amber-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {([
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'roles', label: 'Rôles & Permissions', icon: Shield },
              { id: 'logs', label: "Journal d'activité", icon: Activity },
            ] as { id: Tab; label: string; icon: React.ElementType }[]).map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-amber-500 text-amber-600 bg-amber-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un utilisateur..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div className="flex gap-2">
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="Tous">Tous les rôles</option>
                    {roles.map(r => <option key={r.id}>{r.name}</option>)}
                  </select>
                  <button onClick={() => setModalUser(null)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors">
                    <Plus size={15} /><span className="hidden sm:inline">Ajouter</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Magasin</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Dernière connexion</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(u => {
                      const role = roles.find(r => r.id === u.roleId);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                                <span className="text-white font-bold text-xs">{u.avatar}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">{u.name}</p>
                                <p className="text-xs text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${role?.color || 'bg-slate-100 text-slate-600'}`}>{role?.name || u.roleId}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{u.shop}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">
                            <div className="flex items-center gap-1"><Clock size={12} />{u.lastLogin}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${u.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Actif' ? 'bg-green-500' : 'bg-slate-400'}`} />
                              {u.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setModalUser(u)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors" title="Modifier"><Edit2 size={14} /></button>
                              <button onClick={() => toggleStatus(u.id)} className={`p-1.5 rounded-lg transition-colors ${u.status === 'Actif' ? 'hover:bg-red-50 text-slate-500 hover:text-red-600' : 'hover:bg-green-50 text-slate-500 hover:text-green-600'}`} title={u.status === 'Actif' ? 'Désactiver' : 'Activer'}>
                                {u.status === 'Actif' ? <UserX size={14} /> : <UserCheck size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Aucun utilisateur trouvé</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Roles & Permissions Tab */}
          {activeTab === 'roles' && (
            <div className="p-4 space-y-5">
              {/* Role list */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Rôles ({roles.length})</h3>
                <button
                  onClick={() => setShowCreateRole(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <Plus size={15} />Créer un rôle
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {roles.map(r => (
                  <div key={r.id} className="flex items-center gap-1">
                    <button
                      onClick={() => { setSelectedRoleId(r.id); setEditingPermissions(false); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedRoleId === r.id ? r.color + ' shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {r.name}
                      {r.isSystem && <span className="text-xs opacity-60">(système)</span>}
                    </button>
                    {!r.isSystem && (
                      <button
                        onClick={() => setDeleteRoleConfirm(r.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        title="Supprimer ce rôle"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Permissions matrix */}
              {selectedRole && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Permissions — {selectedRole.name}</h4>
                    <div className="flex gap-2">
                      {editingPermissions ? (
                        <>
                          <button onClick={() => setEditingPermissions(false)} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                            <X size={13} />Annuler
                          </button>
                          <button onClick={savePermissions} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors">
                            <Save size={13} />Sauvegarder
                          </button>
                        </>
                      ) : (
                        <button onClick={startEditPermissions} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                          <Edit2 size={13} />Modifier
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</th>
                          {['Voir', 'Créer', 'Modifier', 'Supprimer'].map(h => (
                            <th key={h} className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {displayPermissions.map((p, idx) => {
                          const Icon = MODULE_ICONS[p.module] ?? Shield;
                          return (
                            <tr key={p.module} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Icon size={15} className="text-slate-400" />
                                  <span className="font-medium text-slate-700">{p.module}</span>
                                </div>
                              </td>
                              {(['view', 'create', 'edit', 'delete'] as const).map((key, i) => (
                                <td key={i} className="px-4 py-3 text-center">
                                  {editingPermissions ? (
                                    <button
                                      onClick={() => toggleDraftPerm(idx, key)}
                                      className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-colors ${
                                        p[key] ? 'bg-green-100 hover:bg-green-200' : 'bg-slate-100 hover:bg-slate-200'
                                      }`}
                                    >
                                      {p[key]
                                        ? <Check size={13} className="text-green-600" />
                                        : <X size={13} className="text-slate-400" />
                                      }
                                    </button>
                                  ) : (
                                    p[key]
                                      ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100"><Check size={13} className="text-green-600" /></span>
                                      : <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100"><X size={13} className="text-slate-400" /></span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {editingPermissions && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ Mode édition actif — cliquez sur les cases pour modifier les permissions</p>
                  )}
                  {!editingPermissions && (
                    <p className="text-xs text-slate-400 mt-3">* Les permissions s'appliquent à tous les utilisateurs ayant ce rôle.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div>
              <div className="p-4 border-b border-slate-100">
                <div className="relative max-w-sm">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Rechercher dans les logs..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Module</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">IP</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Horodatage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                              <span className="text-white font-bold text-xs">{log.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                            </div>
                            <span className="font-medium text-slate-700">{log.userName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{log.action}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">{log.module}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs font-mono hidden lg:table-cell">{log.ip}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          <div className="flex items-center gap-1"><Clock size={11} />{log.timestamp}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {modalUser !== undefined && (
        <UserModal user={modalUser} roles={roles} onClose={() => setModalUser(undefined)} onSave={handleSaveUser} />
      )}

      {/* Create Role Modal */}
      {showCreateRole && (
        <CreateRoleModal onClose={() => setShowCreateRole(false)} onSave={handleCreateRole} />
      )}

      {/* Delete Role Confirm */}
      {deleteRoleConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-2">Supprimer ce rôle ?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Cette action est irréversible. Les utilisateurs avec ce rôle devront être réassignés.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteRoleConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={() => handleDeleteRole(deleteRoleConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
