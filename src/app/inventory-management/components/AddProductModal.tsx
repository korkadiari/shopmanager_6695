'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Package, Loader2, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  model: string;
  purchasePrice: number;
  salePrice: number;
  minDiscountPrice: number;
  maxDiscountPrice: number;
  stock: number;
  threshold: number;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  imei?: string;
}

interface FormData {
  name: string;
  brand: string;
  category: string;
  model: string;
  purchasePrice: number;
  salePrice: number;
  minDiscountPrice: number;
  maxDiscountPrice: number;
  stock: number;
  threshold: number;
  supplier: string;
  imei?: string;
}

interface Props {
  onClose: () => void;
  onAdd: (product: Product) => void;
}

const categories = ['Téléphones', 'Accessoires', 'Coques', 'Audio', 'Protection', 'Pièces détachées'];
const brands = ['Samsung', 'Tecno', 'Infinix', 'Itel', 'Anker', 'Baseus', 'Haylou', 'Générique', 'Autre'];
const suppliers = ['Diallo Électronique', 'TechDistrib GN', 'Conakry Mobile', 'AccessImport', 'AudioTech GN'];

export default function AddProductModal({ onClose, onAdd }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { threshold: 10, stock: 0 },
  });

  const purchasePrice = watch('purchasePrice') || 0;
  const salePrice = watch('salePrice') || 0;
  const margin = purchasePrice > 0 ? (((salePrice - purchasePrice) / purchasePrice) * 100).toFixed(1) : '—';

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    // Backend integration: POST /api/products { ...data, shopId }
    await new Promise((r) => setTimeout(r, 1000));

    const stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' =
      data.stock === 0 ? 'out_of_stock' :
      data.stock <= data.threshold ? 'low_stock' : 'in_stock';

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      ...data,
      imei: data.imei || undefined,
      status: stockStatus,
      lastUpdated: '31/03/2026',
    };

    setIsSubmitting(false);
    onAdd(newProduct);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-card-lg w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Package size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Ajouter un produit</h2>
              <p className="text-xs text-slate-500">Nouveau produit au catalogue</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-6 py-5 space-y-6">
            {/* Section: Informations générales */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">1</span>
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Nom du produit <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-1.5">Nom complet tel qu&apos;il apparaîtra dans le POS et les factures</p>
                  <input
                    type="text"
                    placeholder="Ex: Samsung Galaxy A15 128Go/4Go"
                    {...register('name', { required: 'Le nom du produit est requis' })}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${
                      errors.name ? 'border-red-300 focus:border-red-400 bg-red-50' : 'border-slate-200 focus:border-amber-400 bg-white'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Marque <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('brand', { required: 'La marque est requise' })}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors bg-white cursor-pointer ${
                      errors.brand ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-amber-400'
                    }`}
                  >
                    <option value="">Sélectionner une marque</option>
                    {brands.map((b) => <option key={`brand-opt-${b}`} value={b}>{b}</option>)}
                  </select>
                  {errors.brand && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.brand.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category', { required: 'La catégorie est requise' })}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors bg-white cursor-pointer ${
                      errors.category ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-amber-400'
                    }`}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((c) => <option key={`cat-opt-modal-${c}`} value={c}>{c}</option>)}
                  </select>
                  {errors.category && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Modèle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: A15 4G"
                    {...register('model', { required: 'Le modèle est requis' })}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${
                      errors.model ? 'border-red-300 focus:border-red-400 bg-red-50' : 'border-slate-200 focus:border-amber-400 bg-white'
                    }`}
                  />
                  {errors.model && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.model.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">IMEI / Numéro de série</label>
                  <p className="text-xs text-slate-400 mb-1.5">Optionnel — pour les téléphones uniquement</p>
                  <input
                    type="text"
                    placeholder="Ex: 352938XXXXXXXXX"
                    {...register('imei')}
                    className="w-full border border-slate-200 focus:border-amber-400 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section: Tarification */}
            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">2</span>
                Tarification (GNF)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Prix d&apos;achat <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-1.5">Coût d&apos;acquisition fournisseur</p>
                  <div className="flex items-center border border-slate-200 focus-within:border-amber-400 rounded-lg overflow-hidden transition-colors">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      {...register('purchasePrice', {
                        required: 'Prix d\'achat requis',
                        min: { value: 1, message: 'Doit être supérieur à 0' },
                        valueAsNumber: true,
                      })}
                      className="flex-1 px-3 py-2.5 text-sm outline-none bg-white tabular-nums"
                    />
                    <span className="px-3 py-2.5 bg-slate-50 text-xs text-slate-500 font-semibold border-l border-slate-200">GNF</span>
                  </div>
                  {errors.purchasePrice && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.purchasePrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Prix de vente <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-1.5">Prix affiché en boutique</p>
                  <div className="flex items-center border border-slate-200 focus-within:border-amber-400 rounded-lg overflow-hidden transition-colors">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      {...register('salePrice', {
                        required: 'Prix de vente requis',
                        min: { value: 1, message: 'Doit être supérieur à 0' },
                        valueAsNumber: true,
                      })}
                      className="flex-1 px-3 py-2.5 text-sm outline-none bg-white tabular-nums"
                    />
                    <span className="px-3 py-2.5 bg-slate-50 text-xs text-slate-500 font-semibold border-l border-slate-200">GNF</span>
                  </div>
                  {errors.salePrice && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.salePrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Marge estimée</label>
                  <p className="text-xs text-slate-400 mb-1.5">Calculée automatiquement</p>
                  <div className={`border rounded-lg px-3 py-2.5 text-sm font-bold tabular-nums ${
                    parseFloat(margin) >= 20 ? 'bg-green-50 border-green-200 text-green-700' :
                    parseFloat(margin) >= 0 ? 'bg-amber-50 border-amber-200 text-amber-700': 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {margin !== '—' ? `+${margin}%` : '—'}
                  </div>
                </div>
              </div>

              {/* Discount price range */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">Fourchette de remise autorisée</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Prix remise minimum <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-1.5">Prix plancher — remise maximale accordée</p>
                    <div className="flex items-center border border-slate-200 focus-within:border-blue-400 rounded-lg overflow-hidden transition-colors bg-white">
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...register('minDiscountPrice', {
                          required: 'Prix remise minimum requis',
                          min: { value: 1, message: 'Doit être supérieur à 0' },
                          valueAsNumber: true,
                        })}
                        className="flex-1 px-3 py-2.5 text-sm outline-none bg-white tabular-nums"
                      />
                      <span className="px-3 py-2.5 bg-slate-50 text-xs text-slate-500 font-semibold border-l border-slate-200">GNF</span>
                    </div>
                    {errors.minDiscountPrice && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.minDiscountPrice.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Prix remise maximum <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-1.5">Prix plafond — remise minimale accordée</p>
                    <div className="flex items-center border border-slate-200 focus-within:border-blue-400 rounded-lg overflow-hidden transition-colors bg-white">
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...register('maxDiscountPrice', {
                          required: 'Prix remise maximum requis',
                          min: { value: 1, message: 'Doit être supérieur à 0' },
                          valueAsNumber: true,
                        })}
                        className="flex-1 px-3 py-2.5 text-sm outline-none bg-white tabular-nums"
                      />
                      <span className="px-3 py-2.5 bg-slate-50 text-xs text-slate-500 font-semibold border-l border-slate-200">GNF</span>
                    </div>
                    {errors.maxDiscountPrice && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.maxDiscountPrice.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Stock */}
            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">3</span>
                Gestion du stock
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Quantité initiale <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-1.5">Nombre d&apos;unités en stock actuellement</p>
                  <input
                    type="number"
                    min={0}
                    {...register('stock', {
                      required: 'Quantité requise',
                      min: { value: 0, message: 'Minimum 0' },
                      valueAsNumber: true,
                    })}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors tabular-nums ${
                      errors.stock ? 'border-red-300 focus:border-red-400 bg-red-50' : 'border-slate-200 focus:border-amber-400 bg-white'
                    }`}
                  />
                  {errors.stock && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.stock.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Seuil d&apos;alerte <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-1.5">Alerte quand le stock descend en dessous</p>
                  <input
                    type="number"
                    min={1}
                    {...register('threshold', {
                      required: 'Seuil requis',
                      min: { value: 1, message: 'Minimum 1' },
                      valueAsNumber: true,
                    })}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors tabular-nums ${
                      errors.threshold ? 'border-red-300 focus:border-red-400 bg-red-50' : 'border-slate-200 focus:border-amber-400 bg-white'
                    }`}
                  />
                  {errors.threshold && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.threshold.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Fournisseur <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-1.5">Source d&apos;approvisionnement principale</p>
                  <select
                    {...register('supplier', { required: 'Le fournisseur est requis' })}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors bg-white cursor-pointer ${
                      errors.supplier ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-amber-400'
                    }`}
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {suppliers.map((s) => <option key={`sup-opt-${s}`} value={s}>{s}</option>)}
                  </select>
                  {errors.supplier && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.supplier.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-white sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-amber-300 text-white cursor-not-allowed' :'bg-amber-500 hover:bg-amber-600 text-white active:scale-95 shadow-sm'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Package size={15} />
                  Ajouter au catalogue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}