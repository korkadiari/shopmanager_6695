'use client';
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Package, Barcode, Camera, X, AlertCircle } from 'lucide-react';
import type { CartItem } from './POSLayout';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  barcode?: string;
  image?: string;
}

// Backend integration: GET /api/products?shopId=&category=&search=&page=
const allProducts: Product[] = [
  { id: 'p-001', name: 'Samsung Galaxy A15', brand: 'Samsung', category: 'Téléphones', price: 2850000, stock: 3, barcode: '8801643786657' },
  { id: 'p-002', name: 'Tecno Spark 20 Pro', brand: 'Tecno', category: 'Téléphones', price: 1950000, stock: 8, barcode: '6934177777777' },
  { id: 'p-003', name: 'Infinix Hot 40i', brand: 'Infinix', category: 'Téléphones', price: 1450000, stock: 4, barcode: '6936833444444' },
  { id: 'p-004', name: 'Itel P40', brand: 'Itel', category: 'Téléphones', price: 1200000, stock: 12, barcode: '6901210111111' },
  { id: 'p-005', name: 'Tecno Camon 20', brand: 'Tecno', category: 'Téléphones', price: 3200000, stock: 5, barcode: '6934177888888' },
  { id: 'p-006', name: 'Samsung Galaxy A05', brand: 'Samsung', category: 'Téléphones', price: 1750000, stock: 7, barcode: '8801643786658' },
  { id: 'p-007', name: 'Infinix Smart 8', brand: 'Infinix', category: 'Téléphones', price: 950000, stock: 15, barcode: '6936833555555' },
  { id: 'p-008', name: 'Itel A70', brand: 'Itel', category: 'Téléphones', price: 750000, stock: 20, barcode: '6901210222222' },
  { id: 'p-009', name: 'Chargeur Rapide 65W', brand: 'Générique', category: 'Accessoires', price: 140000, stock: 0, barcode: '1234567890001' },
  { id: 'p-010', name: 'Chargeur Rapide 33W', brand: 'Générique', category: 'Accessoires', price: 95000, stock: 14, barcode: '1234567890002' },
  { id: 'p-011', name: 'Câble USB-C 2m', brand: 'Anker', category: 'Accessoires', price: 50000, stock: 35, barcode: '1234567890003' },
  { id: 'p-012', name: 'Coque Samsung A15', brand: 'Générique', category: 'Coques', price: 45000, stock: 28, barcode: '1234567890004' },
  { id: 'p-013', name: 'Coque Infinix Hot 40', brand: 'Générique', category: 'Coques', price: 40000, stock: 18, barcode: '1234567890005' },
  { id: 'p-014', name: 'Écouteurs Bluetooth TWS', brand: 'Haylou', category: 'Audio', price: 250000, stock: 9, barcode: '1234567890006' },
  { id: 'p-015', name: 'Powerbank 20000mAh', brand: 'Baseus', category: 'Accessoires', price: 800000, stock: 6, barcode: '1234567890007' },
  { id: 'p-016', name: 'Verre trempé A15', brand: 'Générique', category: 'Protection', price: 30000, stock: 40, barcode: '1234567890008' },
  { id: 'p-017', name: 'Verre trempé Infinix Hot 40', brand: 'Générique', category: 'Protection', price: 28000, stock: 32, barcode: '1234567890009' },
  { id: 'p-018', name: 'Support voiture magnétique', brand: 'Baseus', category: 'Accessoires', price: 120000, stock: 11, barcode: '1234567890010' },
  { id: 'p-019', name: 'Tecno Pova 6 Neo', brand: 'Tecno', category: 'Téléphones', price: 2100000, stock: 6, barcode: '6934177999999' },
  { id: 'p-020', name: 'Samsung Galaxy A35', brand: 'Samsung', category: 'Téléphones', price: 4500000, stock: 2, barcode: '8801643786659' },
];

const categories = ['Tous', 'Téléphones', 'Accessoires', 'Coques', 'Audio', 'Protection'];

const brandColors: Record<string, string> = {
  Samsung: 'bg-blue-100 text-blue-700',
  Tecno: 'bg-amber-100 text-amber-700',
  Infinix: 'bg-green-100 text-green-700',
  Itel: 'bg-purple-100 text-purple-700',
  Anker: 'bg-cyan-100 text-cyan-700',
  Baseus: 'bg-orange-100 text-orange-700',
  Haylou: 'bg-pink-100 text-pink-700',
  Générique: 'bg-slate-100 text-slate-600',
};

interface Props {
  onAddToCart: (product: { id: string; name: string; price: number; stock: number; category: string }) => void;
  cartItems: CartItem[];
}

export default function ProductCatalog({ onAddToCart, cartItems }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeMode, setBarcodeMode] = useState<'none' | 'manual' | 'camera'>('none');
  const [barcodeError, setBarcodeError] = useState('');
  const barcodeRef = useRef<HTMLInputElement>(null);
  const barcodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (barcodeMode === 'manual' && barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, [barcodeMode]);

  const handleBarcodeSubmit = useCallback((code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const product = allProducts.find(p => p.barcode === trimmed);
    if (product) {
      if (product.stock === 0) {
        setBarcodeError(`${product.name} — Rupture de stock`);
      } else {
        onAddToCart(product);
        setBarcodeError('');
      }
    } else {
      setBarcodeError(`Code-barres "${trimmed}" non trouvé`);
    }
    setBarcodeInput('');
  }, [onAddToCart]);

  // Auto-submit when barcode scanner sends Enter or after 500ms pause (hardware scanner)
  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBarcodeInput(val);
    setBarcodeError('');
    if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
    barcodeTimerRef.current = setTimeout(() => {
      if (val.trim().length >= 8) {
        handleBarcodeSubmit(val);
      }
    }, 500);
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
      handleBarcodeSubmit(barcodeInput);
    }
  };

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const matchCat = activeCategory === 'Tous' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const getCartQty = (productId: string) => {
    return cartItems.find((i) => i.productId === productId)?.quantity ?? 0;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-amber-400 focus-within:bg-white transition-all">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un produit, marque..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
            />
          </div>
          {/* Barcode toggle button */}
          <button
            onClick={() => setBarcodeMode(barcodeMode === 'none' ? 'manual' : 'none')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
              barcodeMode !== 'none' ?'border-amber-400 bg-amber-50 text-amber-600' :'border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-500 hover:text-amber-600'
            }`}
            title="Scanner code-barres"
          >
            <Barcode size={15} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-colors text-slate-500 hover:text-amber-600">
            <Filter size={15} />
          </button>
        </div>

        {/* Barcode Input Panel */}
        {barcodeMode !== 'none' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {/* Manual entry */}
              <div className={`flex-1 flex items-center gap-2 border rounded-lg px-3 py-2 transition-all ${
                barcodeMode === 'manual' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50'
              }`}>
                <Barcode size={14} className="text-amber-500 shrink-0" />
                <input
                  ref={barcodeRef}
                  type="text"
                  placeholder="Saisir ou scanner le code-barres..."
                  value={barcodeInput}
                  onChange={handleBarcodeChange}
                  onKeyDown={handleBarcodeKeyDown}
                  className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1 tabular-nums"
                />
                {barcodeInput && (
                  <button onClick={() => { setBarcodeInput(''); setBarcodeError(''); }} className="text-slate-400 hover:text-slate-600">
                    <X size={13} />
                  </button>
                )}
              </div>
              {/* Camera button */}
              <button
                onClick={() => setBarcodeMode(barcodeMode === 'camera' ? 'manual' : 'camera')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  barcodeMode === 'camera' ?'border-amber-400 bg-amber-500 text-white' :'border-slate-200 text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700'
                }`}
                title="Scanner via caméra"
              >
                <Camera size={14} />
                <span className="hidden sm:inline">Caméra</span>
              </button>
              <button
                onClick={() => { setBarcodeMode('none'); setBarcodeInput(''); setBarcodeError(''); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Camera placeholder */}
            {barcodeMode === 'camera' && (
              <div className="bg-slate-900 rounded-xl overflow-hidden relative" style={{ height: '120px' }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Camera size={28} className="text-slate-400" />
                  <p className="text-xs text-slate-400 text-center px-4">
                    Caméra non disponible dans cet environnement.<br />
                    Utilisez la saisie manuelle ci-dessus.
                  </p>
                </div>
                {/* Scan line animation */}
                <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-amber-400/60 animate-pulse" />
              </div>
            )}

            {/* Error / hint */}
            {barcodeError ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                <AlertCircle size={13} />
                {barcodeError}
              </div>
            ) : (
              <p className="text-xs text-slate-400 px-1">
                Appuyez sur <kbd className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">Entrée</kbd> ou attendez la détection automatique
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          {categories.map((cat) => (
            <button
              key={`cat-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Package size={40} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-500">Aucun produit trouvé</p>
            <p className="text-sm text-slate-400 mt-1">Essayez un autre terme de recherche ou catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filtered.map((product) => {
              const cartQty = getCartQty(product.id);
              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && onAddToCart(product)}
                  className={`
                    relative bg-white rounded-xl border p-3 transition-all duration-150 group
                    ${isOutOfStock
                      ? 'border-slate-200 opacity-60 cursor-not-allowed' :'border-slate-200 hover:border-amber-400 hover:shadow-card-md cursor-pointer active:scale-95'
                    }
                    ${cartQty > 0 ? 'border-amber-400 bg-amber-50' : ''}
                  `}
                >
                  {/* Cart quantity badge */}
                  {cartQty > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center z-10">
                      <span className="text-white text-xs font-bold tabular-nums">{cartQty}</span>
                    </div>
                  )}

                  {/* Product icon placeholder */}
                  <div className={`w-full h-20 rounded-lg mb-2 flex items-center justify-center ${
                    isOutOfStock ? 'bg-slate-100' : cartQty > 0 ? 'bg-amber-100' : 'bg-slate-50'
                  }`}>
                    <Package size={28} className={isOutOfStock ? 'text-slate-300' : cartQty > 0 ? 'text-amber-500' : 'text-slate-300'} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">{product.name}</p>
                    <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium ${brandColors[product.brand] ?? 'bg-slate-100 text-slate-600'}`}>
                      {product.brand}
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-amber-600 tabular-nums">
                        {(product.price / 1000).toFixed(0)}K
                      </p>
                      {isOutOfStock ? (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">Rupture</span>
                      ) : isLowStock ? (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">{product.stock} restants</span>
                      ) : (
                        <span className="text-xs text-slate-400">{product.stock} en stock</span>
                      )}
                    </div>
                  </div>

                  {!isOutOfStock && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <Plus size={13} className="text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">{filtered.length} produits affichés</span>
        <span className="text-xs text-slate-400">Dernière mise à jour: 14:51</span>
      </div>
    </div>
  );
}