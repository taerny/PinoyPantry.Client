import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Check, AlertCircle, X, ClipboardList, ChevronDown, ChevronUp, FileText, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';
import { WalkInSaleModal } from '../components/WalkInSaleModal';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface OrderItem {
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerAddress: string | null;
  notes: string | null;
  deliveryMethod: string | null;
  deliveryFee: number | null;
  channel: 'Online' | 'Walk-in';
  status: 'Pending' | 'Paid' | 'Cancelled' | 'Completed';
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_STYLES: Record<Order['status'], string> = {
  Pending: 'bg-amber-50 text-amber-700',
  Paid: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
  Completed: 'bg-blue-50 text-blue-700',
};

export function AdminOrdersPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [feeDraft, setFeeDraft] = useState<{ orderId: number; value: string } | null>(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  useEffect(() => {
    if (!authLoading && user && isAdmin) fetchOrders();
  }, [authLoading, user, isAdmin]);

  async function fetchOrders() {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (res.ok) setOrders(await res.json());
    } catch { setMessage({ type: 'error', text: 'Failed to load orders.' }); }
    finally { setLoading(false); }
  }

  async function updateStatus(order: Order, status: Order['status']) {
    if (!user) return;
    setUpdatingId(order.id);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update order.');
      }
      const updated: Order = await res.json();
      setOrders(prev => prev.map(o => o.id === order.id ? updated : o));
      setMessage({ type: 'success', text: `${order.invoiceNumber} marked ${status}.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update order.' });
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmDeliveryFee(order: Order) {
    if (!user || !feeDraft || feeDraft.orderId !== order.id) return;
    const fee = parseFloat(feeDraft.value);
    if (isNaN(fee) || fee < 0) {
      setMessage({ type: 'error', text: 'Enter a valid delivery fee.' });
      return;
    }
    setUpdatingId(order.id);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/orders/${order.id}/delivery-fee`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ deliveryFee: fee }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to set delivery fee.');
      }
      const updated: Order = await res.json();
      setOrders(prev => prev.map(o => o.id === order.id ? updated : o));
      setFeeDraft(null);
      setMessage({ type: 'success', text: `Delivery fee confirmed for ${order.invoiceNumber} — customer notified.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to set delivery fee.' });
    } finally {
      setUpdatingId(null);
    }
  }

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;

  return (
    <AdminLayout activePage="orders">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#3E2723] flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Orders</h2>
            <p className="text-xs text-gray-400 mt-0.5">Every order placed through the storefront or entered manually. Click a row to see items.</p>
          </div>
          <button
            onClick={() => setShowWalkInModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-[#3E2723] text-white hover:bg-[#2C1A17] flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Walk-in Sale
          </button>
        </div>

        {showWalkInModal && (
          <WalkInSaleModal
            onClose={() => setShowWalkInModal(false)}
            onCreated={() => {
              fetchOrders();
              setMessage({ type: 'success', text: 'Walk-in sale recorded.' });
            }}
          />
        )}

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto text-current opacity-50 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No orders yet — they'll show up here once customers start checking out.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-auto max-h-[75vh]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Placed</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(order => {
                  const expanded = expandedId === order.id;
                  const canPay = order.status === 'Pending';
                  const canComplete = order.status === 'Paid';
                  const canCancel = order.status === 'Pending' || order.status === 'Paid';
                  return (
                    <Fragment key={order.id}>
                      <tr className="hover:bg-gray-50/50 cursor-pointer transition-colors" onClick={() => setExpandedId(expanded ? null : order.id)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-[#3E2723]">
                            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-300" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-300" />}
                            {order.invoiceNumber}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 flex items-center gap-1.5">
                            {order.customerName}
                            {order.channel === 'Walk-in' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-600">Walk-in</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{order.customerEmail || '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-[#3E2723]">
                          ${order.total.toFixed(2)}{order.deliveryFee === null && <span className="text-amber-500 text-xs"> +delivery</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}>{order.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/admin/orders/${order.id}/invoice`}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                              <FileText className="w-3 h-3" />
                              Invoice
                            </Link>
                            {canPay && (
                              <button disabled={updatingId === order.id} onClick={() => updateStatus(order, 'Paid')} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50">
                                Mark Paid
                              </button>
                            )}
                            {canComplete && (
                              <button disabled={updatingId === order.id} onClick={() => updateStatus(order, 'Completed')} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50">
                                Mark Completed
                              </button>
                            )}
                            {canCancel && (
                              <button disabled={updatingId === order.id} onClick={() => updateStatus(order, 'Cancelled')} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50">
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Items</p>
                                <div className="space-y-1">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                      <span className="text-gray-600">{item.productName} × {item.quantity}</span>
                                      <span className="text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Customer Details</p>
                                <div className="text-sm text-gray-600 space-y-1">
                                  {order.customerPhone && <p>📞 {order.customerPhone}</p>}
                                  {order.customerAddress && <p className="whitespace-pre-line">📍 {order.customerAddress}</p>}
                                  {order.notes && <p className="text-gray-500 italic">"{order.notes}"</p>}
                                  {order.deliveryMethod && (
                                    <p>
                                      🚚 {order.deliveryMethod}
                                      {order.deliveryFee !== null && ` — $${order.deliveryFee.toFixed(2)}`}
                                    </p>
                                  )}
                                </div>

                                {order.deliveryFee === null && (
                                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-700 mb-2">Delivery fee not set yet — contact the customer to arrange, then confirm the fee here.</p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-500">$</span>
                                      <input
                                        type="number" step="0.01" min="0"
                                        value={feeDraft?.orderId === order.id ? feeDraft.value : ''}
                                        onChange={e => setFeeDraft({ orderId: order.id, value: e.target.value })}
                                        placeholder="0.00"
                                        className="w-24 text-sm px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                                      />
                                      <button
                                        disabled={updatingId === order.id}
                                        onClick={() => confirmDeliveryFee(order)}
                                        className="px-3 py-1 rounded-lg text-xs font-medium bg-[#3E2723] text-white hover:bg-[#2C1A17] disabled:opacity-50"
                                      >
                                        Confirm Fee
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
