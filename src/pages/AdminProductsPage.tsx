import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Package, Upload, Image as ImageIcon, Lock, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

const CATEGORIES = ['Noodles', 'Condiments', 'Soups & Mixes', 'Canned Goods', 'Snacks', 'Dairy', 'Beverages', 'Frozen', 'Rice & Grains', 'Sweets', 'Dried Fish'];

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  imageUrl: string;
  category: string;
  stockQuantity: number;
  isPublished: boolean;
  recommendedRetail: number | null;
  margin: number | null; // fraction, e.g. 0.27 = 27%
}

// Category, Cost, Recommended Retail and Margin are supplier-sourced facts, not something an
// admin should casually overwrite after the fact — only Price and Stock get quick inline edits.
type InlineField = 'price' | 'stockQuantity';

interface InlineEdit {
  id: number;
  field: InlineField;
  value: string;
}

const EMPTY_FORM = { name: '', description: '', price: '', costPrice: '', category: '', stockQuantity: '', imageUrl: '', isPublished: false, recommendedRetail: '', margin: '' };

// Reads a failed fetch Response and returns a human-readable message.
// Handles both { message: "..." } and FluentValidation's
// { errors: { FieldName: ["msg1", "msg2"] } } shapes.
async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const err = await res.json();
    if (err.message) return err.message;
    if (err.errors) {
      const messages = Object.values(err.errors).flat();
      if (messages.length) return messages.join(' ');
    }
    if (err.title) return err.title;
  } catch { /* body wasn't JSON */ }
  return fallback;
}

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

  // Focus inline input when it appears — only on the initial mount of an edit
  // session (id/field), not on every keystroke, otherwise re-selecting the
  // whole value on each change makes typing impossible.
  useEffect(() => {
    if (inlineEdit && inlineRef.current) {
      inlineRef.current.focus();
      if (inlineRef.current instanceof HTMLInputElement) inlineRef.current.select();
    }
  }, [inlineEdit?.id, inlineEdit?.field]);

  async function fetchProducts() {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/products/admin?limit=200`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
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
      costPrice: parseFloat(form.costPrice) || 0,
      category: form.category,
      stockQuantity: parseInt(form.stockQuantity) || 0,
      imageUrl: form.imageUrl,
      isPublished: form.isPublished,
      recommendedRetail: form.recommendedRetail === '' ? null : parseFloat(form.recommendedRetail) || 0,
      margin: form.margin === '' ? null : (parseFloat(form.margin) || 0) / 100,
    };

    try {
      const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to save product.'));
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
      costPrice: product.costPrice ?? 0,
      stockQuantity: inlineEdit.field === 'stockQuantity' ? parseInt(inlineEdit.value, 10) || (product.stockQuantity ?? 0) : (product.stockQuantity ?? 0),
      category: product.category ?? '',
      isPublished: product.isPublished ?? false,
      recommendedRetail: product.recommendedRetail,
      margin: product.margin,
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
      if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to save inline change.'));
      setMessage({ type: 'success', text: `Updated ${inlineEdit.field === 'stockQuantity' ? 'stock' : inlineEdit.field}.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save inline change.' });
      fetchProducts(); // revert on failure
    }
  }

  function cancelInline() { setInlineEdit(null); }

  // ── Publish toggle ───────────────────────────────────────────────────────────
  async function togglePublish(product: Product) {
    if (!user) return;
    const nextPublished = !product.isPublished;

    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isPublished: nextPublished } : p));

    try {
      const res = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({
          name: product.name ?? '',
          description: product.description ?? '',
          imageUrl: product.imageUrl ?? '',
          price: product.price ?? 0,
          costPrice: product.costPrice ?? 0,
          stockQuantity: product.stockQuantity ?? 0,
          category: product.category ?? '',
          isPublished: nextPublished,
          recommendedRetail: product.recommendedRetail,
          margin: product.margin,
        }),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to update publish status.'));
      setMessage({ type: 'success', text: nextPublished ? `${product.name} published.` : `${product.name} unpublished.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update publish status.' });
      fetchProducts(); // revert on failure
    }
  }

  function openEdit(product: Product) {
    setForm({
      name: product.name ?? '',
      description: product.description ?? '',
      price: String(product.price ?? 0),
      costPrice: String(product.costPrice ?? 0),
      category: product.category ?? '',
      stockQuantity: String(product.stockQuantity ?? 0),
      imageUrl: product.imageUrl ?? '',
      isPublished: product.isPublished ?? false,
      recommendedRetail: product.recommendedRetail === null || product.recommendedRetail === undefined ? '' : String(product.recommendedRetail),
      margin: product.margin === null || product.margin === undefined ? '' : String(Math.round(product.margin * 1000) / 10),
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
            <p className="text-xs text-gray-400 mt-0.5">Click price or stock to edit inline. Category, cost, recommended retail and margin come from supplier data and are locked once a product exists.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled
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
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#3E2723] to-[#4A332E] rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    {editingId ? <Pencil className="w-4 h-4 text-[#F9A825]" /> : <Plus className="w-5 h-5 text-[#F9A825]" />}
                  </div>
                  <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                </div>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/60 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-5">

                {/* Identity: image + name + description */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      {form.imageUrl ? (
                        <img src={form.imageUrl} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                          <ImageIcon className="w-7 h-7" />
                          <span className="text-[8px] mt-0.5 font-medium">NO IMAGE</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleImageSelect}
                      disabled={uploading}
                      className="mt-2 w-20 flex flex-col items-center gap-0.5 text-[#D32F2F] hover:text-[#B71C1C] transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium leading-tight text-center">{uploading ? 'Uploading...' : form.imageUrl ? 'Replace' : 'Upload'}</span>
                    </button>
                    {form.imageUrl && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))} className="w-20 text-[10px] text-gray-400 hover:text-red-500 text-center block">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="w-full px-3 py-2 text-base font-semibold text-[#3E2723] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required />
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825] h-16 resize-none" />
                  </div>
                </div>

                {/* What admin can actually change — the visual focus of this form */}
                <div className="rounded-xl border-2 border-[#D32F2F]/25 bg-[#D32F2F]/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-[#D32F2F] flex items-center justify-center flex-shrink-0">
                      <Pencil className="w-3 h-3 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-[#3E2723]">Your Price &amp; Stock</h4>
                    <span className="ml-auto text-[10px] font-semibold text-[#D32F2F] bg-white px-2 py-0.5 rounded-full border border-[#D32F2F]/20">EDITABLE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Selling Price ($)</label>
                      <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 text-lg font-bold text-[#3E2723] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Stock Quantity</label>
                      <input type="number" min="0" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} className="w-full px-3 py-2 text-lg font-bold text-[#3E2723] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required />
                    </div>
                  </div>
                </div>

                {/* Supplier-sourced facts — locked once the product exists, editable only at creation */}
                {editingId ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                      <h4 className="text-sm font-bold text-gray-500">Supplier Data</h4>
                      <span className="ml-auto text-[10px] font-semibold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">LOCKED</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1"><Tag className="w-2.5 h-2.5" /> Category</p>
                        <p className="text-sm font-medium text-gray-600 mt-0.5">{form.category || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Cost Price</p>
                        <p className="text-sm font-medium text-gray-600 mt-0.5">${(parseFloat(form.costPrice) || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Recommended Retail</p>
                        <p className="text-sm font-medium text-gray-600 mt-0.5">{form.recommendedRetail ? `$${(parseFloat(form.recommendedRetail) || 0).toFixed(2)}` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Margin</p>
                        <p className="text-sm font-medium text-gray-600 mt-0.5">{form.margin ? `${(parseFloat(form.margin) || 0).toFixed(1)}%` : '—'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 p-4">
                    <h4 className="text-sm font-bold text-gray-600 mb-3">Sourcing Details <span className="font-normal text-gray-400">(optional, sets the basis for future imports)</span></h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Cost Price ($)</label>
                        <input type="number" step="0.01" min="0" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required>
                          <option value="">Select category</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Recommended Retail ($)</label>
                        <input type="number" step="0.01" min="0" value={form.recommendedRetail} onChange={e => setForm({ ...form, recommendedRetail: e.target.value })} placeholder="Optional" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Margin (%)</label>
                        <input type="number" step="0.1" min="0" value={form.margin} onChange={e => setForm({ ...form, margin: e.target.value })} placeholder="Optional" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" />
                      </div>
                    </div>
                  </div>
                )}

                <label className="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Published</p>
                    <p className="text-xs text-gray-400">Visible on the live storefront</p>
                  </div>
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-[#D32F2F] focus:ring-[#F9A825]" />
                </label>
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

        {/* ── Product Table (sm and up) ────────────────────────────────── */}
        <div className="hidden sm:block bg-white rounded-xl shadow-sm border overflow-auto max-h-[75vh]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                  Category <span className="text-gray-300 font-normal normal-case">(click to edit)</span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                  Cost <span className="text-gray-300 font-normal normal-case">(click)</span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Price <span className="text-gray-300 font-normal normal-case">(click)</span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden xl:table-cell whitespace-nowrap">
                  Rec. Retail
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden xl:table-cell">
                  Margin
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                  Stock <span className="text-gray-300 font-normal normal-case">(click)</span>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Published</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(product => {
                const isInlinePrice = inlineEdit?.id === product.id && inlineEdit.field === 'price';
                const isInlineQty = inlineEdit?.id === product.id && inlineEdit.field === 'stockQuantity';

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

                    {/* Category — locked, from supplier data */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-500" title="From supplier data — locked">{product.category}</span>
                    </td>

                    {/* Cost Price — locked, from supplier data */}
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className="text-sm text-gray-500" title="From supplier data — locked, never shown to customers">
                        ${Number(product.costPrice ?? 0).toFixed(2)}
                      </span>
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

                    {/* Recommended Retail — view only, edit via the modal */}
                    <td className="px-4 py-3 text-right hidden xl:table-cell text-sm text-gray-500">
                      {product.recommendedRetail === null || product.recommendedRetail === undefined ? '—' : `$${Number(product.recommendedRetail).toFixed(2)}`}
                    </td>

                    {/* Margin — view only, edit via the modal */}
                    <td className="px-4 py-3 text-right hidden xl:table-cell text-sm text-gray-500">
                      {product.margin === null || product.margin === undefined ? '—' : `${(Number(product.margin) * 100).toFixed(1)}%`}
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

                    {/* Published toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePublish(product)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          product.isPublished
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={product.isPublished ? 'Click to unpublish' : 'Click to publish to the live storefront'}
                      >
                        {product.isPublished ? 'Published' : 'Draft'}
                      </button>
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

        {/* ── Product Cards (mobile only) ──────────────────────────────── */}
        <div className="sm:hidden bg-white rounded-xl shadow-sm border divide-y max-h-[75vh] overflow-y-auto">
          {products.map(product => {
            const isInlinePrice = inlineEdit?.id === product.id && inlineEdit.field === 'price';
            const isInlineQty = inlineEdit?.id === product.id && inlineEdit.field === 'stockQuantity';
            const hasRefFigures = (product.recommendedRetail !== null && product.recommendedRetail !== undefined) || (product.margin !== null && product.margin !== undefined);

            return (
              <div key={product.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#3E2723] truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">#{product.id}</p>
                  </div>
                  <button
                    onClick={() => togglePublish(product)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      product.isPublished ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={product.isPublished ? 'Tap to unpublish' : 'Tap to publish to the live storefront'}
                  >
                    {product.isPublished ? 'Published' : 'Draft'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* Category — locked, from supplier data */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Category</p>
                    <p className="text-sm text-gray-500 px-2 py-1.5 truncate" title="From supplier data — locked">{product.category}</p>
                  </div>

                  {/* Stock — tap to edit */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Stock</p>
                    {isInlineQty ? (
                      <input
                        ref={el => { inlineRef.current = el; }}
                        type="number"
                        min="0"
                        value={inlineEdit.value}
                        onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                        onBlur={saveInline}
                        onKeyDown={e => { if (e.key === 'Enter') saveInline(); if (e.key === 'Escape') cancelInline(); }}
                        className="w-full text-sm border border-[#F9A825] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                      />
                    ) : (
                      <button
                        onClick={() => startInline(product.id, 'stockQuantity', String(product.stockQuantity ?? 0))}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80 ${
                          (product.stockQuantity ?? 0) > 50 ? 'bg-green-50 text-green-700' :
                          (product.stockQuantity ?? 0) > 0  ? 'bg-amber-50 text-amber-700' :
                                                              'bg-red-50 text-red-700'
                        }`}
                      >
                        {product.stockQuantity ?? 0}
                      </button>
                    )}
                  </div>

                  {/* Cost — locked, from supplier data */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Cost</p>
                    <p className="text-sm text-gray-500 px-2 py-1.5" title="From supplier data — locked, never shown to customers">${Number(product.costPrice ?? 0).toFixed(2)}</p>
                  </div>

                  {/* Price — tap to edit */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Price</p>
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
                        className="w-full text-sm border border-[#F9A825] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                      />
                    ) : (
                      <button onClick={() => startInline(product.id, 'price', String(product.price ?? 0))} className="w-full text-left text-sm font-semibold text-[#3E2723] px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        ${Number(product.price ?? 0).toFixed(2)}
                      </button>
                    )}
                  </div>
                </div>

                {hasRefFigures && (
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    {product.recommendedRetail !== null && product.recommendedRetail !== undefined && (
                      <span>Rec. Retail ${Number(product.recommendedRetail).toFixed(2)}</span>
                    )}
                    {product.margin !== null && product.margin !== undefined && (
                      <span>Margin {(Number(product.margin) * 100).toFixed(1)}%</span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => openEdit(product)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(product.id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
