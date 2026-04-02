'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, ShoppingCart, Package, Users, FileText, BarChart3, Settings, ChevronLeft, ChevronRight, Store, Bell, Truck, Brain, ShieldCheck, Globe, ClipboardList, CalendarDays, CreditCard } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  group: string;
}

const navItems: NavItem[] = [
  { id: 'nav-global-dashboard', label: 'Vue globale', icon: Globe, href: '/global-dashboard', group: 'principal' },
  { id: 'nav-dashboard', label: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard', group: 'principal' },
  { id: 'nav-pos', label: 'Point de Vente', icon: ShoppingCart, href: '/pos-point-of-sale', group: 'principal' },
  { id: 'nav-inventory', label: 'Inventaire', icon: Package, href: '/inventory-management', badge: 5, group: 'principal' },
  { id: 'nav-customers', label: 'Clients', icon: Users, href: '/customers', group: 'commercial' },
  { id: 'nav-invoices', label: 'Factures', icon: FileText, href: '/reports', badge: 3, group: 'commercial' },
  { id: 'nav-suppliers', label: 'Fournisseurs', icon: Truck, href: '/suppliers', group: 'commercial' },
  { id: 'nav-reports', label: 'Rapports', icon: BarChart3, href: '/reports', group: 'analytics' },
  { id: 'nav-ai', label: 'Tableau de bord IA', icon: Brain, href: '/ai-dashboard', group: 'analytics' },
  { id: 'nav-notifications', label: 'Notifications', icon: Bell, href: '/notifications', badge: 7, group: 'analytics' },
  { id: 'nav-team', label: 'Performance Équipe', icon: Users, href: '/team-performance', group: 'analytics' },
  { id: 'nav-shifts', label: 'Planning des shifts', icon: CalendarDays, href: '/shift-scheduling', group: 'config' },
  { id: 'nav-audit', label: 'Journal d\'audit', icon: ClipboardList, href: '/audit-logs', group: 'config' },
  { id: 'nav-users', label: 'Utilisateurs', icon: ShieldCheck, href: '/users', group: 'config' },
  { id: 'nav-shops', label: 'Magasins', icon: Store, href: '/magasins', group: 'config' },
  { id: 'nav-subscription', label: 'Abonnement', icon: CreditCard, href: '/subscription', group: 'config' },
  { id: 'nav-settings', label: 'Paramètres', icon: Settings, href: '/settings', group: 'config' },
];

const groups = [
  { id: 'principal', label: 'Principal' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'analytics', label: 'Analytique' },
  { id: 'config', label: 'Configuration' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={`
        relative flex flex-col bg-slate-900 border-r border-slate-800
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-16' : 'w-60'}
        h-screen sticky top-0
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-slate-800 ${collapsed ? 'justify-center px-2' : ''}`}>
        <AppLogo size={32} className="shrink-0" />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-white text-sm leading-tight truncate">ShopManager</span>
            <span className="text-xs text-amber-400 font-medium truncate">Guinée</span>
          </div>
        )}
      </div>

      {/* Shop selector */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-slate-800">
          <button
            onClick={() => router.push('/magasins')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group">
            <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center shrink-0">
              <Store size={12} className="text-white" />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">Boutique Conakry</span>
              <span className="text-xs text-slate-400 truncate">Madina, Conakry</span>
            </div>
            <ChevronRight size={14} className="text-slate-500 shrink-0" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group.id);
          return (
            <div key={`group-${group.id}`} className="mb-1">
              {!collapsed && (
                <p className="px-4 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {group.label}
                </p>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <div key={item.id} className="relative group/item px-2">
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5
                        transition-all duration-150
                        ${isActive
                          ? 'bg-amber-500/20 text-amber-400 font-semibold' :'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }
                        ${collapsed ? 'justify-center' : ''}
                      `}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="text-sm flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-2 w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                    {collapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={`border-t border-slate-800 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div
            onClick={() => router.push('/settings')}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">AM</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-white truncate">Amadou Diallo</span>
              <span className="text-xs text-slate-400 truncate">Gérant</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push('/settings')}
            className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">AM</span>
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-amber-500 hover:border-amber-500 transition-all duration-150 z-10 shadow-md"
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-slate-300" />
        ) : (
          <ChevronLeft size={12} className="text-slate-300" />
        )}
      </button>
    </aside>
  );
}