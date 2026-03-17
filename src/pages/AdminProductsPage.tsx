import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Package, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

const CATEGORIES = ['Noodles', 'Condiments', 'Soups & Mixes', 'Canned Goods', 'Snacks', 'Dairy', 'Beverages', 'Frozen', 'Rice & Grains'];

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stockQuantity: number;
}

type InlineField = 'price' | 'stockQuantity' | 'category';

interface InlineEdit {
  id: number;
  field: InlineField;
  value: string;
}

const EMPTY_FORM = { name: '', description: '', price: '', category: '', stockQuantity: '', imageUrl: '' };

export function AdminProductsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  // Inline editing state
  const [inlineEdit, setInlineEdit] = useState<InlineEdit | null>(null);
  const inlineRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  // Image upload state (in modal)
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && isAdmin) fetchProducts();
  }, [authLoading, user, isAdmin]);

  // Focus inline input when it appears
  useEffect(() => {
    if (inlineEdit && inlineRef.current) {
      inlineRef.current.focus();
      if (inlineRef.current instanceof HTMLInputElement) inlineRef.current.select();
    }
  }, [inlineEdit]);

  async function fetchProducts() {
    try {
      const res = await fetch(`${API_URL}/api/products?limit=50`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch { setMessage({ type: 'error', text: 'Failed to load products.' }); }
    finally { setLoading(false); }
  }

  // ── Modal form submit (create / full edit) ──────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setMessage(null);

    const body = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      category: form.category,
      stockQuantity: parseInt(form.stockQuantity) || 0,
      imageUrl: form.imageUrl,
    };

    try {
      const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed'); }
      setMessage({ type: 'success', text: editingId ? 'Product updated!' : 'Product created!' });
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      fetchProducts();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save product.' });
    }
  }

  // ── Image upload (inside modal) ─────────────────────────────────────────────
  function handleImageSelect() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !user) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const productIdParam = editingId ? `?productId=${editingId}` : '';
        const res = await fetch(`${API_URL}/api/image/upload${productIdParam}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` },
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setForm(f => ({ ...f, imageUrl: data.imageUrl }));
        if (editingId) {
          setProducts(prev => prev.map(p => p.id === editingId ? { ...p, imageUrl: data.imageUrl } : p));
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Image upload failed.' });
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(id: number) {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (!res.ok && res.status !== 204) throw new Error('Delete failed');
      setMessage({ type: 'success', text: `Product #${id} deleted.` });
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete.' });
    }
  }

  // ── Clear all products ───────────────────────────────────────────────────────
  async function handleClearAll() {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/products/all`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Failed to clear products.');
      const data = await res.json();
      setMessage({ type: 'success', text: data.message });
      setClearAllConfirm(false);
      fetchProducts();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to clear products.' });
    }
  }

  // ── Inline edit helpers ──────────────────────────────────────────────────────
  function startInline(id: number, field: InlineField, value: string) {
    setInlineEdit({ id, field, value });
  }

  async function saveInline() {
    if (!inlineEdit || !user) { setInlineEdit(null); return; }
    const product = products.find(p => p.id === inlineEdit.id);
    if (!product) { setInlineEdit(null); return; }

    const updated = {
      name: product.name ?? '',
      description: product.description ?? '',
      imageUrl: product.imageUrl ?? '',
      price: inlineEdit.field === 'price' ? parseFloat(inlineEdit.value) || (product.price ?? 0) : (product.price ?? 0),
      stockQuantity: inlineEdit.field === 'stockQuantity' ? parseInt(inlineEdit.value, 10) || (product.stockQuantity ?? 0) : (product.stockQuantity ?? 0),
      category: inlineEdit.field === 'category' ? inlineEdit.value : (product.category ?? ''),
    };

    setInlineEdit(null);

    // Optimistically update UI
    setProducts(prev => prev.map(p => p.id === inlineEdit.id ? { ...p, ...updated } : p));

    try {
      const res = await fetch(`${API_URL}/api/products/${inlineEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Failed to save');
      setMessage({ type: 'success', text: `Updated ${inlineEdit.field === 'stockQuantity' ? 'stock' : inlineEdit.field}.` });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save inline change.' });
      fetchProducts(); // revert on failure
    }
  }

  function cancelInline() { setInlineEdit(null); }

  function openEdit(product: Product) {
    setForm({
      name: product.name ?? '',
      description: product.description ?? '',
      price: String(product.price ?? 0),
      category: product.category ?? '',
      stockQuantity: String(product.stockQuantity ?? 0),
      imageUrl: product.imageUrl ?? '',
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;

  return (
    <AdminLayout activePage="products">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#3E2723]">Product Management</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click price, stock or category to edit inline</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setClearAllConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete all products from the table"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-medium hover:bg-[#B71C1C] transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto text-current opacity-50 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* ── Add / Edit Modal ─────────────────────────────────────────── */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="text-lg font-bold text-[#3E2723]">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">

                {/* Image section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                      {form.imageUrl ? (
                        <img src={form.imageUrl} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                          <ImageIcon className="w-7 h-7" />
                          <span className="text-[8px] mt-0.5 font-medium">NO IMAGE</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={handleImageSelect}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors disabled:opacity-50 w-full justify-center"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : form.imageUrl ? 'Replace Image' : 'Upload Image'}
                      </button>
                      {form.imageUrl && (
                        <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))} className="mt-1.5 text-xs text-red-500 hover:text-red-700 w-full text-center">
                          Remove image
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825] h-20 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input type="number" min="0" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-medium hover:bg-[#B71C1C]">{editingId ? 'Save Changes' : 'Create Product'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete Confirm ───────────────────────────────────────────── */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#3E2723] mb-2">Delete Product?</h3>
              <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Clear All Confirm ────────────────────────────────────────── */}
        {clearAllConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#3E2723] mb-2">Clear All Products?</h3>
              <p className="text-sm text-gray-500 mb-1">This will permanently delete <strong>all {products.length} products</strong> from the database.</p>
              <p className="text-xs text-red-500 mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setClearAllConfirm(false)} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleClearAll} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Yes, Clear All</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Product Table ────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                  Category <span className="text-gray-300 font-normal normal-case">(click to edit)</span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Price <span className="text-gray-300 font-normal normal-case">(click)</span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                  Stock <span className="text-gray-300 font-normal normal-case">(click)</span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(product => {
                const isInlinePrice = inlineEdit?.id === product.id && inlineEdit.field === 'price';
                const isInlineQty = inlineEdit?.id === product.id && inlineEdit.field === 'stockQuantity';
                const isInlineCat = inlineEdit?.id === product.id && inlineEdit.field === 'category';

                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">

                    {/* Product name + image */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.imageUrl
                            ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#3E2723] truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">#{product.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category — inline edit */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {isInlineCat ? (
                        <select
                          ref={el => { inlineRef.current = el; }}
                          value={inlineEdit.value}
                          onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                          onBlur={saveInline}
                          onKeyDown={e => { if (e.key === 'Enter') saveInline(); if (e.key === 'Escape') cancelInline(); }}
                          className="text-sm border border-[#F9A825] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#F9A825] bg-white"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <button
                          onClick={() => startInline(product.id, 'category', product.category)}
                          className="text-sm text-gray-600 hover:text-[#D32F2F] hover:bg-red-50 px-2 py-1 rounded-lg transition-colors group flex items-center gap-1"
                          title="Click to edit category"
                        >
                          {product.category}
                          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-40" />
                        </button>
                      )}
                    </td>

                    {/* Price — inline edit */}
                    <td className="px-4 py-3 text-right">
                      {isInlinePrice ? (
                        <input
                          ref={el => { inlineRef.current = el; }}
                          type="number"
                          step="0.01"
                          min="0"
                          value={inlineEdit.value}
                          onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                          onBlur={saveInline}
                          onKeyDown={e => { if (e.key === 'Enter') saveInline(); if (e.key === 'Escape') cancelInline(); }}
                          className="w-20 text-sm text-right border border-[#F9A825] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                        />
                      ) : (
                        <button
                          onClick={() => startInline(product.id, 'price', String(product.price ?? 0))}
                          className="text-sm font-medium text-[#3E2723] hover:text-[#D32F2F] hover:bg-red-50 px-2 py-1 rounded-lg transition-colors group inline-flex items-center gap-1"
                          title="Click to edit price"
                        >
                          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-40" />
                          ${Number(product.price ?? 0).toFixed(2)}
                        </button>
                      )}
                    </td>

                    {/* Stock Qty — inline edit */}
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      {isInlineQty ? (
                        <input
                          ref={el => { inlineRef.current = el; }}
                          type="number"
                          min="0"
                          value={inlineEdit.value}
                          onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                          onBlur={saveInline}
                          onKeyDown={e => { if (e.key === 'Enter') saveInline(); if (e.key === 'Escape') cancelInline(); }}
                          className="w-16 text-sm text-right border border-[#F9A825] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                        />
                      ) : (
                        <button
                          onClick={() => startInline(product.id, 'stockQuantity', String(product.stockQuantity ?? 0))}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors group inline-flex items-center gap-1 hover:opacity-80 ${
                            (product.stockQuantity ?? 0) > 50 ? 'bg-green-50 text-green-700' :
                            (product.stockQuantity ?? 0) > 0  ? 'bg-amber-50 text-amber-700' :
                                                                'bg-red-50 text-red-700'
                          }`}
                          title="Click to edit stock"
                        >
                          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60" />
                          {product.stockQuantity ?? 0}
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit product details & image">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete product">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
