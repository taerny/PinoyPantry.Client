import { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Check, Phone, Mail, Image as ImageIcon, X, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout, PASABUY_LAST_SEEN_KEY } from '../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface PasabuyOrderItem {
  id: number;
  productName: string;
  quantity: number;
  imageUrl: string | null;
  notes: string | null;
}

interface PasabuyOrder {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  items: PasabuyOrderItem[];
  itemsRequested: string | null; // legacy free-text, only present on old orders
  notes: string | null;
  contacted: boolean;
  createdAt: string;
}

export function AdminPasabuyPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<PasabuyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<{ url: string; label: string } | null>(null);
  const [search, setSearch] = useState('');

  // Matches against every text field a customer could have typed — name, phone, email,
  // per-item product names/notes, the order-level notes, and the legacy free-text field for
  // old orders — so "search by name, number, all" really does cover everything, not just name.
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o => {
      const haystack = [
        o.name, o.phone, o.email, o.notes, o.itemsRequested,
        ...o.items.flatMap(i => [i.productName, i.notes]),
      ];
      return haystack.some(field => field?.toLowerCase().includes(q));
    });
  }, [orders, search]);

  useEffect(() => {
    if (!authLoading && user && isAdmin) fetchOrders();
  }, [authLoading, user, isAdmin]);

  async function fetchOrders() {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/pasabuy`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (res.ok) setOrders(await res.json());
      localStorage.setItem(PASABUY_LAST_SEEN_KEY, new Date().toISOString());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function toggleContacted(order: PasabuyOrder) {
    if (!user) return;
    const nextContacted = !order.contacted;
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, contacted: nextContacted } : o));
    try {
      await fetch(`${API_URL}/api/pasabuy/${order.id}/contacted`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ contacted: nextContacted }),
      });
    } catch {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, contacted: !nextContacted } : o));
    }
  }

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;

  return (
    <AdminLayout activePage="pasabuy">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#3E2723] flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Pasabuy Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">Order requests submitted via the homepage Pasabuy section.</p>
        </div>

        {orders.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, item, or note..."
              className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No Pasabuy orders yet — they'll show up here once customers submit one.</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No orders match "{search}".</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(o => (
              <div key={o.id} className={`bg-white rounded-xl shadow-sm border p-5 ${o.contacted ? 'border-gray-200' : 'border-[#F9A825]/50'}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-[#3E2723]">{o.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {o.phone}</span>
                      {o.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {o.email}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400 mb-2">{new Date(o.createdAt).toLocaleString()}</p>
                    <button
                      onClick={() => toggleContacted(o)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        o.contacted ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-[#F9A825]/15 text-[#3E2723] hover:bg-[#F9A825]/25'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> {o.contacted ? 'Contacted' : 'Mark as Contacted'}
                    </button>
                  </div>
                </div>
                {o.items.length > 0 ? (
                  <div className="space-y-2">
                    {o.items.map(item => (
                      <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                        {/* Big enough to actually read brand/packaging at a glance, no click
                            needed — a small thumbnail defeats the point of a reference photo. */}
                        {item.imageUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ url: item.imageUrl!, label: item.productName })}
                            className="flex-shrink-0 w-64 h-64 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-[#F9A825] transition-shadow"
                            title="Click to view full size"
                          >
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          </button>
                        ) : (
                          <div className="flex-shrink-0 w-64 h-64 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#3E2723] truncate">{item.productName}</p>
                          {item.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.notes}</p>}
                        </div>
                        <span className="flex-shrink-0 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                          Qty {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {o.itemsRequested || '(no items listed)'}
                  </div>
                )}
                {o.notes && (
                  <p className="mt-2 text-sm text-gray-500 italic">Note: {o.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          {search
            ? `${filteredOrders.length} of ${orders.length} order${orders.length === 1 ? '' : 's'} matched.`
            : `${orders.length} total order${orders.length === 1 ? '' : 's'}.`}
        </p>
      </div>

      {/* Full-size image preview — click a reference photo thumbnail to open, click anywhere
          to close. Lets the owner actually make out product/brand details the small
          thumbnail hides. */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-3xl max-h-[85vh] flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            <img src={previewImage.url} alt={previewImage.label} className="max-w-full max-h-[75vh] rounded-lg object-contain cursor-default" />
            <p className="text-white/90 text-sm font-medium">{previewImage.label}</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
