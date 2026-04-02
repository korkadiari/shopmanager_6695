import React from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import InventoryStockCards from './components/InventoryStockCards';
import InventoryTable from './components/InventoryTable';
import ReorderAlertsPanel from './components/ReorderAlertsPanel';

export default function InventoryPage() {
  return (
    <AppLayout>
      <Topbar
        title="Gestion des stocks"
        subtitle="Inventaire complet — Boutique Conakry"
      />
      <div className="px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 py-4 sm:py-6 max-w-screen-2xl mx-auto space-y-4 sm:space-y-6">
        <ReorderAlertsPanel />
        <InventoryStockCards />
        <InventoryTable />
      </div>
    </AppLayout>
  );
}