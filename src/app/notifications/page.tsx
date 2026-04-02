'use client';
import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Bell, Mail, MessageSquare, Plus, Clock, CheckCircle2, XCircle, Edit2, Trash2, Search, Calendar, X, FileText, CreditCard, Tag, Eye, Users, Store, Send, Loader2, AlertCircle } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type Channel = 'Email' | 'SMS';
type TemplateType = 'Facture' | 'Rappel paiement' | 'Promotion';
type SendStatus = 'Envoyé' | 'Échoué' | 'En attente';
type Segment = 'VIP' | 'Régulier' | 'Nouveau' | 'Tous';
type Role = 'Admin' | 'Manager' | 'Caissier' | 'Tous';
type ShopFilter = 'Tous' | 'S001' | 'S002' | 'S003';

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: Segment;
  shop: string;
  shopId: ShopFilter;
  role?: Role;
  type: 'client' | 'user';
}

interface Template {
  id: string;
  name: string;
  type: TemplateType;
  channel: Channel;
  subject?: string;
  body: string;
  variables: string[];
}

interface ScheduledNotif {
  id: string;
  templateId: string;
  templateName: string;
  channel: Channel;
  recipients: number;
  recipientList: Recipient[];
  scheduledAt: string;
  status: 'Planifié' | 'Envoyé';
  sendResult?: { sent: number; failed: number };
}

interface SentLog {
  id: string;
  templateName: string;
  channel: Channel;
  recipient: string;
  sentAt: string;
  status: SendStatus;
  type: TemplateType;
}

const TYPE_COLORS: Record<TemplateType, string> = {
  'Facture': 'bg-blue-100 text-blue-700',
  'Rappel paiement': 'bg-orange-100 text-orange-700',
  'Promotion': 'bg-green-100 text-green-700',
};

const TYPE_ICONS: Record<TemplateType, React.ElementType> = {
  'Facture': FileText,
  'Rappel paiement': CreditCard,
  'Promotion': Tag,
};

const CHANNEL_COLORS: Record<Channel, string> = {
  Email: 'bg-purple-100 text-purple-700',
  SMS: 'bg-teal-100 text-teal-700',
};

const ALL_RECIPIENTS: Recipient[] = [
  { id: 'r1', name: 'Ibrahima Koné', email: 'ibrahima@example.com', phone: '+224620000001', segment: 'VIP', shop: 'Boutique Conakry', shopId: 'S001', type: 'client' },
  { id: 'r2', name: 'Mariama Diallo', email: 'mariama@example.com', phone: '+224620000002', segment: 'Régulier', shop: 'Boutique Conakry', shopId: 'S001', type: 'client' },
  { id: 'r3', name: 'Oumar Bah', email: 'oumar@example.com', phone: '+224620000003', segment: 'Nouveau', shop: 'Boutique Kindia', shopId: 'S002', type: 'client' },
  { id: 'r4', name: 'Kadiatou Sow', email: 'kadiatou@example.com', phone: '+224620000004', segment: 'VIP', shop: 'Boutique Kindia', shopId: 'S002', type: 'client' },
  { id: 'r5', name: 'Sékou Camara', email: 'sekou@example.com', phone: '+224620000005', segment: 'Régulier', shop: 'Boutique Labé', shopId: 'S003', type: 'client' },
  { id: 'r6', name: 'Aminata Touré', email: 'aminata@example.com', phone: '+224620000006', segment: 'VIP', shop: 'Boutique Labé', shopId: 'S003', type: 'client' },
  { id: 'r7', name: 'Mamadou Barry', email: 'mamadou@example.com', phone: '+224620000007', segment: 'Nouveau', shop: 'Boutique Conakry', shopId: 'S001', type: 'client' },
  { id: 'r8', name: 'Fatoumata Balde', email: 'fatoumata@example.com', phone: '+224620000008', segment: 'Régulier', shop: 'Boutique Kindia', shopId: 'S002', type: 'client' },
  { id: 'r9', name: 'Amadou Diallo', email: 'amadou.admin@shop.com', phone: '+224620000009', segment: 'Tous', shop: 'Boutique Conakry', shopId: 'S001', role: 'Admin', type: 'user' },
  { id: 'r10', name: 'Aissatou Sow', email: 'aissatou.mgr@shop.com', phone: '+224620000010', segment: 'Tous', shop: 'Boutique Kindia', shopId: 'S002', role: 'Manager', type: 'user' },
  { id: 'r11', name: 'Boubacar Kouyaté', email: 'boubacar.mgr@shop.com', phone: '+224620000011', segment: 'Tous', shop: 'Boutique Labé', shopId: 'S003', role: 'Manager', type: 'user' },
  { id: 'r12', name: 'Hawa Camara', email: 'hawa.caissier@shop.com', phone: '+224620000012', segment: 'Tous', shop: 'Boutique Conakry', shopId: 'S001', role: 'Caissier', type: 'user' },
];

const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1', name: 'Facture de vente', type: 'Facture', channel: 'Email',
    subject: 'Votre facture {{invoice_number}} - ShopManager',
    body: 'Bonjour {{client_name}},\n\nVeuillez trouver ci-joint votre facture {{invoice_number}} d\'un montant de {{amount}} GNF.\n\nMerci pour votre confiance.\n\nShopManager Guinée',
    variables: ['client_name', 'invoice_number', 'amount'],
  },
  {
    id: 't2', name: 'Rappel de paiement', type: 'Rappel paiement', channel: 'SMS',
    body: 'Bonjour {{client_name}}, votre solde dû est de {{amount}} GNF. Merci de régulariser avant le {{due_date}}. ShopManager',
    variables: ['client_name', 'amount', 'due_date'],
  },
  {
    id: 't3', name: 'Promotion spéciale', type: 'Promotion', channel: 'Email',
    subject: '🎉 Offre spéciale pour vous, {{client_name}} !',
    body: 'Bonjour {{client_name}},\n\nProfitez de {{discount}}% de réduction sur tous nos produits jusqu\'au {{end_date}}.\n\nCode promo: {{promo_code}}\n\nShopManager Guinée',
    variables: ['client_name', 'discount', 'end_date', 'promo_code'],
  },
  {
    id: 't4', name: 'Confirmation de paiement', type: 'Facture', channel: 'SMS',
    body: 'Paiement reçu: {{amount}} GNF pour facture {{invoice_number}}. Merci {{client_name}}! ShopManager',
    variables: ['client_name', 'amount', 'invoice_number'],
  },
  {
    id: 't5', name: 'Rappel dette client', type: 'Rappel paiement', channel: 'Email',
    subject: 'Rappel: Solde impayé - {{amount}} GNF',
    body: 'Bonjour {{client_name}},\n\nNous vous rappelons que vous avez un solde impayé de {{amount}} GNF depuis le {{due_date}}.\n\nMerci de nous contacter pour régulariser votre situation.\n\nShopManager Guinée',
    variables: ['client_name', 'amount', 'due_date'],
  },
];

const MOCK_SCHEDULED: ScheduledNotif[] = [
  { id: 's1', templateId: 't2', templateName: 'Rappel de paiement', channel: 'SMS', recipients: 12, recipientList: [], scheduledAt: '2026-04-02 09:00', status: 'Planifié' },
  { id: 's2', templateId: 't3', templateName: 'Promotion spéciale', channel: 'Email', recipients: 145, recipientList: [], scheduledAt: '2026-04-05 10:00', status: 'Planifié' },
  { id: 's3', templateId: 't1', templateName: 'Facture de vente', channel: 'Email', recipients: 8, recipientList: [], scheduledAt: '2026-03-31 18:00', status: 'Envoyé', sendResult: { sent: 7, failed: 1 } },
];

const MOCK_LOGS: SentLog[] = [
  { id: 'l1', templateName: 'Facture de vente', channel: 'Email', recipient: 'Ibrahima Koné', sentAt: '2026-04-01 10:15', status: 'Envoyé', type: 'Facture' },
  { id: 'l2', templateName: 'Rappel de paiement', channel: 'SMS', recipient: 'Mariama Diallo', sentAt: '2026-04-01 09:30', status: 'Envoyé', type: 'Rappel paiement' },
  { id: 'l3', templateName: 'Promotion spéciale', channel: 'Email', recipient: 'Oumar Bah', sentAt: '2026-04-01 08:00', status: 'Échoué', type: 'Promotion' },
  { id: 'l4', templateName: 'Confirmation de paiement', channel: 'SMS', recipient: 'Kadiatou Sow', sentAt: '2026-03-31 17:45', status: 'Envoyé', type: 'Facture' },
  { id: 'l5', templateName: 'Rappel dette client', channel: 'Email', recipient: 'Sékou Camara', sentAt: '2026-03-31 16:00', status: 'Envoyé', type: 'Rappel paiement' },
  { id: 'l6', templateName: 'Promotion spéciale', channel: 'Email', recipient: 'Aminata Touré', sentAt: '2026-03-30 11:00', status: 'Envoyé', type: 'Promotion' },
  { id: 'l7', templateName: 'Facture de vente', channel: 'Email', recipient: 'Mamadou Barry', sentAt: '2026-03-30 09:15', status: 'Échoué', type: 'Facture' },
];

type Tab = 'templates' | 'schedule' | 'logs';

// ─── Template Modal ───────────────────────────────────────────────────────────
interface TemplateModalProps {
  template: Template | null;
  onClose: () => void;
  onSave: (t: Template) => void;
}

function TemplateModal({ template, onClose, onSave }: TemplateModalProps) {
  const [form, setForm] = useState<Template>(
    template ?? { id: `t${Date.now()}`, name: '', type: 'Facture', channel: 'Email', subject: '', body: '', variables: [] }
  );
  const [preview, setPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vars = [...(form.body.match(/\{\{(\w+)\}\}/g) || []), ...(form.subject?.match(/\{\{(\w+)\}\}/g) || [])]
      .map(v => v.replace(/\{\{|\}\}/g, ''))
      .filter((v, i, a) => a.indexOf(v) === i);
    onSave({ ...form, variables: vars });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-slate-800 text-lg">{template ? 'Modifier le modèle' : 'Nouveau modèle'}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setPreview(!preview)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${preview ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <Eye size={13} />{preview ? 'Éditer' : 'Aperçu'}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={18} className="text-slate-500" /></button>
          </div>
        </div>
        {preview ? (
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Aperçu du modèle</p>
              {form.channel === 'Email' && form.subject && (
                <div className="mb-3 pb-3 border-b border-slate-200">
                  <p className="text-xs text-slate-400 mb-1">Objet:</p>
                  <p className="font-semibold text-slate-800">{form.subject}</p>
                </div>
              )}
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{form.body}</pre>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du modèle</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Ex: Facture de vente" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Canal</label>
                <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value as Channel }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option>Email</option>
                  <option>SMS</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as TemplateType }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option>Facture</option>
                <option>Rappel paiement</option>
                <option>Promotion</option>
              </select>
            </div>
            {form.channel === 'Email' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Objet de l'email</label>
                <input value={form.subject ?? ''} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Ex: Votre facture {{invoice_number}}" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Corps du message</label>
              <textarea required rows={6} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" placeholder="Utilisez {{variable}} pour les champs dynamiques..." />
              <p className="text-xs text-slate-400 mt-1">Utilisez <code className="bg-slate-100 px-1 rounded">{'{{variable}}'}</code> pour les champs dynamiques</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors">Enregistrer</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Schedule Modal with Recipient Filtering ──────────────────────────────────
interface ScheduleModalProps {
  templates: Template[];
  onClose: () => void;
  onSave: (s: ScheduledNotif) => void;
}

function ScheduleModal({ templates, onClose, onSave }: ScheduleModalProps) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<Segment | 'Tous'>('Tous');
  const [shopFilter, setShopFilter] = useState<ShopFilter>('Tous');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Compute min datetime (now) for the date input
  const minDateTime = new Date();
  minDateTime.setSeconds(0, 0);
  const minDateTimeStr = minDateTime.toISOString().slice(0, 16);

  const selectedTemplate = templates.find(t => t.id === templateId);

  const filteredRecipients = ALL_RECIPIENTS.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      r.email.toLowerCase().includes(recipientSearch.toLowerCase());
    const matchSegment = segmentFilter === 'Tous' || r.segment === segmentFilter;
    const matchShop = shopFilter === 'Tous' || r.shopId === shopFilter;
    return matchSearch && matchSegment && matchShop;
  });

  const toggleRecipient = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredRecipients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecipients.map(r => r.id)));
    }
  };

  const selectedRecipients = ALL_RECIPIENTS.filter(r => selectedIds.has(r.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || selectedRecipients.length === 0) return;

    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    const isFuture = scheduledDate > now;

    if (isFuture) {
      // Schedule for future — save as Planifié
      onSave({
        id: `s${Date.now()}`,
        templateId,
        templateName: selectedTemplate.name,
        channel: selectedTemplate.channel,
        recipients: selectedRecipients.length,
        recipientList: selectedRecipients,
        scheduledAt,
        status: 'Planifié',
      });
      return;
    }

    // Send immediately via edge function
    setSending(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          channel: selectedTemplate.channel,
          recipients: selectedRecipients,
          subject: selectedTemplate.subject,
          body: selectedTemplate.body,
          templateName: selectedTemplate.name,
        }),
      });

      const data = await res.json();
      setSendResult({ sent: data.sent ?? 0, failed: data.failed ?? 0 });
      setToast({ type: 'success', message: `${data.sent ?? 0} message(s) envoyé(s) avec succès` });

      onSave({
        id: `s${Date.now()}`,
        templateId,
        templateName: selectedTemplate.name,
        channel: selectedTemplate.channel,
        recipients: selectedRecipients.length,
        recipientList: selectedRecipients,
        scheduledAt,
        status: 'Envoyé',
        sendResult: { sent: data.sent ?? 0, failed: data.failed ?? 0 },
      });
    } catch {
      setToast({ type: 'error', message: 'Erreur lors de l\'envoi. Vérifiez la configuration.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Calendar size={18} className="text-amber-500" />
            Planifier un envoi
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={18} className="text-slate-500" /></button>
        </div>

        {toast && (
          <div className={`mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </div>
        )}

        {sendResult ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h4 className="font-bold text-slate-800 text-lg">Envoi terminé</h4>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{sendResult.sent}</p>
                <p className="text-xs text-slate-500">Envoyés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{sendResult.failed}</p>
                <p className="text-xs text-slate-500">Échoués</p>
              </div>
            </div>
            <button onClick={onClose} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors">Fermer</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Template & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
                <select value={templateId} onChange={e => setTemplateId(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date et heure d'envoi</label>
                <input required type="datetime-local" value={scheduledAt} min={minDateTimeStr} onChange={e => setScheduledAt(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>

            {/* Recipient Filters */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Users size={15} className="text-amber-500" />
                Filtrer les destinataires
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Tag size={11} />Segment</label>
                  <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value as Segment | 'Tous')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="Tous">Tous segments</option>
                    <option value="VIP">VIP</option>
                    <option value="Régulier">Régulier</option>
                    <option value="Nouveau">Nouveau</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Store size={11} />Magasin</label>
                  <select value={shopFilter} onChange={e => setShopFilter(e.target.value as ShopFilter)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="Tous">Tous les magasins</option>
                    <option value="S001">Boutique Conakry</option>
                    <option value="S002">Boutique Kindia</option>
                    <option value="S003">Boutique Labé</option>
                  </select>
                </div>
              </div>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={recipientSearch}
                  onChange={e => setRecipientSearch(e.target.value)}
                  placeholder="Rechercher un destinataire..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Recipient List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={filteredRecipients.length > 0 && selectedIds.size === filteredRecipients.length}
                      onChange={toggleAll}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                    />
                    Tout sélectionner ({filteredRecipients.length})
                  </label>
                  <span className="text-xs font-semibold text-amber-600">{selectedIds.size} sélectionné(s)</span>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                  {filteredRecipients.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-400">Aucun destinataire trouvé</div>
                  ) : (
                    filteredRecipients.map(r => (
                      <label key={r.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors ${selectedIds.has(r.id) ? 'bg-amber-50/50' : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleRecipient(r.id)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 shrink-0"
                        />
                        <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{r.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{r.name}</p>
                          <p className="text-xs text-slate-400 truncate">{selectedTemplate?.channel === 'SMS' ? r.phone : r.email}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {r.segment !== 'Tous' && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${r.segment === 'VIP' ? 'bg-amber-100 text-amber-700' : r.segment === 'Régulier' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                              {r.segment}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 hidden sm:block">{r.shop.replace('Boutique ', '')}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {selectedRecipients.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
                <Send size={13} />
                {selectedRecipients.length} destinataire(s) sélectionné(s) — envoi via {selectedTemplate?.channel === 'Email' ? 'Resend' : 'Twilio SMS'}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
              <button
                type="submit"
                disabled={selectedRecipients.length === 0 || !scheduledAt || sending}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                {sending ? 'Envoi en cours...' : scheduledAt && new Date(scheduledAt) > new Date() ? 'Planifier' : 'Envoyer maintenant'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('templates');
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [scheduled, setScheduled] = useState<ScheduledNotif[]>(MOCK_SCHEDULED);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TemplateType | 'Tous'>('Tous');
  const [channelFilter, setChannelFilter] = useState<Channel | 'Tous'>('Tous');
  const [modalTemplate, setModalTemplate] = useState<Template | null | undefined>(undefined);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [logSearch, setLogSearch] = useState('');

  const filteredTemplates = templates.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'Tous' || t.type === typeFilter;
    const matchChannel = channelFilter === 'Tous' || t.channel === channelFilter;
    return matchSearch && matchType && matchChannel;
  });

  const filteredLogs = MOCK_LOGS.filter(l =>
    l.templateName.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.recipient.toLowerCase().includes(logSearch.toLowerCase())
  );

  const stats = {
    total: templates.length,
    email: templates.filter(t => t.channel === 'Email').length,
    sms: templates.filter(t => t.channel === 'SMS').length,
    sent: MOCK_LOGS.filter(l => l.status === 'Envoyé').length,
  };

  const STATUS_ICON: Record<SendStatus, React.ReactNode> = {
    'Envoyé': <CheckCircle2 size={14} className="text-green-500" />,
    'Échoué': <XCircle size={14} className="text-red-500" />,
    'En attente': <Clock size={14} className="text-amber-500" />,
  };

  return (
    <AppLayout>
      <Topbar title="Notifications" subtitle="Modèles SMS/Email, planification et historique" />
      <div className="px-4 lg:px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total modèles', value: stats.total, icon: Bell, color: 'text-slate-700' },
            { label: 'Modèles Email', value: stats.email, icon: Mail, color: 'text-purple-600' },
            { label: 'Modèles SMS', value: stats.sms, icon: MessageSquare, color: 'text-teal-600' },
            { label: 'Envois réussis', value: stats.sent, icon: CheckCircle2, color: 'text-green-600' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon size={18} className={s.color} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {([
              { id: 'templates', label: 'Modèles', icon: FileText },
              { id: 'schedule', label: 'Planification', icon: Calendar },
              { id: 'logs', label: 'Historique', icon: Clock },
            ] as { id: Tab; label: string; icon: React.ElementType }[]).map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-amber-500 text-amber-600 bg-amber-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                  <Icon size={15} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un modèle..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div className="flex gap-2">
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as TemplateType | 'Tous')} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="Tous">Tous types</option>
                    <option>Facture</option>
                    <option>Rappel paiement</option>
                    <option>Promotion</option>
                  </select>
                  <select value={channelFilter} onChange={e => setChannelFilter(e.target.value as Channel | 'Tous')} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="Tous">Tous canaux</option>
                    <option>Email</option>
                    <option>SMS</option>
                  </select>
                  <button onClick={() => setModalTemplate(null)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors">
                    <Plus size={15} />
                    <span className="hidden sm:inline">Nouveau</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                {filteredTemplates.map(t => {
                  const TypeIcon = TYPE_ICONS[t.type];
                  const ChannelIcon = t.channel === 'Email' ? Mail : MessageSquare;
                  return (
                    <div key={t.id} className="border border-slate-100 rounded-xl p-4 hover:border-amber-200 hover:shadow-sm transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                            <TypeIcon size={16} className="text-slate-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[t.type]}`}>{t.type}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CHANNEL_COLORS[t.channel]}`}>
                                <ChannelIcon size={10} />{t.channel}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModalTemplate(t)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"><Edit2 size={13} /></button>
                          <button onClick={() => setTemplates(prev => prev.filter(x => x.id !== t.id))} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      {t.channel === 'Email' && t.subject && (
                        <p className="text-xs text-slate-500 mb-2 truncate"><span className="font-medium">Objet:</span> {t.subject}</p>
                      )}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{t.body}</p>
                      {t.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {t.variables.slice(0, 3).map(v => (
                            <span key={v} className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-xs font-mono">{`{{${v}}}`}</span>
                          ))}
                          {t.variables.length > 3 && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">+{t.variables.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredTemplates.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    <Bell size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Aucun modèle trouvé</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div>
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <p className="text-sm text-slate-500">{scheduled.filter(s => s.status === 'Planifié').length} envoi(s) planifié(s)</p>
                <button onClick={() => setShowScheduleModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors">
                  <Plus size={15} />Planifier un envoi
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modèle</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Canal</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Destinataires</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date planifiée</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {scheduled.map(s => {
                      const ChannelIcon = s.channel === 'Email' ? Mail : MessageSquare;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">{s.templateName}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${CHANNEL_COLORS[s.channel]}`}>
                              <ChannelIcon size={11} />{s.channel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                            <div>
                              <span>{s.recipients} destinataires</span>
                              {s.sendResult && (
                                <span className="ml-2 text-xs text-green-600 font-medium">({s.sendResult.sent} envoyés)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            <div className="flex items-center gap-1"><Calendar size={12} />{s.scheduledAt}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.status === 'Planifié' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                              {s.status === 'Planifié' ? <Clock size={11} /> : <CheckCircle2 size={11} />}
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div>
              <div className="p-4 border-b border-slate-100">
                <div className="relative max-w-sm">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Rechercher dans l'historique..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modèle</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Canal</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Destinataire</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date d'envoi</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLogs.map(log => {
                      const ChannelIcon = log.channel === 'Email' ? Mail : MessageSquare;
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-slate-800">{log.templateName}</p>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[log.type]}`}>{log.type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${CHANNEL_COLORS[log.channel]}`}>
                              <ChannelIcon size={11} />{log.channel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{log.recipient}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">
                            <div className="flex items-center gap-1"><Clock size={11} />{log.sentAt}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {STATUS_ICON[log.status]}
                              <span className={`text-xs font-medium ${log.status === 'Envoyé' ? 'text-green-600' : log.status === 'Échoué' ? 'text-red-600' : 'text-amber-600'}`}>{log.status}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalTemplate !== undefined && (
        <TemplateModal
          template={modalTemplate}
          onClose={() => setModalTemplate(undefined)}
          onSave={t => { setTemplates(prev => prev.find(x => x.id === t.id) ? prev.map(x => x.id === t.id ? t : x) : [...prev, t]); setModalTemplate(undefined); }}
        />
      )}
      {showScheduleModal && (
        <ScheduleModal
          templates={templates}
          onClose={() => setShowScheduleModal(false)}
          onSave={s => { setScheduled(prev => [...prev, s]); setShowScheduleModal(false); }}
        />
      )}
    </AppLayout>
  );
}
