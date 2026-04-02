'use client';
import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Store, MapPin, Phone, Edit3, Save, Plus, Trash2, X, User, ExternalLink, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ShopLocation {
  id: string;
  name: string;
  commercial_name: string;
  address: string;
  city: string;
  phone: string;
  manager: string;
  logo_url: string;
  isMain: boolean;
  active: boolean;
}

const initialShops: ShopLocation[] = [
  { id: 'S001', name: 'Boutique Conakry', commercial_name: 'Boutique Conakry', address: 'Madina, Commune de Ratoma', city: 'Conakry', phone: '+224 622 11 22 33', manager: 'Amadou Diallo', logo_url: '', isMain: true, active: true },
  { id: 'S002', name: 'Boutique Kindia', commercial_name: 'Boutique Kindia', address: 'Centre-ville, Marché Central', city: 'Kindia', phone: '+224 655 44 55 66', manager: 'Fatoumata Bah', logo_url: '', isMain: false, active: true },
  { id: 'S003', name: 'Boutique Labé', commercial_name: 'Boutique Labé', address: 'Marché Central, Quartier Tata', city: 'Labé', phone: '+224 628 77 88 99', manager: 'Ibrahima Sow', logo_url: '', isMain: false, active: false },
];

function LogoUploader({
  currentUrl,
  shopName,
  onUploaded,
}: {
  currentUrl: string;
  shopName: string;
  onUploaded: (url: string) => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      // Try Supabase storage upload
      const ext = file.name.split('.').pop();
      const path = `shop-logos/${Date.now()}-${shopName.replace(/\s+/g, '-').toLowerCase()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('shop-assets')
        .upload(path, file, { upsert: true });

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('shop-assets')
          .getPublicUrl(path);
        setPreview(publicUrl);
        onUploaded(publicUrl);
      } else {
        // Fallback: use object URL as local preview
        onUploaded(objectUrl);
      }
    } catch {
      onUploaded(objectUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
        {preview ? (
          <img src={preview} alt="Logo boutique" className="w-full h-full object-cover rounded-xl" />
        ) : (
          <ImageIcon size={20} className="text-slate-300" />
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          {uploading ? 'Téléchargement...' : 'Changer le logo'}
        </button>
        <p className="text-xs text-slate-400 mt-1">PNG, JPG, SVG — max 2 Mo</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

export default function MagasinsPage() {
  const [shops, setShops] = useState<ShopLocation[]>(initialShops);
  const [editingShop, setEditingShop] = useState<ShopLocation | null>(null);
  const [showAddShop, setShowAddShop] = useState(false);
  const [newShop, setNewShop] = useState<Partial<ShopLocation>>({ name: '', commercial_name: '', address: '', city: '', phone: '', manager: '', logo_url: '', isMain: false, active: true });
  const [saveSuccess, setSaveSuccess] = useState('');

  const showSuccess = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleSaveShop = () => {
    if (!editingShop) return;
    setShops(prev => prev.map(s => s.id === editingShop.id ? editingShop : s));
    setEditingShop(null);
    showSuccess(`${editingShop.name} mis à jour`);
  };

  const handleAddShop = () => {
    if (!newShop.name || !newShop.city) {
      return;
    }
    const shop: ShopLocation = {
      id: `S${String(shops.length + 1).padStart(3, '0')}`,
      name: newShop.name || '',
      commercial_name: newShop.commercial_name || newShop.name || '',
      address: newShop.address || '',
      city: newShop.city || '',
      phone: newShop.phone || '',
      manager: newShop.manager || '',
      logo_url: newShop.logo_url || '',
      isMain: false,
      active: true,
    };
    setShops(prev => [...prev, shop]);
    setNewShop({ name: '', commercial_name: '', address: '', city: '', phone: '', manager: '', logo_url: '', isMain: false, active: true });
    setShowAddShop(false);
    showSuccess(`${shop.name} ajouté`);
  };

  const handleDeleteShop = (id: string) => {
    const shop = shops.find(s => s.id === id);
    setShops(prev => prev.filter(s => s.id !== id));
    showSuccess(`${shop?.name} supprimé`);
  };

  const editFields = [
    { label: 'Nom du magasin', key: 'name', placeholder: 'Ex: Boutique Conakry' },
    { label: 'Nom commercial (enseigne)', key: 'commercial_name', placeholder: 'Ex: Diallo & Fils' },
    { label: 'Ville', key: 'city', placeholder: 'Ex: Conakry' },
    { label: 'Adresse', key: 'address', placeholder: 'Ex: Madina, Ratoma' },
    { label: 'Téléphone', key: 'phone', placeholder: '+224 6XX XX XX XX' },
    { label: 'Responsable', key: 'manager', placeholder: 'Nom du gérant' },
  ];

  return (
    <AppLayout>
      <Topbar title="Magasins" subtitle="Gestion des emplacements et boutiques" />
      <div className="px-4 lg:px-6 xl:px-8 py-6 max-w-screen-xl mx-auto space-y-4">

        {/* Success toast */}
        {saveSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
            ✓ {saveSuccess}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{shops.length} magasin(s) configuré(s)</p>
          </div>
          <button
            onClick={() => setShowAddShop(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Ajouter un magasin
          </button>
        </div>

        {/* Shop Cards */}
        {shops.map(shop => (
          <div key={shop.id} className={`bg-white rounded-xl border shadow-sm ${shop.isMain ? 'border-amber-300' : 'border-slate-200'}`}>
            {editingShop?.id === shop.id ? (
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-slate-900">Modifier le magasin</h3>
                  <button onClick={() => setEditingShop(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                    <X size={14} className="text-slate-500" />
                  </button>
                </div>

                {/* Logo upload */}
                <div className="mb-5 pb-5 border-b border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Logo de la boutique</label>
                  <LogoUploader
                    currentUrl={editingShop.logo_url}
                    shopName={editingShop.name}
                    onUploaded={url => setEditingShop(prev => prev ? { ...prev, logo_url: url } : null)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editFields.map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
                      <input
                        type="text"
                        value={editingShop[f.key as keyof ShopLocation] as string}
                        onChange={e => setEditingShop(prev => prev ? { ...prev, [f.key]: e.target.value } : null)}
                        placeholder={f.placeholder}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-3 md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingShop.active}
                        onChange={e => setEditingShop(prev => prev ? { ...prev, active: e.target.checked } : null)}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">Magasin actif</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button onClick={handleSaveShop} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors">
                    <Save size={14} />
                    Sauvegarder
                  </button>
                  <button onClick={() => setEditingShop(null)} className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {/* Logo or icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${shop.isMain ? 'bg-amber-100' : 'bg-slate-100'}`}>
                      {shop.logo_url ? (
                        <img src={shop.logo_url} alt={`Logo ${shop.name}`} className="w-full h-full object-cover" />
                      ) : (
                        <Store size={20} className={shop.isMain ? 'text-amber-600' : 'text-slate-500'} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900">{shop.name}</h3>
                        {shop.commercial_name && shop.commercial_name !== shop.name && (
                          <span className="text-xs text-slate-500 font-medium">({shop.commercial_name})</span>
                        )}
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
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {shop.isMain && (
                      <a
                        href="/pos-point-of-sale"
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <ExternalLink size={13} />
                        Ouvrir caisse
                      </a>
                    )}
                    <button
                      onClick={() => setEditingShop(shop)}
                      className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <Edit3 size={13} />
                      Modifier
                    </button>
                    {!shop.isMain && (
                      <button
                        onClick={() => handleDeleteShop(shop.id)}
                        className="flex items-center gap-1.5 text-red-500 hover:text-red-600 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                        Supprimer
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

            {/* Logo upload for new shop */}
            <div className="mb-4 pb-4 border-b border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Logo de la boutique <span className="text-slate-400 font-normal">(optionnel)</span></label>
              <LogoUploader
                currentUrl={newShop.logo_url || ''}
                shopName={newShop.name || 'nouveau'}
                onUploaded={url => setNewShop(prev => ({ ...prev, logo_url: url }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Nom du magasin *', key: 'name', placeholder: 'Ex: Boutique Mamou' },
                { label: 'Nom commercial (enseigne)', key: 'commercial_name', placeholder: 'Ex: Mamou Commerce' },
                { label: 'Ville *', key: 'city', placeholder: 'Ex: Mamou' },
                { label: 'Adresse', key: 'address', placeholder: 'Ex: Centre-ville' },
                { label: 'Téléphone', key: 'phone', placeholder: '+224 6XX XX XX XX' },
                { label: 'Responsable', key: 'manager', placeholder: 'Nom du gérant' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    value={newShop[f.key as keyof typeof newShop] as string || ''}
                    onChange={e => setNewShop(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={handleAddShop}
                disabled={!newShop.name || !newShop.city}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
              >
                <Plus size={14} />
                Ajouter le magasin
              </button>
              <button onClick={() => setShowAddShop(false)} className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
