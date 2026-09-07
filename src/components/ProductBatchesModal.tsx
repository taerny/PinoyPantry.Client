import { useEffect, useState } from 'react';
import { X, Trash2, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface ProductBatch {
  id: number;
  batchNumber: string;
  quantity: number;
  remainingQuantity: number;
  bestBefore: string | null;
  createdAt: string;
}

interface ProductBatchesModalProps {
  productId: number;
  productName: string;
  onClose: () => void;
  onBatchesChange: (stock: number) => void;
}

type BatchStatus = 'selling' | 'reserve' | 'depleted';

function batchStatus(batch: ProductBatch, activeBatchId: number | null): BatchStatus {
  if (batch.remainingQuantity === 0) return 'depleted';
  return batch.id === activeBatchId ? 'selling' : 'reserve';
}

const STATUS_LABEL: Record<BatchStatus, string> = {
  selling: 'Selling now',
  reserve: 'In reserve',
  depleted: 'Depleted',
};

const STATUS_STYLE: Record<BatchStatus, string> = {
  selling: 'bg-yellow-50 text-[#B8860B]',
  reserve: 'bg-green-50 text-green-700',
  depleted: 'bg-gray-100 text-gray-400',
};

function bestBeforeInfo(dateStr: string | null): { label: string; className: string } | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });

  if (days < 0) return { label: `${formatted} · expired`, className: 'text-red-600' };
  if (days <= 7) return { label: `${formatted} · expiring soon`, className: 'text-amber-600' };
  return { label: formatted, className: 'text-gray-500' };
}

export function ProductBatchesModal({ productId, productName, onClose, onBatchesChange }: ProductBatchesModalProps) {
  const { user } = useAuth();
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [bestBefore, setBestBefore] = useState('');

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/batches`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBatches(data.batches);
      setBatchNumber(data.suggestedNextBatchNumber);
      const stock = data.batches.reduce((sum: number, b: ProductBatch) => sum + b.remainingQuantity, 0);
      onBatchesChange(stock);
    } catch {
      setError('Could not load batches.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({
          batchNumber,
          quantity: parseInt(quantity, 10) || 0,
          bestBefore: bestBefore || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Could not add batch.');
      }
      setQuantity('');
      setBestBefore('');
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not add batch.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(batch: ProductBatch) {
    if (!user) return;
    if (!confirm(`Delete batch #${batch.batchNumber}? This removes its remaining ${batch.remainingQuantity} unsold units from stock.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/batches/${batch.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (!res.ok && res.status !== 204) throw new Error();
      await load();
    } catch {
      setError('Could not delete batch.');
    }
  }

  const totalStock = batches.reduce((sum, b) => sum + b.remainingQuantity, 0);
  const activeBatchId = batches.find(b => b.remainingQuantity > 0)?.id ?? null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-[#3E2723] flex items-center gap-2">
              <Package className="w-5 h-5" />
              Batches — {productName}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {totalStock} total on hand across {batches.length} {batches.length === 1 ? 'batch' : 'batches'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="px-5 pt-3 text-sm text-red-600">{error}</p>}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : batches.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center border border-dashed rounded-lg">No batches yet — add one below.</p>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                    <th className="px-3 py-2">Batch</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Remaining</th>
                    <th className="px-3 py-2">Sold</th>
                    <th className="px-3 py-2">Best before</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(batch => {
                    const status = batchStatus(batch, activeBatchId);
                    const bb = bestBeforeInfo(batch.bestBefore);
                    const sold = batch.quantity - batch.remainingQuantity;
                    const pct = batch.quantity > 0 ? Math.round((batch.remainingQuantity / batch.quantity) * 100) : 0;

                    return (
                      <tr key={batch.id} className="border-b last:border-0">
                        <td className="px-3 py-2.5 font-semibold text-[#3E2723]">#{batch.batchNumber}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
                            {STATUS_LABEL[status]}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full rounded-full bg-[#F9A825]" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{batch.remainingQuantity} / {batch.quantity}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">{sold}</td>
                        <td className={`px-3 py-2.5 ${bb?.className ?? 'text-gray-400'}`}>{bb ? bb.label : '—'}</td>
                        <td className="px-3 py-2.5 text-right">
                          <button onClick={() => handleDelete(batch)} className="text-red-500 hover:bg-red-50 p-1 rounded" title="Delete batch">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form onSubmit={handleAdd} className="border-t px-5 py-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-[#3E2723]">Add batch</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex min-w-[90px] flex-1 flex-col gap-1">
              <label className="text-xs text-gray-500">Batch No.</label>
              <input
                required
                value={batchNumber}
                onChange={e => setBatchNumber(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
              />
            </div>
            <div className="flex min-w-[90px] flex-1 flex-col gap-1">
              <label className="text-xs text-gray-500">Quantity</label>
              <input
                required
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
              />
            </div>
            <div className="flex min-w-[140px] flex-1 flex-col gap-1">
              <label className="text-xs text-gray-500">Best before (optional)</label>
              <input
                type="date"
                value={bestBefore}
                onChange={e => setBestBefore(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#3E2723] text-white text-sm font-medium hover:bg-[#2C1A17] disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
