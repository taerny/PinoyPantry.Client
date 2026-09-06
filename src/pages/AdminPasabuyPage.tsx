import { useState, useEffect } from 'react';
import { ShoppingBag, Check, Phone, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout, PASABUY_LAST_SEEN_KEY } from '../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface PasabuyOrder {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  itemsRequested: string;
  notes: string | null;
  contacted: boolean;
  createdAt: string;
}

export function AdminPasabuyPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<PasabuyOrder[]>([]);
  const [loading, setLoading] = useState(true);

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

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No Pasabuy orders yet — they'll show up here once customers submit one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
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
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {o.itemsRequested}
                </div>
                {o.notes && (
                  <p className="mt-2 text-sm text-gray-500 italic">Note: {o.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">{orders.length} total order{orders.length === 1 ? '' : 's'}.</p>
      </div>
    </AdminLayout>
  );
}
