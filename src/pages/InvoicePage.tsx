import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

const STATUS_STYLES: Record<Order['status'], string> = {
  Pending: 'bg-amber-50 text-amber-700',
  Paid: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
  Completed: 'bg-blue-50 text-blue-700',
};

export function InvoicePage() {
  const { id } = useParams();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feeInput, setFeeInput] = useState('');
  const [savingFee, setSavingFee] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!id || !user || !isAdmin) return;
    fetch(`${API_URL}/api/orders/${id}`, { headers: { 'Authorization': `Bearer ${user.token}` } })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setOrder)
      .catch(() => setError('Could not load this order.'));
  }, [id, user, isAdmin]);

  // Browsers use the page title as the suggested filename when saving via print-to-PDF — so
  // "Save as PDF" defaults to a sensible name (e.g. "Invoice-PP-00123.pdf") instead of
  // whatever the tab happened to be called, which matters for admins downloading this to send
  // to customers with no email (e.g. via Facebook Messenger).
  useEffect(() => {
    if (!order) return;
    const previousTitle = document.title;
    document.title = `Invoice-${order.invoiceNumber}`;
    return () => { document.title = previousTitle; };
  }, [order]);

  useEffect(() => {
    fetch(`${API_URL}/api/bank-details`)
      .then(res => res.json())
      .then(setBank)
      .catch(() => null);
  }, []);

  async function handleConfirmFee() {
    if (!order || !user) return;
    const fee = Number(feeInput);
    if (!feeInput || Number.isNaN(fee) || fee < 0) {
      setMessage({ type: 'error', text: 'Enter a valid delivery fee.' });
      return;
    }
    setSavingFee(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/orders/${order.id}/delivery-fee`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ deliveryFee: fee }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Could not save the delivery fee.');
      }
      const updated: Order = await res.json();
      setOrder(updated);
      setFeeInput('');
      setMessage({ type: 'success', text: 'Delivery fee confirmed — customer has been emailed the updated total.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not save the delivery fee.' });
    } finally {
      setSavingFee(false);
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-gray-500">{error}</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading invoice...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-2 flex max-w-3xl items-center justify-between px-4 print:hidden">
        <Link to="/admin/orders" className="flex items-center gap-2 text-sm text-[#3E2723] hover:text-[#D32F2F] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#3E2723] text-white hover:bg-[#2C1A17] transition-colors"
        >
          <Printer className="w-4 h-4" />
          Download / Print Invoice
        </button>
      </div>

      {/* No customer email? This is exactly what would've been emailed, bank details
          included — download it here (choose "Save as PDF" in the dialog that opens) and
          send it however works, e.g. Facebook Messenger. */}
      <div className="mx-auto mb-4 max-w-3xl px-4 print:hidden">
        <p className="text-xs text-gray-400 text-right">
          Tip: in the dialog, set destination to <strong>"Save as PDF"</strong> to download a file you can send via Messenger or email.
        </p>
      </div>

      {message && (
        <div className={`mx-auto mb-4 max-w-3xl px-4 print:hidden`}>
          <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {message.text}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border bg-white shadow-lg print:rounded-none print:border-none print:shadow-none">
        <div className="h-3 bg-gradient-to-r from-[#D32F2F] to-[#F9A825]" />

        <div className="p-8 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b pb-8">
            <div>
              <img src="/images/logo.png" alt="PinoyPantry" className="h-14 w-auto mb-2" />
              <p className="text-sm text-gray-500">Filipino grocery store</p>
              <p className="text-sm text-gray-500">Dunedin, New Zealand</p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold tracking-tight text-[#3E2723]">INVOICE</p>
              <p className="mt-1 text-sm text-gray-500">{order.invoiceNumber}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Bill To</p>
              <p className="mt-1 font-medium text-[#3E2723]">{order.customerName}</p>
              {order.customerEmail && <p className="text-sm text-gray-500">{order.customerEmail}</p>}
              {order.customerPhone && <p className="text-sm text-gray-500">{order.customerPhone}</p>}
              {order.customerAddress && <p className="text-sm whitespace-pre-line text-gray-500">{order.customerAddress}</p>}
            </div>

            {order.deliveryMethod && (
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Delivery</p>
                <p className="mt-1 font-medium text-[#3E2723]">{order.deliveryMethod}</p>
                {order.deliveryFee === null ? (
                  <div className="mt-2 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 p-3 print:hidden">
                    <p className="text-sm font-medium text-amber-900">Delivery fee not yet confirmed</p>
                    <p className="mt-1 text-xs text-amber-800">
                      Once you've arranged delivery with the customer, enter the fee below — this updates the total and emails them the final invoice.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="e.g. 15.00"
                        value={feeInput}
                        onChange={e => setFeeInput(e.target.value)}
                        className="h-9 max-w-[140px] px-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                      />
                      <button
                        disabled={savingFee}
                        onClick={handleConfirmFee}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#3E2723] text-white hover:bg-[#2C1A17] disabled:opacity-50"
                      >
                        {savingFee ? 'Saving...' : 'Confirm fee'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">Delivery fee: ${order.deliveryFee.toFixed(2)}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Unit Price</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-dashed">
                    <td className="py-2.5 text-[#3E2723]">{item.productName}</td>
                    <td className="py-2.5 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-2.5 text-right text-gray-600">${item.price.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-medium text-[#3E2723]">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-[220px]">
              {order.deliveryFee !== null && order.deliveryFee !== 0 && (
                <div className="flex justify-between pt-2 text-sm text-gray-500">
                  <span>Delivery</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 text-base font-bold text-[#3E2723]">
                <span>Total{order.deliveryFee === null ? ' + delivery' : ''}</span>
                <span className="text-[#D32F2F]">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm">
              <p className="font-medium text-[#3E2723]">Order notes</p>
              <p className="mt-1 text-gray-500">{order.notes}</p>
            </div>
          )}

          {order.status === 'Paid' || order.status === 'Completed' ? (
            <div className="mt-8 rounded-lg border-2 border-dashed border-green-400 bg-green-50 p-5">
              <p className="text-sm font-semibold text-green-800">✅ Payment Received</p>
              <p className="mt-1 text-sm text-green-700">
                {order.channel === 'Walk-in' ? 'Paid in-store.' : 'Payment has been received.'} No further action needed.
              </p>
            </div>
          ) : order.status === 'Pending' ? (
            <div className="mt-8 rounded-lg border-2 border-dashed border-[#F9A825]/50 bg-yellow-50 p-5">
              <p className="text-sm font-semibold text-[#3E2723]">Payment Instructions</p>
              <p className="mt-1 text-sm text-gray-600">
                {order.channel === 'Walk-in'
                  ? <>Pay <strong className="text-[#3E2723]">${order.total.toFixed(2)}</strong> at the store on your next visit, or by bank transfer using the details below. Use <strong className="text-[#3E2723]">{order.invoiceNumber}</strong> as your reference either way.</>
                  : <>Please pay by bank transfer using the details below. Use <strong className="text-[#3E2723]">{order.invoiceNumber}</strong> as the payment reference.</>}
              </p>
              {/* grid-cols-[auto_1fr] instead of grid-cols-2 — an even 50/50 split wasted
                  most of the row on the short labels (e.g. "Bank") and left too little for
                  longer values (e.g. two people's names on the account), wrapping them
                  awkwardly despite plenty of free space to the right. */}
              <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm sm:w-2/3">
                <span className="text-gray-500">Account Name</span>
                <span className="font-medium text-[#3E2723]">{bank?.accountName ?? 'Loading...'}</span>
                <span className="text-gray-500">Bank</span>
                <span className="font-medium text-[#3E2723]">{bank?.bankName ?? 'Loading...'}</span>
                <span className="text-gray-500">Account Number</span>
                <span className="font-medium text-[#3E2723]">{bank?.accountNumber ?? 'Loading...'}</span>
                <span className="text-gray-500">Reference</span>
                <span className="font-medium text-[#3E2723]">{order.invoiceNumber}</span>
              </div>
            </div>
          ) : null}

          <p className="mt-8 text-center text-xs text-gray-400">Salamat po for shopping with PinoyPantry!</p>
        </div>
      </div>
    </div>
  );
}
