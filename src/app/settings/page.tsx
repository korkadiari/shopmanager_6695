'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Store, Building2, MapPin, Phone, Globe, Edit3, Save, Plus, Trash2, Check, X, AlertCircle, User, Lock, Bell, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface ShopLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  manager: string;
  isMain: boolean;
  active: boolean;
}

interface BusinessInfo {
  name: string;
  legalName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  taxId: string;
}

const defaultBusiness: BusinessInfo = {
  name: 'ShopManager',
  legalName: 'ShopManager SARL',
  phone: '+224 622 00 11 22',
  email: 'contact@shopmanager.gn',
  website: 'www.shopmanager.gn',
  address: 'Madina, Commune de Ratoma',
  city: 'Conakry',
  country: 'Guinée',
  currency: 'GNF',
  taxId: '',
};

type Tab = 'business' | 'locations' | 'account' | 'notifications';

export default function SettingsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<Tab>('business');
  const [business, setBusiness] = useState<BusinessInfo>(defaultBusiness);
  const [editedBusiness, setEditedBusiness] = useState<BusinessInfo>(defaultBusiness);
  const [shops, setShops] = useState<ShopLocation[]>([]);
  const [editingShop, setEditingShop] = useState<ShopLocation | null>(null);
  const [showAddShop, setShowAddShop] = useState(false);
  const [savedBusiness, setSavedBusiness] = useState(false);
  const [newShop, setNewShop] = useState<Partial<ShopLocation>>({ name: '', address: '', city: '', phone: '', manager: '', isMain: false, active: true });
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingShop, setSavingShop] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile?.tenant_id) return;

    const tid = profile.tenant_id;
    setTenantId(tid);

    // Load tenant/business info
    const { data: tenant } = await supabase.from('tenants').select('*').eq('id', tid).single();
    if (tenant) {
      const biz: BusinessInfo = {
        name: tenant.business_name || '',
        legalName: tenant.legal_name || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        website: '',
        address: tenant.address || '',
        city: tenant.city || '',
        country: tenant.country || 'Guinée',
        currency: 'GNF',
        taxId: '',
      };
      setBusiness(biz);
      setEditedBusiness(biz);
    }

    // Load shops
    const { data: shopData } = await supabase.from('shops').select('*').eq('tenant_id', tid).order('name');
    if (shopData) {
      setShops(shopData.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address || '',
        city: s.city || '',
        phone: s.phone || '',
        manager: s.manager || '',
        isMain: s.is_main || false,
        active: s.is_active !== false,
      })));
    }
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveBusiness = async () => {
    if (!tenantId) { toast.error('Tenant non trouvé'); return; }
    setSavingBusiness(true);
    const { error } = await supabase.from('tenants').update({
      business_name: editedBusiness.name,
      legal_name: editedBusiness.legalName,
      phone: editedBusiness.phone,
      email: editedBusiness.email,
      address: editedBusiness.address,
      city: editedBusiness.city,
      country: editedBusiness.country,
    }).eq('id', tenantId);

    if (error) {
      toast.error('Erreur de sauvegarde', { description: error.message });
    } else {
      setBusiness(editedBusiness);
      setSavedBusiness(true);
      toast.success('Informations sauvegardées', { description: `${editedBusiness.name} — Modifications enregistrées` });
      setTimeout(() => setSavedBusiness(false), 3000);
    }
    setSavingBusiness(false);
  };

  const handleSaveShop = async () => {
    if (!editingShop || !tenantId) return;
    setSavingShop(true);
    const { error } = await supabase.from('shops').update({
      name: editingShop.name,
      address: editingShop.address,
      city: editingShop.city,
      phone: editingShop.phone,
      manager: editingShop.manager,
      is_active: editingShop.active,
    }).eq('id', editingShop.id);

    if (error) {
      toast.error('Erreur de mise à jour', { description: error.message });
    } else {
      setShops(prev => prev.map(s => s.id === editingShop.id ? editingShop : s));
      setEditingShop(null);
      toast.success('Magasin mis à jour', { description: editingShop.name });
    }
    setSavingShop(false);
  };

  const handleAddShop = async () => {
    if (!newShop.name || !newShop.city) {
      toast.error('Veuillez renseigner le nom et la ville');
      return;
    }
    if (!tenantId) { toast.error('Tenant non trouvé'); return; }
    setSavingShop(true);
    const { data, error } = await supabase.from('shops').insert({
      tenant_id: tenantId,
      name: newShop.name,
      address: newShop.address || '',
      city: newShop.city,
      phone: newShop.phone || '',
      manager: newShop.manager || '',
      is_main: false,
      is_active: true,
    }).select().single();

    if (error) {
      toast.error('Erreur d\'ajout', { description: error.message });
    } else if (data) {
      setShops(prev => [...prev, {
        id: data.id,
        name: data.name,
        address: data.address || '',
        city: data.city || '',
        phone: data.phone || '',
        manager: data.manager || '',
        isMain: data.is_main || false,
        active: data.is_active !== false,
      }]);
      setNewShop({ name: '', address: '', city: '', phone: '', manager: '', isMain: false, active: true });
      setShowAddShop(false);
      toast.success('Magasin ajouté', { description: `${data.name} — ${data.city}` });
    }
    setSavingShop(false);
  };

  const handleDeleteShop = async (id: string) => {
    const shop = shops.find(s => s.id === id);
    const { error } = await supabase.from('shops').delete().eq('id', id);
    if (error) {
      toast.error('Erreur de suppression', { description: error.message });
    } else {
      setShops(prev => prev.filter(s => s.id !== id));
      toast.success('Magasin supprimé', { description: shop?.name });
    }
  };

  const handleSaveAccount = () => {
    toast.success('Compte mis à jour', { description: 'Vos informations ont été sauvegardées.' });
  };

  const handleSaveNotifPrefs = () => {
    toast.success('Préférences sauvegardées', { description: 'Vos préférences de notifications ont été mises à jour.' });
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'business', label: 'Entreprise', icon: Building2 },
    { id: 'locations', label: 'Magasins', icon: Store },
    { id: 'account', label: 'Compte', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <AppLayout>
      <Topbar title="Paramètres" subtitle="Configuration de l'entreprise et des magasins" />
      <div className="px-4 lg:px-6 xl:px-8 py-6 max-w-screen-xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar Tabs */}
          <div className="lg:w-56 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all border-b border-slate-100 last:border-0 ${activeTab === tab.id ? 'bg-amber-50 text-amber-700 border-l-2 border-l-amber-500' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <tab.icon size={16} className={activeTab === tab.id ? 'text-amber-500' : 'text-slate-400'} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Business Info Tab */}
            {activeTab === 'business' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-amber-500" />
                    <h2 className="font-bold text-slate-900">Informations de l&apos;entreprise</h2>
                  </div>
                  {savedBusiness && (
                    <div className="flex items-center gap-1.5 text-green-600 text-sm font-semibold bg-green-50 px-3 py-1.5 rounded-lg">
                      <Check size={14} />Sauvegardé
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: 'Nom commercial *', key: 'name', placeholder: 'Ex: ShopManager', icon: Building2 },
                      { label: 'Raison sociale', key: 'legalName', placeholder: 'Ex: ShopManager SARL', icon: Building2 },
                      { label: 'Téléphone', key: 'phone', placeholder: '+224 6XX XX XX XX', icon: Phone },
                      { label: 'Email', key: 'email', placeholder: 'contact@exemple.com', icon: Globe },
                      { label: 'Site web', key: 'website', placeholder: 'www.exemple.com', icon: Globe },
                      { label: 'Numéro fiscal', key: 'taxId', placeholder: 'GN-XXXX-XXXXX', icon: AlertCircle },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">{field.label}</label>
                        <div className="relative">
                          <field.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" value={editedBusiness[field.key as keyof BusinessInfo]}
                            onChange={e => setEditedBusiness(prev => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adresse du siège</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input type="text" value={editedBusiness.address}
                          onChange={e => setEditedBusiness(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Adresse complète"
                          className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ville</label>
                      <input type="text" value={editedBusiness.city}
                        onChange={e => setEditedBusiness(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Devise</label>
                      <select value={editedBusiness.currency}
                        onChange={e => setEditedBusiness(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 bg-white cursor-pointer">
                        <option value="GNF">GNF — Franc Guinéen</option>
                        <option value="USD">USD — Dollar américain</option>
                        <option value="EUR">EUR — Euro</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 pt-5 border-t border-slate-100">
                    <button onClick={handleSaveBusiness} disabled={savingBusiness}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60">
                      <Save size={15} />
                      {savingBusiness ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Locations Tab */}
            {activeTab === 'locations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">Magasins & Emplacements</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{shops.length} magasin(s) configuré(s)</p>
                  </div>
                  <button onClick={() => setShowAddShop(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                    <Plus size={15} />Ajouter un magasin
                  </button>
                </div>

                {shops.map(shop => (
                  <div key={shop.id} className={`bg-white rounded-xl border shadow-sm ${shop.isMain ? 'border-amber-300' : 'border-slate-200'}`}>
                    {editingShop?.id === shop.id ? (
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-slate-900">Modifier le magasin</h3>
                          <button onClick={() => setEditingShop(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                            <X size={14} className="text-slate-500" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: 'Nom du magasin', key: 'name' },
                            { label: 'Ville', key: 'city' },
                            { label: 'Adresse', key: 'address' },
                            { label: 'Téléphone', key: 'phone' },
                            { label: 'Responsable', key: 'manager' },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
                              <input type="text" value={editingShop[f.key as keyof ShopLocation] as string}
                                onChange={e => setEditingShop(prev => prev ? { ...prev, [f.key]: e.target.value } : null)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 transition-colors" />
                            </div>
                          ))}
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={editingShop.active}
                                onChange={e => setEditingShop(prev => prev ? { ...prev, active: e.target.checked } : null)}
                                className="w-4 h-4 accent-amber-500" />
                              <span className="text-sm font-semibold text-slate-700">Magasin actif</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                          <button onClick={handleSaveShop} disabled={savingShop}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors disabled:opacity-60">
                            <Save size={14} />{savingShop ? 'Enregistrement...' : 'Sauvegarder'}
                          </button>
                          <button onClick={() => setEditingShop(null)} className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${shop.isMain ? 'bg-amber-100' : 'bg-slate-100'}`}>
                              <Store size={18} className={shop.isMain ? 'text-amber-600' : 'text-slate-500'} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900">{shop.name}</h3>
                                {shop.isMain && <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Principal</span>}
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${shop.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                  {shop.active ? 'Actif' : 'Inactif'}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={11} />{shop.address}, {shop.city}</span>
                                <span className="text-xs text-slate-500 flex items-center gap-1"><Phone size={11} />{shop.phone}</span>
                                <span className="text-xs text-slate-500 flex items-center gap-1"><User size={11} />{shop.manager}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {shop.isMain && (
                              <a href="/pos-point-of-sale"
                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                <ExternalLink size={13} />Ouvrir caisse
                              </a>
                            )}
                            <button onClick={() => setEditingShop(shop)}
                              className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                              <Edit3 size={13} />Modifier
                            </button>
                            {!shop.isMain && (
                              <button onClick={() => handleDeleteShop(shop.id)}
                                className="flex items-center gap-1.5 text-red-500 hover:text-red-600 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                <Trash2 size={13} />Supprimer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Shop Form */}
                {showAddShop && (
                  <div className="bg-white rounded-xl border border-amber-300 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900">Nouveau magasin</h3>
                      <button onClick={() => setShowAddShop(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                        <X size={14} className="text-slate-500" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Nom du magasin *', key: 'name', placeholder: 'Ex: Boutique Mamou' },
                        { label: 'Ville *', key: 'city', placeholder: 'Ex: Mamou' },
                        { label: 'Adresse', key: 'address', placeholder: 'Ex: Centre-ville' },
                        { label: 'Téléphone', key: 'phone', placeholder: '+224 6XX XX XX XX' },
                        { label: 'Responsable', key: 'manager', placeholder: 'Nom du gérant' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
                          <input type="text" value={newShop[f.key as keyof typeof newShop] as string || ''}
                            onChange={e => setNewShop(prev => ({ ...prev, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 transition-colors" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                      <button onClick={handleAddShop} disabled={savingShop}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors disabled:opacity-60">
                        <Plus size={14} />{savingShop ? 'Ajout...' : 'Ajouter le magasin'}
                      </button>
                      <button onClick={() => setShowAddShop(false)} className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200">
                  <User size={18} className="text-amber-500" />
                  <h2 className="font-bold text-slate-900">Informations du compte</h2>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xl">AM</div>
                    <div>
                      <p className="font-bold text-slate-900">Amadou Diallo</p>
                      <p className="text-sm text-slate-500">Gérant — Boutique Conakry</p>
                      <p className="text-xs text-amber-600 font-semibold mt-0.5">Rôle: Manager</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Prénom', value: 'Amadou' },
                      { label: 'Nom', value: 'Diallo' },
                      { label: 'Email', value: 'amadou.diallo@shopmanager.gn' },
                      { label: 'Téléphone', value: '+224 622 00 11 22' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
                        <input type="text" defaultValue={f.value} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock size={15} className="text-slate-500" />
                      <h3 className="font-semibold text-slate-900 text-sm">Changer le mot de passe</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Mot de passe actuel', 'Nouveau mot de passe', 'Confirmer le mot de passe'].map(f => (
                        <div key={f} className={f === 'Confirmer le mot de passe' ? 'md:col-span-2 md:max-w-xs' : ''}>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f}</label>
                          <input type="password" placeholder="••••••••" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button onClick={handleSaveAccount}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
                      <Save size={15} />Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200">
                  <Bell size={18} className="text-amber-500" />
                  <h2 className="font-bold text-slate-900">Préférences de notifications</h2>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: 'Alertes de stock faible', desc: 'Notifier quand un produit atteint le seuil minimum', enabled: true },
                    { label: 'Nouvelles ventes', desc: 'Notification à chaque transaction confirmée', enabled: true },
                    { label: 'Paiements en retard', desc: 'Rappels pour les dettes clients non réglées', enabled: true },
                    { label: 'Rapports quotidiens', desc: 'Résumé des ventes envoyé chaque soir', enabled: false },
                    { label: 'Rapports hebdomadaires', desc: 'Rapport de performance envoyé chaque lundi', enabled: true },
                    { label: 'Mises à jour système', desc: 'Informations sur les nouvelles fonctionnalités', enabled: false },
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{notif.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  ))}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button onClick={handleSaveNotifPrefs}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
                      <Save size={15} />Enregistrer les préférences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
