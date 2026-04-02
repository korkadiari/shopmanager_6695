'use client';
import React, { useState } from 'react';
import { Search, Bell, RefreshCw, ChevronDown, AlertTriangle, TrendingUp, Package, X, ArrowRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';


interface TopbarProps {
  title: string;
  subtitle?: string;
}

interface Notification {
  id: string;
  type: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  message: string;
  time: string;
  detail: string;
  href: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.replace('/login');
    }
  };

  const notifications: Notification[] = [
    {
      id: 'notif-001', type: 'alert', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50',
      message: 'Stock faible : Tecno Spark 20 (2 restants)',
      time: 'Il y a 5 min',
      detail: 'Le produit Tecno Spark 20 a atteint un niveau critique de 2 unités, en dessous du seuil d\'alerte de 5 unités. Une commande de réapprovisionnement est recommandée.',
      href: '/inventory-management',
    },
    {
      id: 'notif-002', type: 'alert', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50',
      message: 'Stock faible : Samsung A15 (3 restants)',
      time: 'Il y a 12 min',
      detail: 'Le Samsung Galaxy A15 dispose de seulement 3 unités en stock. Le seuil minimum est de 5 unités. Contactez le fournisseur Diallo Électronique pour réapprovisionner.',
      href: '/inventory-management',
    },
    {
      id: 'notif-003', type: 'sale', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50',
      message: 'Vente confirmée — Facture #INV-2024-0847',
      time: 'Il y a 18 min',
      detail: 'Vente enregistrée avec succès. Facture #INV-2024-0847 pour Mamadou Bah — Montant: 2,800,000 GNF. Paiement reçu en espèces.',
      href: '/customers',
    },
    {
      id: 'notif-004', type: 'stock', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50',
      message: 'Réapprovisionnement reçu : 20 unités Infinix Hot 40',
      time: 'Il y a 1h',
      detail: 'Réception de 20 unités Infinix Hot 40i en provenance de TechDistrib GN. Stock mis à jour. Nouveau niveau: 24 unités.',
      href: '/inventory-management',
    },
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30 shadow-sm">
      {/* Title */}
      <div className="flex flex-col min-w-0 mr-auto">
        <h1 className="text-base font-bold text-slate-900 leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-64 group focus-within:border-amber-400 focus-within:bg-white transition-all">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Rechercher produit, client..."
          className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1 min-w-0"
        />
        <kbd className="hidden lg:flex items-center gap-1 text-xs text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </div>

      {/* Date */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
        <span className="font-medium text-slate-700">Mar 31, 2026</span>
        <ChevronDown size={14} />
      </div>

      {/* Refresh */}
      <button
        onClick={handleRefresh}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
        title="Actualiser"
      >
        <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotifications(!showNotifications); setSelectedNotif(null); }}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse-soft" />
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-xl shadow-card-lg z-50 animate-scale-in overflow-hidden">
            {selectedNotif ? (
              /* Detail View */
              <div>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                  <button
                    onClick={() => setSelectedNotif(null)}
                    className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500"
                  >
                    <ArrowRight size={13} className="rotate-180" />
                  </button>
                  <span className="font-semibold text-slate-900 text-sm flex-1">Détail de l'alerte</span>
                  <button onClick={() => setShowNotifications(false)} className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400">
                    <X size={13} />
                  </button>
                </div>
                <div className="p-4">
                  <div className={`w-10 h-10 rounded-xl ${selectedNotif.bg} flex items-center justify-center mb-3`}>
                    <selectedNotif.icon size={18} className={selectedNotif.color} />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm mb-2">{selectedNotif.message}</p>
                  <p className="text-xs text-slate-500 mb-3">{selectedNotif.time}</p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{selectedNotif.detail}</p>
                  <Link
                    href={selectedNotif.href}
                    onClick={() => setShowNotifications(false)}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Voir dans l'application
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              /* List View */
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">{notifications.length} nouvelles</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setSelectedNotif(n)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className={`w-8 h-8 rounded-lg ${n.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon size={14} className={n.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 leading-snug">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                        </div>
                        <ArrowRight size={13} className="text-slate-300 shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-3 border-t border-slate-100 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-sm text-amber-600 font-semibold hover:text-amber-700 transition-colors"
                  >
                    Voir toutes les notifications
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-slate-500 hover:text-red-600"
        title="Se déconnecter"
      >
        <LogOut size={16} />
      </button>
    </header>
  );
}