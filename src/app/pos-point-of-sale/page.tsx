'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import POSLayout from './components/POSLayout';

export default function POSPage() {
  return (
    <AppLayout>
      <Topbar
        title="Point de Vente"
        subtitle="Caisse principale — Boutique Conakry"
      />
      <div className="h-[calc(100vh-56px)] flex flex-col">
        <POSLayout />
      </div>
    </AppLayout>
  );
}