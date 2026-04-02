'use client';
import React from 'react';
import { X, Download, Printer, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { GeneratedInvoice } from './POSLayout';

interface Props {
  invoice: GeneratedInvoice;
  onClose: () => void;
}

export default function InvoiceModal({ invoice, onClose }: Props) {
  const handlePrint = () => {
    // Backend integration: POST /api/invoices/print { invoiceNumber }
    toast.success('Impression envoyée', { description: invoice.invoiceNumber });
  };

  const handleDownload = () => {
    // Backend integration: GET /api/invoices/{invoiceNumber}/pdf
    toast.success('Téléchargement du PDF démarré', { description: invoice.invoiceNumber });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-card-lg w-full max-w-md animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
        {/* Success header */}
        <div className="bg-green-50 border-b border-green-200 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <h2 className="font-bold text-green-800 text-base">Vente confirmée !</h2>
            <p className="text-xs text-green-600">{invoice.invoiceNumber} · {invoice.date}</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-lg hover:bg-green-100 flex items-center justify-center text-green-600">
            <X size={16} />
          </button>
        </div>

        {/* Invoice preview */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
          {/* Header info */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText size={16} className="text-amber-600" />
                <span className="font-bold text-slate-900 text-sm">FACTURE</span>
              </div>
              <p className="font-mono text-xs text-slate-500">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900 text-sm">ShopManager</p>
              <p className="text-xs text-slate-500">Boutique Conakry — Madina</p>
              <p className="text-xs text-slate-500">+224 628 00 11 22</p>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200 pt-3">
            <p className="text-xs text-slate-500 mb-1">Client</p>
            <p className="font-semibold text-slate-800">{invoice.customer}</p>
          </div>

          {/* Items */}
          <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Articles</p>
            {invoice.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.quantity} × {(item.price / 1000).toFixed(0)}K GNF</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                  {((item.price * item.quantity) / 1000).toFixed(0)}K
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Sous-total</span>
              <span className="tabular-nums font-medium">{(invoice.subtotal / 1000).toFixed(0)}K GNF</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Remise ({invoice.discount}%)</span>
                <span className="tabular-nums text-green-600 font-medium">- {((invoice.subtotal - invoice.total) / 1000).toFixed(0)}K GNF</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-slate-200">
              <span className="text-slate-900">Total</span>
              <span className="text-amber-600 tabular-nums">{(invoice.total / 1000000).toFixed(3)}M GNF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Montant payé</span>
              <span className="tabular-nums text-green-600 font-semibold">{(invoice.amountPaid / 1000).toFixed(0)}K GNF</span>
            </div>
            {invoice.balance > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-600 font-semibold">Solde dû</span>
                <span className="tabular-nums text-amber-600 font-bold">{(invoice.balance / 1000).toFixed(0)}K GNF</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-slate-200 pt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Mode de paiement</span>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">{invoice.paymentMethod}</span>
          </div>

          <p className="text-center text-xs text-slate-400 border-t border-dashed border-slate-200 pt-3">
            Merci pour votre achat · ShopManager Guinée
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={15} /> Imprimer
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-xl border border-amber-200 text-amber-700 bg-amber-50 font-semibold text-sm hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={15} /> PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Nouvelle vente
          </button>
        </div>
      </div>
    </div>
  );
}