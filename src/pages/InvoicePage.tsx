import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Check, AlertCircle, Trash2, Pencil, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface OrderItem {
  id: number;
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
  amountPaid: number | null;
  customerIp: string | null;
  userAgent: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

// A rough, human-readable guess at the device from the raw user-agent string — enough to
// notice "these 4 orders all came from the same Android phone", not a precise fingerprint.
function describeDevice(ua: string): string {
  const os =
    /iPhone/.test(ua) ? 'iPhone' :
    /iPad/.test(ua) ? 'iPad' :
    /Android/.test(ua) ? 'Android' :
    /Windows/.test(ua) ? 'Windows' :
    /Mac OS X|Macintosh/.test(ua) ? 'Mac' :
    /Linux/.test(ua) ? 'Linux' : 'Unknown device';
  const browser =
    /Edg\//.test(ua) ? 'Edge' :
    /FBAN|FBAV|FB_IAB/.test(ua) ? 'Facebook app' :
    /CriOS|Chrome\//.test(ua) ? 'Chrome' :
    /FxiOS|Firefox\//.test(ua) ? 'Firefox' :
    /Safari\//.test(ua) ? 'Safari' : 'unknown browser';
  return `${os} · ${browser}`;
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
  // Sales return / correction: quantities being typed but not yet saved, keyed by item id.
  const [qtyEdits, setQtyEdits] = useState<Record<number, string>>({});
  const [savingItemId, setSavingItemId] = useState<number | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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

  function clearQtyEdit(itemId: number) {
    setQtyEdits(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }

  // Quantities are a whole number of at least 1 — removing a line has its own trash button.
  function qtyError(raw: string): string | null {
    if (raw.trim() === '') return 'Enter a quantity';
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1) return 'Minimum is 1 — use the trash icon to remove the item';
    return null;
  }

  // Only an explicit Save (or Enter) saves. If the server rejects it (e.g. not enough
  // stock), the box goes back to the last saved quantity instead of keeping the rejected
  // number on screen.
  async function handleSaveQty(item: OrderItem) {
    if (!order || !user) return;
    const raw = qtyEdits[item.id];
    if (raw === undefined || qtyError(raw)) return;
    if (Number(raw) === item.quantity) {
      clearQtyEdit(item.id);
      return;
    }

    setSavingItemId(item.id);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/orders/${order.id}/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ quantity: Number(raw) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Could not save this change.');
      }
      setOrder(await res.json());
      setMessage({ type: 'success', text: `${item.productName} quantity updated — stock adjusted.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not save this change.' });
    } finally {
      clearQtyEdit(item.id);
      setSavingItemId(null);
    }
  }

  // Cancels the whole order — the server returns every line's stock. Shared by the
  // "Cancel order" button and removing the last line.
  async function cancelOrder(): Promise<void> {
    if (!order || !user) return;
    const res = await fetch(`${API_URL}/api/orders/${order.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify({ status: 'Cancelled' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Could not cancel this order.');
    }
    setOrder(await res.json());
    setQtyEdits({});
  }

  async function handleCancelOrder() {
    setCancelling(true);
    setMessage(null);
    try {
      await cancelOrder();
      setMessage({ type: 'success', text: 'Order cancelled — all stock returned.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not cancel this order.' });
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  }

  // Drop a line entirely. Its stock goes back and the total is recomputed on the server.
  // Removing the last line means the customer returned everything, so the whole order is
  // cancelled instead (the server returns all stock; a paid order then shows the full
  // refund due).
  async function handleRemoveItem(item: OrderItem) {
    if (!order || !user) return;
    const isLastLine = order.items.length === 1;
    setRemovingItemId(item.id);
    setMessage(null);
    try {
      if (isLastLine) {
        await cancelOrder();
      } else {
        const res = await fetch(`${API_URL}/api/orders/${order.id}/items/${item.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Could not remove this item.');
        }
        setOrder(await res.json());
        clearQtyEdit(item.id);
      }
      setMessage({
        type: 'success',
        text: isLastLine
          ? 'All items returned — order cancelled and stock returned.'
          : `Removed ${item.productName} — stock returned.`,
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not remove this item.' });
    } finally {
      setRemovingItemId(null);
      setConfirmRemoveId(null);
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-gray-500">{error}</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading invoice...</div>;

  const isCorrectable = order.status === 'Pending' || order.status === 'Paid';
  const lineCount = order.items.length;
  // Compares what the customer paid (snapshotted at Mark as Paid) with the current total.
  const amountPaid = order.amountPaid;
  const refundDue =
    amountPaid === null ? 0 : order.status === 'Cancelled' ? amountPaid : amountPaid - order.total;
  let paidNotice: ReactNode = null;
  if (amountPaid !== null && refundDue > 0.005) {
    paidNotice = (
      <>
        <p className="text-sm font-semibold">Refund due: ${refundDue.toFixed(2)}</p>
        <p className="mt-1">
          {order.status === 'Cancelled'
            ? `The customer paid $${amountPaid.toFixed(2)} before this order was cancelled.`
            : `The customer paid $${amountPaid.toFixed(2)}, but the total is now $${order.total.toFixed(2)}.`}{' '}
          {order.channel === 'Walk-in' ? 'Refund the difference in cash or by bank transfer.' : 'Refund the difference by bank transfer.'}
        </p>
      </>
    );
  } else if (amountPaid !== null && refundDue < -0.005 && order.status !== 'Cancelled') {
    paidNotice = (
      <>
        <p className="text-sm font-semibold">Customer still owes: ${(-refundDue).toFixed(2)}</p>
        <p className="mt-1">The customer paid ${amountPaid.toFixed(2)}, but the total is now ${order.total.toFixed(2)}.</p>
      </>
    );
  } else if (order.status === 'Paid') {
    paidNotice = (
      <p>
        This order is already paid{amountPaid !== null ? ` ($${amountPaid.toFixed(2)})` : ''}. If the customer returns items,
        change the quantity or remove the item below — the refund amount will show here.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-2 flex max-w-3xl items-center justify-between px-4 print:hidden">
        <Link to="/admin/orders" className="flex items-center gap-2 text-sm text-[#3E2723] hover:text-[#D32F2F] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="flex items-center gap-2">
          {isCorrectable && (
            confirmCancel ? (
              <span className="flex items-center gap-1">
                <span className="text-xs text-red-600">Cancel the whole order? All stock goes back.</span>
                <button
                  disabled={cancelling}
                  onClick={handleCancelOrder}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#D32F2F] text-white hover:bg-red-800 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, cancel'}
                </button>
                <button
                  disabled={cancelling}
                  onClick={() => setConfirmCancel(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                >
                  No
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmCancel(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel order
              </button>
            )
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#3E2723] text-white hover:bg-[#2C1A17] transition-colors"
          >
            <Printer className="w-4 h-4" />
            Download / Print Invoice
          </button>
        </div>
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

      {/* overflow-hidden clips anything inside wider than max-w-3xl - fine on screen, but on a
          printed page (wider physical canvas than a screen-oriented 768px cap) it silently cut
          off right-aligned content instead of the box just using the extra space. print:w-full
          + print:overflow-visible let it use the real page width and never hide overflow. */}
      <div className="mx-auto max-w-3xl print:max-w-full print:w-full overflow-hidden print:overflow-visible rounded-xl border bg-white shadow-lg print:rounded-none print:border-none print:shadow-none">
        <div className="h-3 bg-gradient-to-r from-[#D32F2F] to-[#F9A825]" />

        {/* Vertical spacing tightened for print (mt-8 -> print:mt-4, etc. throughout this
            section) - a longer invoice (many items) was just tall enough to spill "Salamat po
            for shopping" onto an otherwise-empty second page. Screen spacing is unchanged. */}
        <div className="p-8 sm:p-10 print:pt-4 print:pb-4 print:pl-4 print:pr-6">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b pb-8 print:pb-4">
            <div>
              <img src="/images/logo.png" alt="PinoyPantry" className="h-14 print:h-10 w-auto mb-2" />
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

          <div className="mt-8 print:mt-4 grid gap-6 print:gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Bill To</p>
              <p className="mt-1 font-medium text-[#3E2723]">{order.customerName}</p>
              {order.customerEmail && <p className="text-sm text-gray-500">{order.customerEmail}</p>}
              {order.customerPhone && <p className="text-sm text-gray-500">{order.customerPhone}</p>}
              {order.customerAddress && <p className="text-sm whitespace-pre-line text-gray-500">{order.customerAddress}</p>}
              {(order.customerIp || order.userAgent) && (
                <div className="mt-2 rounded-md bg-gray-50 px-2 py-1.5 text-[11px] text-gray-400 print:hidden">
                  <p className="font-medium text-gray-500">Submitted from (admin only)</p>
                  {order.customerIp && <p>IP: {order.customerIp}</p>}
                  {order.userAgent && <p title={order.userAgent}>Device: {describeDevice(order.userAgent)}</p>}
                </div>
              )}
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

          {paidNotice && (
            <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 print:hidden">
              {paidNotice}
            </div>
          )}

          {/* min-w-[420px] is fine on screen (overflow-x-auto lets it scroll), but printing/
              saving as PDF doesn't scroll - on a narrow mobile print canvas that forced
              minimum just got clipped off the page edge instead of shrinking to fit. */}
          {/* text-sm -> print:text-xs on the table specifically (not the whole invoice) -
              this is the one lever that scales WITH item count, since it shrinks every row,
              not just fixed margins - an order with many items needs more than tighter
              margins alone can reclaim. */}
          <div className="mt-8 print:mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] print:min-w-0 text-sm print:text-xs">
              <thead>
                <tr className="border-b text-left text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Unit Price</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* print:break-inside-avoid on each row - rather than counting items to force
                    a page break at some fixed number (fragile: a wrapped long product name
                    would throw off any fixed count), this just tells the browser to never
                    split a single row across pages. Whatever number of rows actually fits on
                    a page fits, and the rest flow to page 2+ automatically - no ceiling, no
                    magic number to maintain. Chrome also repeats <thead> on each printed page
                    by default once a table spans more than one, so a second page stays
                    readable with column labels instead of just bare numbers. */}
                {order.items.map(item => {
                  const editRaw = qtyEdits[item.id];
                  const editErr = editRaw !== undefined ? qtyError(editRaw) : null;
                  const isSaving = savingItemId === item.id;
                  return (
                    <tr key={item.id} className="border-b border-dashed align-top print:break-inside-avoid">
                      <td className="py-2.5 print:py-1 text-[#3E2723]">
                        <div className="flex items-start justify-between gap-2">
                          <span>{item.productName}</span>
                          {isCorrectable && (
                            confirmRemoveId === item.id ? (
                              <span className="flex shrink-0 items-center gap-1 print:hidden">
                                <span className="text-xs text-red-600">
                                  {lineCount === 1 ? 'Last item — return all & cancel order?' : 'Remove?'}
                                </span>
                                <button
                                  disabled={removingItemId === item.id}
                                  onClick={() => handleRemoveItem(item)}
                                  className="h-6 px-2 rounded text-xs font-medium bg-[#D32F2F] text-white hover:bg-red-800 disabled:opacity-50"
                                >
                                  {removingItemId === item.id ? 'Removing...' : 'Yes'}
                                </button>
                                <button
                                  disabled={removingItemId === item.id}
                                  onClick={() => setConfirmRemoveId(null)}
                                  className="h-6 px-2 rounded text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  No
                                </button>
                              </span>
                            ) : (
                              <button
                                title={lineCount === 1
                                  ? 'Return everything — cancels the order (stock is returned)'
                                  : 'Remove this item from the order (stock is returned)'}
                                onClick={() => setConfirmRemoveId(item.id)}
                                className="h-6 w-6 shrink-0 flex items-center justify-center rounded text-gray-400 hover:text-[#D32F2F] print:hidden"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 print:py-1 text-center text-gray-600">
                        {isCorrectable && editRaw === undefined ? (
                          // Read-only until the pen is clicked, so a stray keystroke can't
                          // change a quantity by accident.
                          <span className="inline-flex items-center gap-1">
                            {item.quantity}
                            <button
                              title="Edit quantity (customer returned some)"
                              onClick={() => setQtyEdits(prev => ({ ...prev, [item.id]: String(item.quantity) }))}
                              className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-[#3E2723] print:hidden"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ) : isCorrectable && editRaw !== undefined ? (
                          <>
                            <span className="hidden print:inline">{item.quantity}</span>
                            <div className="flex flex-col items-center gap-1 print:hidden">
                              <input
                                type="number"
                                min={1}
                                step={1}
                                autoFocus
                                value={editRaw}
                                disabled={isSaving}
                                onChange={e => setQtyEdits(prev => ({ ...prev, [item.id]: e.target.value }))}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveQty(item);
                                  if (e.key === 'Escape') clearQtyEdit(item.id);
                                }}
                                className={`h-8 w-16 px-1 text-center rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825] ${editErr ? 'border-red-400' : 'border-gray-300'}`}
                              />
                              {editErr && <span className="text-[11px] leading-tight text-red-600">{editErr}</span>}
                              <span className="flex gap-1">
                                <button
                                  disabled={isSaving || editErr !== null}
                                  onClick={() => handleSaveQty(item)}
                                  className="h-6 px-2 rounded text-xs font-medium bg-[#3E2723] text-white hover:bg-[#2C1A17] disabled:opacity-50"
                                >
                                  {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  disabled={isSaving}
                                  onClick={() => clearQtyEdit(item.id)}
                                  className="h-6 px-2 rounded text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </span>
                            </div>
                          </>
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className="py-2.5 print:py-1 text-right text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="py-2.5 print:py-1 text-right font-medium text-[#3E2723]">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 print:mt-2 flex justify-end">
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
            <div className="mt-6 print:mt-3 rounded-lg bg-gray-50 p-4 print:p-2.5 text-sm">
              <p className="font-medium text-[#3E2723]">Order notes</p>
              <p className="mt-1 text-gray-500">{order.notes}</p>
            </div>
          )}

          {order.status === 'Paid' || order.status === 'Completed' ? (
            <div className="mt-8 print:mt-3 rounded-lg border-2 border-dashed border-green-400 bg-green-50 p-5 print:p-3 print:break-inside-avoid">
              <p className="text-sm font-semibold text-green-800">✅ Payment Received</p>
              <p className="mt-1 text-sm text-green-700">
                {order.channel === 'Walk-in' ? 'Paid in-store.' : 'Payment has been received.'} No further action needed.
              </p>
            </div>
          ) : order.status === 'Pending' ? (
            <div className="mt-8 print:mt-3 rounded-lg border-2 border-dashed border-[#F9A825]/50 bg-yellow-50 p-5 print:p-3 print:break-inside-avoid">
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
              <div className="mt-3 print:mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm sm:w-2/3">
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

          <p className="mt-8 print:mt-3 text-center text-xs text-gray-400">Salamat po for shopping with PinoyPantry!</p>
        </div>
      </div>
    </div>
  );
}
