import React from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import DashboardMetrics from './components/DashboardMetrics';
import SalesChart from './components/SalesChart';
import PaymentMethodChart from './components/PaymentMethodChart';
import RecentSalesFeed from './components/RecentSalesFeed';
import StockAlertPanel from './components/StockAlertPanel';
import TopProductsTable from './components/TopProductsTable';

export default function DashboardPage() {
  return (
    <AppLayout>
      <Topbar
        title="Tableau de bord"
        subtitle="Boutique Conakry — Madina | Mardi 31 mars 2026"
      />
      <div className="px-4 lg:px-6 xl:px-8 2xl:px-10 py-6 max-w-screen-2xl mx-auto space-y-6">
        {/* KPI Metrics Grid */}
        <DashboardMetrics />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div className="lg:col-span-1">
            <PaymentMethodChart />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <TopProductsTable />
          </div>
          <div className="lg:col-span-1 space-y-5">
            <StockAlertPanel />
            <RecentSalesFeed />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}