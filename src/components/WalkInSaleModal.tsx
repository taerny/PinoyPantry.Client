import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Minus, Trash2, Search, ShoppingBag, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface Product {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
}

interface CartLine {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stockQuantity: number;
}

interface WalkInSaleModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function WalkInSaleModal({ onClose, onCreated }: WalkInSaleModalProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [alreadyPaid, setAlreadyPaid] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/api/products/admin?limit=200`, {
      headers: { 'Authorization': `Bearer ${user.token}` },
    })
      .then(res => res.json())
      .then(data => setProducts(data.data || []))
      .catch(() => setError('Failed to load products.'));
  }, [user]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [search, products]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev;
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, stockQuantity: product.stockQuantity }];
    });
    setSearch('');
  }

  function updateQuantity(productId: number, delta: number) {
    setCart(prev => prev
      .map(i => i.productId === productId ? { ...i, quantity: Math.min(i.stockQuantity, Math.max(1, i.quantity + delta)) } : i)
    );
  }

  function removeFromCart(productId: number) {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }

  async function handleSubmit() {
    if (!user) return;
    if (cart.length === 0) {
      setError('Add at least one item to the sale.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/orders/walk-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({
          customerName: customerName.trim() || null,
          customerEmail: customerEmail.trim() || null,
          notes: notes.trim() || null,
          alreadyPaid,
          items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Could not record the sale.');
      }
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not record the sale.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-[#3E2723] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            New Walk-in Sale
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Add products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products by name..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
              />
            </div>
            {filteredProducts.length > 0 && (
              <div className="mt-1 border rounded-lg divide-y max-h-48 overflow-y-auto">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={p.stockQuantity === 0}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-left"
                  >
                    <span className="text-gray-700">{p.name}</span>
                    <span className="text-gray-400 text-xs">${p.price.toFixed(2)} · {p.stockQuantity} in stock</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-xl border-2 p-3 transition-colors ${cart.length === 0 ? 'border-dashed border-gray-200' : 'border-[#F9A825]/50 bg-yellow-50/40'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#3E2723] uppercase tracking-wide flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                Items
              </span>
              {cart.length > 0 && (
                <span className="text-[10px] font-semibold text-white bg-[#D32F2F] rounded-full px-2 py-0.5">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} item{cart.reduce((sum, i) => sum + i.quantity, 0) === 1 ? '' : 's'}
                </span>
              )}
            </div>
            {cart.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-3 text-center">Search above to add products</p>
            ) : (
              <div className="space-y-1.5">
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center gap-2 bg-white border border-yellow-200 rounded-lg px-3 py-2 shadow-sm">
                    <span className="flex-1 text-sm text-gray-700 truncate">{item.name}</span>
                    <div className="flex items-center border rounded bg-white">
                      <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-gray-100" disabled={item.quantity <= 1}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-sm min-w-[1.5rem] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-gray-100" disabled={item.quantity >= item.stockQuantity}>
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-medium text-[#3E2723] w-16 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Customer name (optional)</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email (optional — for receipt)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="No receipt if left blank"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Payment</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAlreadyPaid(true)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                  alreadyPaid ? 'border-[#F9A825] bg-yellow-50 text-[#3E2723]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Paid now
              </button>
              <button
                type="button"
                onClick={() => setAlreadyPaid(false)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                  !alreadyPaid ? 'border-[#F9A825] bg-yellow-50 text-[#3E2723]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Pay later
              </button>
            </div>
            {!alreadyPaid && (
              <p className="mt-1.5 text-xs text-gray-400">
                Saved as Pending — mark it Paid from the orders list once they've actually paid.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        <div className="border-t px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-lg font-bold text-[#3E2723]">${total.toFixed(2)}</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0}
            className="px-5 py-2.5 rounded-lg bg-[#D32F2F] text-white text-sm font-medium hover:bg-[#B71C1C] disabled:opacity-50"
          >
            {submitting ? 'Recording...' : 'Record Sale'}
          </button>
        </div>
      </div>
    </div>
  );
}
