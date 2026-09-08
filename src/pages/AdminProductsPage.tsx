import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, AlertTriangle, Package, Upload, Image as ImageIcon, Lock, Tag, Search, ClipboardList, Store, Boxes } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';
import { ProductBatchesModal } from '../components/ProductBatchesModal';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

const CATEGORIES = ['Noodles', 'Condiments', 'Soups & Mixes', 'Canned Goods', 'Snacks', 'Dairy', 'Beverages', 'Frozen', 'Rice & Grains', 'Dried Fish'];

const GST_RATE = 0.15;

// Price-mismatch "Ignore" is remembered per-browser (same pattern as the Newsletter/Pasabuy
// unseen badges) — no backend change needed. Stores the exact price/recommendedRetail pair
// at the time it was ignored, so if either number changes later (new margin, new invoice),
// that's treated as a genuinely new situation and gets flagged again automatically.
const IGNORE_KEY = 'pp_admin_price_review_ignored';

interface IgnoredMismatch {
  price: number;
  recommendedRetail: number;
}

function loadIgnoredMismatches(): Record<number, IgnoredMismatch> {
  try {
    return JSON.parse(localStorage.getItem(IGNORE_KEY) || '{}');
  } catch {
    return {};
  }
}

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
  code: string | null;
  qty: number | null; // pack size the Subtotal covers, e.g. 18 units/carton
  subtotal: number | null; // locked supplier invoice line amount
  latestBatchCostPrice: number | null; // most recently added batch's cost, even if not selling yet
  profitAmount: number; // computed from the actual Price, not recommendedRetail
  gstAmount: number;
  gstRate: number;
}

// Category, Margin and Qty are admin-editable any time; Code/Subtotal are locked reference
// data from the supplier invoice; Cost Price is derived from Subtotal/Qty when both are set.
// Only Price and Stock get quick inline edits from the table.
type InlineField = 'price';

interface InlineEdit {
  id: number;
  field: InlineField;
  value: string;
}

const EMPTY_FORM = { name: '', description: '', price: '', category: '', imageUrl: '', isPublished: false, margin: '', code: '' };

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
  const [managingBatches, setManagingBatches] = useState<Product | null>(null);
  const [lowPriceConfirm, setLowPriceConfirm] = useState(false);
  // Store Price defaults to (and keeps following) the live Recommended Retail every time the
  // modal opens, for any product — reset to false on every open, regardless of whether it
  // already had a saved price. Typing directly into Store Price flips this off immediately,
  // making it independent for the rest of this session.
  const [priceOverridden, setPriceOverridden] = useState(false);
  const [pricingTab, setPricingTab] = useState<'supplier' | 'store'>('supplier');
  const [search, setSearch] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [ignoredMismatches, setIgnoredMismatches] = useState<Record<number, IgnoredMismatch>>(() => loadIgnoredMismatches());

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
  // Gate: block a blank/zero price outright (this is what the website actually charges
  // customers); if it's positive but doesn't cover cost, require an explicit confirmation
  // instead of silently saving a loss-making price.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceValue = parseFloat(form.price) || 0;

    if (priceValue <= 0) {
      setMessage({ type: 'error', text: 'Selling Price is required and must be greater than $0 — this is the price customers actually pay on the website.' });
      return;
    }
    if (priceBelowCost) {
      setLowPriceConfirm(true);
      return;
    }
    submitProduct();
  }

  async function submitProduct() {
    if (!user) return;
    setMessage(null);
    setLowPriceConfirm(false);

    const body = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      category: form.category,
      imageUrl: form.imageUrl,
      isPublished: form.isPublished,
      margin: form.margin === '' ? null : (parseFloat(form.margin) || 0) / 100,
      code: form.code || null,
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
      price: parseFloat(inlineEdit.value) || (product.price ?? 0),
      category: product.category ?? '',
      isPublished: product.isPublished ?? false,
      margin: product.margin,
      code: product.code,
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
      setMessage({ type: 'success', text: 'Updated price.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save inline change.' });
      fetchProducts(); // revert on failure
    }
  }

  function cancelInline() { setInlineEdit(null); }

  // ── Store Review: ignore a price mismatch (per-browser, see IGNORE_KEY above) ──
  function ignoreMismatch(product: Product) {
    const next = { ...ignoredMismatches, [product.id]: { price: product.price, recommendedRetail: product.recommendedRetail ?? 0 } };
    setIgnoredMismatches(next);
    localStorage.setItem(IGNORE_KEY, JSON.stringify(next));
  }

  function unignoreMismatch(productId: number) {
    const next = { ...ignoredMismatches };
    delete next[productId];
    setIgnoredMismatches(next);
    localStorage.setItem(IGNORE_KEY, JSON.stringify(next));
  }

  // ── Store Review: one-click "match recommended" ─────────────────────────────
  async function applyRecommendedPrice(product: Product) {
    if (!user || product.recommendedRetail === null || product.recommendedRetail === undefined) return;
    const newPrice = product.recommendedRetail;

    const updated = {
      name: product.name ?? '',
      description: product.description ?? '',
      imageUrl: product.imageUrl ?? '',
      price: newPrice,
      category: product.category ?? '',
      isPublished: product.isPublished ?? false,
      margin: product.margin,
      code: product.code,
    };

    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: newPrice } : p));

    try {
      const res = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to update price.'));
      setMessage({ type: 'success', text: `${product.name} — Store Price set to recommended.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update price.' });
      fetchProducts(); // revert on failure
    }
  }

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
          category: product.category ?? '',
          isPublished: nextPublished,
          margin: product.margin,
          code: product.code,
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
      category: product.category ?? '',
      imageUrl: product.imageUrl ?? '',
      isPublished: product.isPublished ?? false,
      margin: product.margin === null || product.margin === undefined ? '' : String(Math.round(product.margin * 1000) / 10),
      code: product.code ?? '',
    });
    setEditingId(product.id);
    setShowForm(true);
    setPriceOverridden(false);
    setPricingTab('supplier');
  }

  function openAdd() {
    // Only wipe the form if we're coming from an edit session (another product's data is
    // sitting in there) — resuming a create session that was just closed (Esc/backdrop/X,
    // not explicitly cleared) should keep whatever was already typed.
    if (editingId !== null) setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setPriceOverridden(false);
    setPricingTab('supplier');
  }

  // Hides the modal without discarding in-progress input — only wipes the form if we were
  // editing an existing product (that data shouldn't leak into the next "Add Product" open).
  function closeModal() {
    if (editingId !== null) setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  // Esc closes the modal the same way as the X button / backdrop click.
  useEffect(() => {
    if (!showForm) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showForm, editingId]);

  // Live pricing preview — mirrors PricingCalculator.cs exactly, purely for instant UX feedback.
  // The server recomputes RecommendedRetail authoritatively on save regardless of this preview.
  // Cost Price itself is no longer form input — it's whatever the product's current
  // batch-synced cost is (0 for a brand-new product with no batches yet).
  const effectiveCostPrice = editingId ? (products.find(p => p.id === editingId)?.costPrice ?? 0) : 0;
  // Only worth surfacing when it's a real heads-up — i.e. a newer batch exists at a different
  // cost than what's currently selling. Same value (or no second batch yet) shows nothing.
  const latestBatchCostPrice = editingId ? (products.find(p => p.id === editingId)?.latestBatchCostPrice ?? null) : null;
  const upcomingCostChange = latestBatchCostPrice !== null && latestBatchCostPrice !== effectiveCostPrice ? latestBatchCostPrice : null;
  const parsedMarginPct = form.margin === '' ? null : parseFloat(form.margin);
  const recommendedPricePreview = (parsedMarginPct !== null && parsedMarginPct < 100)
    ? (effectiveCostPrice / (1 - parsedMarginPct / 100)) / (1 - GST_RATE)
    : null;
  const currentPrice = parseFloat(form.price) || 0;
  const priceBreakdown = currentPrice > 0
    ? { profitAmount: currentPrice * (1 - GST_RATE) - effectiveCostPrice, gstAmount: currentPrice * GST_RATE }
    : null;
  const priceIsMissing = form.price !== '' && currentPrice <= 0;
  // Compare against the GST-EXCLUSIVE price, not the raw sticker price — GST is money owed
  // to the government, not revenue, so a price can look "above cost" and still be a real
  // loss once GST is removed (e.g. $2.10 price, $2.00 cost: GST-exclusive is only $1.785).
  const priceBelowCost = currentPrice > 0 && effectiveCostPrice > 0 && (currentPrice * (1 - GST_RATE)) <= effectiveCostPrice;
  // Within a cent either side of zero counts as break-even, not a "loss" — rounding to the
  // cent means the true math break-even price is rarely representable exactly.
  const priceIsBreakeven = priceBelowCost && priceBreakdown !== null && Math.abs(priceBreakdown.profitAmount) < 0.01;

  // Keep Store Price in sync with the live Recommended Retail (opening the modal, and any
  // Margin change) until the admin types directly into Store Price themselves.
  useEffect(() => {
    if (!priceOverridden && recommendedPricePreview !== null && recommendedPricePreview > 0) {
      setForm(f => ({ ...f, price: recommendedPricePreview.toFixed(2) }));
    }
  }, [recommendedPricePreview, priceOverridden]);

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;

  const searchTerm = search.trim().toLowerCase();
  const filteredProducts = searchTerm === ''
    ? products
    : products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.code ?? '').toLowerCase().includes(searchTerm)
      );

  // ── Store Review data ───────────────────────────────────────────────────
  // Price mismatches: Store Price differs meaningfully (1+ cent) from the computed
  // Recommended Retail. Status is based on the GST-exclusive price vs Cost, same rule as the
  // edit modal's trap — "below recommended" isn't necessarily a problem, "below cost" is.
  function isCurrentlyIgnored(p: Product): boolean {
    const ignored = ignoredMismatches[p.id];
    return !!ignored && Math.abs(ignored.price - p.price) < 0.001 && Math.abs(ignored.recommendedRetail - (p.recommendedRetail ?? 0)) < 0.001;
  }

  const allMismatches = products
    .filter(p => p.recommendedRetail !== null && Math.abs(p.price - p.recommendedRetail) >= 0.01)
    .map(p => {
      const priceBeforeGst = p.price * (1 - GST_RATE);
      const profitAmount = priceBeforeGst - p.costPrice;
      const isLoss = profitAmount < -0.005;
      const isBreakeven = Math.abs(profitAmount) < 0.01;
      return { product: p, profitAmount, isLoss, isBreakeven };
    })
    .sort((a, b) => (a.isLoss === b.isLoss ? 0 : a.isLoss ? -1 : 1));

  const priceMismatches = allMismatches.filter(m => !isCurrentlyIgnored(m.product));
  const ignoredMismatchList = allMismatches.filter(m => isCurrentlyIgnored(m.product));

  const lowStockProducts = products
    .filter(p => p.stockQuantity <= 5)
    .sort((a, b) => a.stockQuantity - b.stockQuantity);

  return (
    <AdminLayout activePage="products">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#3E2723]">Product Management</h2>
          <p className="text-xs text-gray-400 mt-0.5">Click price to edit inline. Click stock to manage batches — cost, quantity, and Recommended Retail are all tracked per batch and update automatically as stock sells through.</p>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="max-w-md w-full">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by product name or code..."
                className="w-full pl-10 pr-9 py-2.5 border-2 border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825]/40 focus:border-[#F9A825] transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {search && (
              <p className="mt-1.5 text-xs text-gray-400">
                {filteredProducts.length} of {products.length} product{products.length === 1 ? '' : 's'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowReview(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium whitespace-nowrap hover:border-[#F9A825] hover:text-[#3E2723] hover:bg-amber-50 transition-colors relative"
              title="Check price mismatches and low stock in one place"
            >
              <ClipboardList className="w-4 h-4" /> Store Review
              {(priceMismatches.length + lowStockProducts.length) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D32F2F] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {priceMismatches.length + lowStockProducts.length}
                </span>
              )}
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-medium whitespace-nowrap hover:bg-[#B71C1C] transition-colors shadow-sm">
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#3E2723] to-[#4A332E] shadow-md flex-shrink-0 z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    {editingId ? <Pencil className="w-4 h-4 text-[#F9A825]" /> : <Plus className="w-5 h-5 text-[#F9A825]" />}
                  </div>
                  <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                </div>
                <button onClick={closeModal} className="text-white/60 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto">

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

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    <h4 className="text-sm font-bold text-gray-600">Category</h4>
                  </div>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Tabs instead of stacking both panels — the combined height made the Store
                    panel a long scroll away, especially annoying for a quick price/stock edit.
                    Segmented-control styling (light track + raised active pill) so the two
                    tabs are unmistakably there, not just a thin underline easy to miss. */}
                <div className="flex gap-1 p-1 bg-gray-100 border border-gray-200 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPricingTab('supplier')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      pricingTab === 'supplier' ? 'bg-white text-amber-700 border border-amber-300 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Supplier
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingTab('store')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      pricingTab === 'store' ? 'bg-white text-blue-700 border border-blue-300 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" /> Store
                    {(priceIsMissing || priceBelowCost) && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </button>
                </div>

                {/* Supplier tab is now just the product code — cost, quantity, and per-batch
                    subtotal all live on Batches (opened after saving), not here. Margin and
                    Recommended Retail moved to the Store tab since they're a store pricing
                    decision, not a fact from the supplier invoice. */}
                {pricingTab === 'supplier' && (
                <div className="rounded-xl border-2 border-amber-400/60 bg-amber-50/60 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide">Supplier</h4>
                  </div>
                  <p className="text-[11px] text-amber-700/80 mb-3">
                    Cost, quantity, and per-shipment subtotal are all tracked per batch now — use the Batches button after saving. This is just the supplier's own product code, for matching future invoices to this product.
                  </p>

                  <div>
                    <label className="block text-xs font-medium text-amber-700/80 mb-1 flex items-center gap-1">
                      {editingId && <Lock className="w-2.5 h-2.5" />} Supplier Code {!editingId && '(optional)'}
                    </label>
                    {editingId ? (
                      <>
                        <p className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white/70 text-sm font-medium text-gray-600">
                          {form.code || '—'}
                        </p>
                        <p className="mt-1 text-[10px] text-amber-700/70">Locked once a product exists — changing it would break matching future invoices to this product.</p>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={form.code}
                          onChange={e => setForm({ ...form, code: e.target.value })}
                          placeholder="e.g. UFC-0001-018"
                          className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <p className="mt-1 text-[10px] text-amber-700/70">Leave blank and one auto-generates. Locked after saving.</p>
                      </>
                    )}
                  </div>
                </div>
                )}

                {/* Store-facing numbers — safe to edit freely, day to day. Stock itself is
                    read-only here; it's only ever changed via the Batches modal. */}
                {pricingTab === 'store' && (
                <div className="rounded-xl border-2 border-blue-300/60 bg-blue-50/40 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide">Store — Live</h4>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-blue-700/80 mb-1">Stock</label>
                    <p className="text-sm text-blue-900/80 bg-white border border-blue-200 rounded-lg px-3 py-2">
                      {editingId
                        ? `${products.find(p => p.id === editingId)?.stockQuantity ?? 0} on hand — managed via batches, not edited here.`
                        : 'Starts at 0 — add a batch after saving to bring in stock.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-blue-700/80 mb-1 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Cost Price ($)
                      </label>
                      <p className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white/70 text-sm font-medium text-gray-600">
                        {effectiveCostPrice > 0 ? `$${effectiveCostPrice.toFixed(2)}` : '—'}
                      </p>
                      <p className="mt-1 text-[10px] text-blue-700/70">From the batch currently selling — see Batches</p>
                      {upcomingCostChange !== null && (
                        <p className="mt-1 text-[10px] font-medium text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Latest batch cost: ${upcomingCostChange.toFixed(2)} — takes effect once current stock sells out
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-700/80 mb-1">Profit Margin</label>
                      <input type="number" step="0.1" min="0" max="99" value={form.margin} onChange={e => setForm({ ...form, margin: e.target.value })} placeholder="e.g. 20" className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <p className="mt-1 text-[10px] text-blue-700/70">Whole % — 20 means 20%. GST (15%) added automatically.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-blue-700/80 mb-1 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Recommended Retail
                    </label>
                    <p className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white/70 text-sm font-medium text-gray-600">
                      {recommendedPricePreview !== null ? `$${recommendedPricePreview.toFixed(2)}` : '—'}
                    </p>
                    <p className="mt-1 text-[10px] text-blue-700/70">Auto: Cost + Margin + GST</p>
                  </div>

                  {/* The one thing this whole form exists to set — the actual price customers pay. */}
                  <div className="rounded-xl border-2 border-[#D32F2F]/25 bg-[#D32F2F]/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-[#D32F2F] flex items-center justify-center flex-shrink-0">
                        <Pencil className="w-3 h-3 text-white" />
                      </div>
                      <h4 className="text-sm font-bold text-[#3E2723]">Store Price</h4>
                      <span className="ml-auto text-[10px] font-semibold text-[#D32F2F] bg-white px-2 py-0.5 rounded-full border border-[#D32F2F]/20">EDITABLE</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Selling Price ($)</label>
                        <input
                          type="number" step="0.01" min="0" value={form.price}
                          onChange={e => { setForm({ ...form, price: e.target.value }); setPriceOverridden(true); }}
                          className={`w-full px-3 py-2 text-lg font-bold text-[#3E2723] bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                            priceIsMissing || priceBelowCost ? 'border-red-400 focus:ring-red-300' : 'focus:ring-[#F9A825]'
                          }`}
                          required
                        />
                      </div>
                      {recommendedPricePreview !== null && (
                        <button type="button" onClick={() => setForm(f => ({ ...f, price: recommendedPricePreview!.toFixed(2) }))} className="mb-0.5 px-3 py-2 text-xs font-medium text-[#D32F2F] border border-[#D32F2F]/30 rounded-lg hover:bg-white whitespace-nowrap">
                          Use recommended
                        </button>
                      )}
                    </div>
                    {priceBelowCost && (
                      <p className="mt-2 text-xs font-medium text-red-600 flex items-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {priceIsBreakeven
                          ? `This price ($${currentPrice.toFixed(2)}) is break-even after GST — no profit, but no loss either.`
                          : `This price ($${currentPrice.toFixed(2)}) loses $${Math.abs(priceBreakdown!.profitAmount).toFixed(2)} per sale after GST (cost $${effectiveCostPrice.toFixed(2)}).`}
                      </p>
                    )}
                    {!priceBelowCost && priceBreakdown && (
                      <p className="mt-2 text-xs text-gray-500">
                        Actual profit ${priceBreakdown.profitAmount.toFixed(2)}, GST ${priceBreakdown.gstAmount.toFixed(2)} (15%) at this price
                      </p>
                    )}
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
                {!editingId && (
                  <button type="button" onClick={() => setForm(EMPTY_FORM)} className="text-xs font-medium text-gray-400 hover:text-red-500 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear all fields
                  </button>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
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

        {/* ── Batches ──────────────────────────────────────────────────── */}
        {managingBatches && (
          <ProductBatchesModal
            productId={managingBatches.id}
            productName={managingBatches.name}
            onClose={() => setManagingBatches(null)}
            onBatchesChange={(stock) => {
              // Adding/removing a batch also changes CostPrice and RecommendedRetail server-
              // side (FIFO-synced) — a full refetch keeps those in sync too, not just stock,
              // so Edit shows the real numbers immediately instead of stale cached ones.
              fetchProducts();
              setManagingBatches(prev => (prev ? { ...prev, stockQuantity: stock } : prev));
            }}
          />
        )}

        {/* ── Clear All Confirm ────────────────────────────────────────── */}
        {/* ── Low/No-Profit Price Confirm ─────────────────────────────── */}
        {lowPriceConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#3E2723] mb-2">
                {priceIsBreakeven ? 'This price is break-even' : "Are you sure? This price loses money"}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                After GST, Selling Price <strong>${currentPrice.toFixed(2)}</strong> nets <strong>${(currentPrice * (1 - GST_RATE)).toFixed(2)}</strong> against Cost Price <strong>${effectiveCostPrice.toFixed(2)}</strong>
                {priceIsBreakeven ? ' — exactly covering cost, no profit.' : `, a loss of $${Math.abs(priceBreakdown!.profitAmount).toFixed(2)} per sale.`}
              </p>
              <p className="text-xs text-gray-400 mb-5">GST isn't revenue — it's owed to the government, so it's removed before comparing against cost.</p>
              <div className="flex gap-3">
                <button onClick={() => setLowPriceConfirm(false)} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Go Back &amp; Fix</button>
                <button onClick={submitProduct} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Save Anyway</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Store Review ────────────────────────────────────────────── */}
        {showReview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReview(false)}>
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
                <h3 className="text-lg font-bold text-[#3E2723] flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" /> Store Review
                </h3>
                <button onClick={() => setShowReview(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-4 space-y-6">
                {/* Price mismatches */}
                <div>
                  <h4 className="text-sm font-semibold text-[#3E2723] mb-1">
                    Store Price vs Recommended ({priceMismatches.length})
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">
                    Store Price doesn't match Recommended Retail. Not always a problem — only flagged red when it's actually below cost after GST.
                    {ignoredMismatchList.length > 0 && ` Ignored items still show below — the (${priceMismatches.length}) count and the Store Review badge just skip them.`}
                  </p>
                  {allMismatches.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">All store prices match their recommended retail.</p>
                  ) : (
                    <div className="space-y-2">
                      {allMismatches.map(({ product, isLoss, isBreakeven }) => {
                        const isInline = inlineEdit?.id === product.id && inlineEdit.field === 'price';
                        const ignored = isCurrentlyIgnored(product);
                        return (
                          <div key={product.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${ignored ? 'border-gray-100 bg-gray-50/50 opacity-60' : isLoss ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[#3E2723] truncate">{product.name}</p>
                              <p className="text-xs mt-0.5">
                                {ignored ? (
                                  <span className="text-gray-400">Ignored — not counted in the badge</span>
                                ) : isLoss ? (
                                  <span className="text-red-600 font-medium">Below cost after GST — losing money</span>
                                ) : isBreakeven ? (
                                  <span className="text-amber-600">Break-even after GST — no profit</span>
                                ) : (
                                  <span className="text-gray-500">Below recommended but still profitable</span>
                                )}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[10px] text-gray-400 uppercase">Recommended</p>
                              <p className="text-sm text-gray-500">${Number(product.recommendedRetail ?? 0).toFixed(2)}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[10px] text-gray-400 uppercase">Store Price</p>
                              {isInline ? (
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
                                  className="text-sm font-semibold text-[#3E2723] hover:text-[#D32F2F] hover:bg-white px-2 py-1 rounded-lg"
                                  title="Click to edit price"
                                >
                                  ${Number(product.price ?? 0).toFixed(2)}
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => applyRecommendedPrice(product)}
                              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm"
                              title="Set Store Price to match Recommended Retail"
                            >
                              Use recommended
                            </button>
                            <button
                              onClick={() => { setShowReview(false); openEdit(product); }}
                              className="flex-shrink-0 text-xs font-medium text-[#D32F2F] hover:underline"
                              title="Open full edit form"
                            >
                              Edit
                            </button>
                            {ignored ? (
                              <button
                                onClick={() => unignoreMismatch(product.id)}
                                className="flex-shrink-0 text-xs font-medium text-[#D32F2F] hover:underline"
                                title="Start flagging this again"
                              >
                                Un-ignore
                              </button>
                            ) : (
                              <button
                                onClick={() => ignoreMismatch(product)}
                                className="flex-shrink-0 text-xs font-medium text-gray-400 hover:text-gray-600 hover:underline"
                                title="Stop counting this in the badge — until the price or recommended retail changes again"
                              >
                                Ignore
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Low stock */}
                <div>
                  <h4 className="text-sm font-semibold text-[#3E2723] mb-1">
                    Low Stock — 5 or fewer ({lowStockProducts.length})
                  </h4>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No products are low on stock.</p>
                  ) : (
                    <div className="space-y-2">
                      {lowStockProducts.map(product => (
                        <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50">
                          <p className="text-sm font-medium text-[#3E2723] truncate flex-1 min-w-0">{product.name}</p>
                          <span
                            className={`flex-shrink-0 w-20 text-center text-sm font-bold px-2 py-1 rounded-lg ${
                              product.stockQuantity === 0 ? 'bg-red-600 text-white' : 'bg-amber-400 text-amber-900'
                            }`}
                          >
                            {product.stockQuantity} left
                          </span>
                          <button
                            onClick={() => { setShowReview(false); openEdit(product); }}
                            className="flex-shrink-0 w-10 text-right text-xs font-medium text-[#D32F2F] hover:underline"
                            title="Open full edit form"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {search && filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No products match "{search}".</p>
          </div>
        ) : (
        <>
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
                  Cost
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Price <span className="text-gray-300 font-normal normal-case">(click)</span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                  Stock <span className="text-gray-300 font-normal normal-case">(click)</span>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Published</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map(product => {
                const isInlinePrice = inlineEdit?.id === product.id && inlineEdit.field === 'price';

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

                    {/* Stock — read only, managed via batches */}
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <button
                        onClick={() => setManagingBatches(product)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors group inline-flex items-center gap-1 hover:opacity-80 ${
                          (product.stockQuantity ?? 0) > 50 ? 'bg-green-50 text-green-700' :
                          (product.stockQuantity ?? 0) > 0  ? 'bg-amber-50 text-amber-700' :
                                                              'bg-red-50 text-red-700'
                        }`}
                        title="Manage batches"
                      >
                        <Boxes className="w-3 h-3 opacity-0 group-hover:opacity-60" />
                        {product.stockQuantity ?? 0}
                      </button>
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
                        <button onClick={() => setManagingBatches(product)} className="p-2 text-gray-400 hover:text-[#F9A825] hover:bg-yellow-50 rounded-lg transition-colors" title="Manage batches">
                          <Boxes className="w-4 h-4" />
                        </button>
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
          {filteredProducts.map(product => {
            const isInlinePrice = inlineEdit?.id === product.id && inlineEdit.field === 'price';
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

                  {/* Stock — tap to manage batches */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Stock</p>
                    <button
                      onClick={() => setManagingBatches(product)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80 ${
                        (product.stockQuantity ?? 0) > 50 ? 'bg-green-50 text-green-700' :
                        (product.stockQuantity ?? 0) > 0  ? 'bg-amber-50 text-amber-700' :
                                                            'bg-red-50 text-red-700'
                      }`}
                    >
                      {product.stockQuantity ?? 0}
                    </button>
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
                  <button onClick={() => setManagingBatches(product)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Boxes className="w-3.5 h-3.5" /> Batches
                  </button>
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
        </>
        )}
      </div>
    </AdminLayout>
  );
}
