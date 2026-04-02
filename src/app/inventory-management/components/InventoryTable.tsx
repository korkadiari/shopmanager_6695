'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Plus, Edit3, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Package, Download, RefreshCw, AlertTriangle, X, Loader2  } from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/ui/StatusBadge';
import ProductDrawer from './ProductDrawer';
import AddProductModal from './AddProductModal';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  model: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  threshold: number;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  imei?: string;
}

function dbToProduct(row: Record<string, unknown>): Product {
  const stock = Number(row.stock) || 0;
  const threshold = Number(row.threshold) || 10;
  const status: Product['status'] = stock === 0 ? 'out_of_stock' : stock <= threshold ? 'low_stock' : 'in_stock';
  return {
    id: row.id as string,
    name: row.name as string,
    brand: (row.brand as string) || '',
    category: (row.category as string) || '',
    model: (row.model as string) || '',
    purchasePrice: Number(row.purchase_price) || 0,
    salePrice: Number(row.sale_price) || 0,
    stock,
    threshold,
    supplier: (row.supplier_name as string) || '',
    status,
    lastUpdated: row.last_updated ? new Date(row.last_updated as string).toLocaleDateString('fr-FR') : '',
    imei: (row.imei as string) || undefined,
  };
}

const categories = ['Toutes', 'Téléphones', 'Accessoires', 'Coques', 'Audio', 'Protection', 'Pièces détachées'];
const statusFilters = ['Tous', 'En stock', 'Stock faible', 'Rupture'];

type SortKey = 'name' | 'stock' | 'salePrice' | 'purchasePrice' | 'lastUpdated';
type SortDir = 'asc' | 'desc';

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

export default function InventoryTable() {
  const supabase = createClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const fetchTenantId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single();
    return data?.tenant_id || null;
  }, [supabase]);

  const fetchProducts = useCallback(async (tid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tid)
      .order('name');
    if (error) {
      toast.error('Erreur de chargement', { description: error.message });
    } else {
      setProducts((data || []).map(dbToProduct));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTenantId().then(tid => {
      if (tid) {
        setTenantId(tid);
        fetchProducts(tid);
      } else {
        setLoading(false);
      }
    });
  }, [fetchTenantId, fetchProducts]);

  const filtered = useMemo(() => {
    let data = products;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.supplier.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'Toutes') data = data.filter((p) => p.category === categoryFilter);
    if (statusFilter === 'En stock') data = data.filter((p) => p.status === 'in_stock');
    else if (statusFilter === 'Stock faible') data = data.filter((p) => p.status === 'low_stock');
    else if (statusFilter === 'Rupture') data = data.filter((p) => p.status === 'out_of_stock');

    data = [...data].sort((a, b) => {
      let av: string | number = a[sortKey] as string | number;
      let bv: string | number = b[sortKey] as string | number;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [products, search, categoryFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === paginated.length) setSelectedRows([]);
    else setSelectedRows(paginated.map((p) => p.id));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Erreur de suppression', { description: error.message });
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Produit supprimé', { description: 'Le produit a été retiré du catalogue.' });
    }
    setDeleteConfirm(null);
  };

  const handleBulkDelete = async () => {
    const { error } = await supabase.from('products').delete().in('id', selectedRows);
    if (error) {
      toast.error('Erreur de suppression', { description: error.message });
    } else {
      setProducts((prev) => prev.filter((p) => !selectedRows.includes(p.id)));
      toast.success(`${selectedRows.length} produits supprimés`);
      setSelectedRows([]);
    }
  };

  const handleAddProduct = async (product: Product) => {
    if (!tenantId) {
      toast.error('Tenant non trouvé');
      return;
    }
    const stockStatus = product.stock === 0 ? 'out_of_stock' : product.stock <= product.threshold ? 'low_stock' : 'in_stock';
    const { data, error } = await supabase
      .from('products')
      .insert({
        tenant_id: tenantId,
        name: product.name,
        brand: product.brand,
        category: product.category,
        model: product.model,
        purchase_price: product.purchasePrice,
        sale_price: product.salePrice,
        stock: product.stock,
        threshold: product.threshold,
        supplier_name: product.supplier,
        imei: product.imei || null,
        status: stockStatus,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast.error('Erreur d\'ajout', { description: error.message });
    } else if (data) {
      setProducts((prev) => [...prev, dbToProduct(data)]);
      toast.success('Produit ajouté', { description: product.name });
    }
    setShowAddModal(false);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={13} className="text-slate-300 ml-1 inline" />;
    return sortDir === 'asc'
      ? <ArrowUp size={13} className="text-amber-500 ml-1 inline" />
      : <ArrowDown size={13} className="text-amber-500 ml-1 inline" />;
  };

  const marginPct = (p: Product) =>
    p.purchasePrice > 0
      ? (((p.salePrice - p.purchasePrice) / p.purchasePrice) * 100).toFixed(0)
      : '—';

  const fmt = (n: number) => new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(n);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-72 focus-within:border-amber-400 focus-within:bg-white transition-all">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher produit, marque, fournisseur..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
                autoComplete="off"
              />
              {search && (
                <button onClick={() => { setSearch(''); setPage(1); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400 transition-colors cursor-pointer"
            >
              {categories.map((c) => (
                <option key={`cat-opt-${c}`} value={c}>{c}</option>
              ))}
            </select>

            {/* Status filter */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {statusFilters.map((s) => (
                <button
                  key={`sf-${s}`}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => toast.success('Export démarré', { description: 'Téléchargement Excel en cours...' })}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download size={14} /> Export
              </button>
              <button
                onClick={() => tenantId && fetchProducts(tenantId)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all active:scale-95 shadow-sm"
              >
                <Plus size={15} /> Ajouter produit
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{filtered.length}</span> produits trouvés
              {selectedRows.length > 0 && (
                <span className="ml-2 text-amber-600 font-semibold">· {selectedRows.length} sélectionné(s)</span>
              )}
            </p>
            {filtered.some((p) => p.status === 'low_stock' || p.status === 'out_of_stock') && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                <AlertTriangle size={12} />
                <span className="font-semibold">
                  {filtered.filter((p) => p.status === 'low_stock' || p.status === 'out_of_stock').length} produits nécessitent attention
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedRows.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-3">
            <span className="text-sm font-semibold text-amber-800">{selectedRows.length} produit(s) sélectionné(s)</span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={13} /> Supprimer la sélection
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="text-xs text-slate-500 hover:text-slate-700 ml-auto transition-colors"
            >
              Désélectionner tout
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-amber-500" />
            </div>
          ) : (
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginated.length && paginated.length > 0}
                    onChange={toggleAll}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-amber-600 transition-colors select-none" onClick={() => toggleSort('name')}>
                  Produit <SortIcon col="name" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Marque</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Modèle</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-amber-600 transition-colors select-none" onClick={() => toggleSort('purchasePrice')}>
                  Prix achat <SortIcon col="purchasePrice" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-amber-600 transition-colors select-none" onClick={() => toggleSort('salePrice')}>
                  Prix vente <SortIcon col="salePrice" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Marge</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-amber-600 transition-colors select-none" onClick={() => toggleSort('stock')}>
                  Stock <SortIcon col="stock" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fournisseur</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package size={40} className="text-slate-200" />
                      <p className="font-semibold text-slate-400">Aucun produit trouvé</p>
                      <p className="text-sm text-slate-300">Modifiez vos filtres ou ajoutez un nouveau produit</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-1 px-4 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all active:scale-95"
                      >
                        Ajouter un produit
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((product, idx) => {
                  const isSelected = selectedRows.includes(product.id);
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-slate-50 transition-colors group ${isSelected ? 'bg-amber-50' : isEven ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/50'}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(product.id)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            product.status === 'out_of_stock' ? 'bg-red-100' :
                            product.status === 'low_stock' ? 'bg-amber-100' : 'bg-slate-100'
                          }`}>
                            <Package size={14} className={
                              product.status === 'out_of_stock' ? 'text-red-500' :
                              product.status === 'low_stock' ? 'text-amber-500' : 'text-slate-500'
                            } />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 leading-tight">{product.name}</p>
                            {product.imei && <p className="text-xs text-slate-400 font-mono">IMEI: {product.imei}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${brandColors[product.brand] || 'bg-slate-100 text-slate-600'}`}>
                          {product.brand}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{product.category}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{product.model}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700 tabular-nums">{fmt(product.purchasePrice)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-slate-900 tabular-nums">{fmt(product.salePrice)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-bold tabular-nums ${
                          Number(marginPct(product)) >= 30 ? 'text-green-600' :
                          Number(marginPct(product)) >= 15 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {marginPct(product)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold tabular-nums ${
                          product.stock === 0 ? 'text-red-600' :
                          product.stock <= product.threshold ? 'text-amber-600' : 'text-slate-900'
                        }`}>
                          {product.stock}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">/ {product.threshold}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{product.supplier}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status={product.status === 'in_stock' ? 'active' : product.status === 'low_stock' ? 'pending' : 'inactive'}
                          label={product.status === 'in_stock' ? 'En stock' : product.status === 'low_stock' ? 'Stock faible' : 'Rupture'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDrawerProduct(product)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                            title="Voir détails"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => toast.info('Modification', { description: 'Fonctionnalité en cours de développement' })}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors"
                            title="Modifier"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Lignes par page:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-white outline-none focus:border-amber-400"
              >
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} sur {filtered.length}
              </span>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-2">Supprimer ce produit ?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {drawerProduct && (
        <ProductDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)} />
      )}
      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} onAdd={handleAddProduct} />
      )}
    </>
  );
}