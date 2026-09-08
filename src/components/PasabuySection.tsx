import { useState } from 'react';
import { Calendar, Ship, MapPin, CheckCircle, MessageCircle, Plus, X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { FacebookF } from './icons/FacebookF';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface PasabuyItemForm {
  productName: string;
  quantity: string;
  imageUrl: string;
  notes: string;
  uploading: boolean;
}

const EMPTY_ITEM: PasabuyItemForm = { productName: '', quantity: '1', imageUrl: '', notes: '', uploading: false };

const HOW_IT_WORKS = [
  'Think of a product that you want.',
  'Send us your order.',
  'Payment required upon delivery/pick up.',
  'We purchase your items in the Philippines and arrange shipping to New Zealand.',
  "Once your order arrives in Dunedin, we'll contact you regarding collection/delivery.",
];

const PLEASE_NOTE = [
  'Orders are subject to product availability in the Philippines.',
  'If an item becomes unavailable, we will contact you regarding a suitable alternative.',
  'The arrival date is an estimated ETA, not a guaranteed delivery date. Shipping schedules, customs clearance and MPI processing can sometimes cause delays.',
  'Once your order has been submitted, cancellations may not be possible as we purchase items specifically for each customer.',
  'Please check your order carefully before submitting it.',
];

const EMPTY_FORM = { name: '', phone: '', email: '', notes: '' };

export function PasabuySection() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState<PasabuyItemForm[]>([{ ...EMPTY_ITEM }]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function updateItem(index: number, patch: Partial<PasabuyItemForm>) {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, ...patch } : it));
  }

  function addItem() {
    setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== index));
  }

  async function handleItemImageSelect(index: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      updateItem(index, { uploading: true });
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/api/pasabuy/upload-item-image`, { method: 'POST', body: formData });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Image upload failed.');
        updateItem(index, { imageUrl: data.imageUrl, uploading: false });
      } catch {
        updateItem(index, { uploading: false });
        setResult({ type: 'error', text: 'Could not upload that image — please try again.' });
      }
    };
    input.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items.filter(it => it.productName.trim());
    if (!form.name.trim() || !form.phone.trim() || validItems.length === 0) {
      setResult({ type: 'error', text: 'Please fill in your name, phone, and at least one item you\'d like to order.' });
      return;
    }
    // An image upload is async — without this, clicking Submit right after picking a photo
    // (before the upload finishes) would silently send the item with no image attached.
    if (items.some(it => it.uploading)) {
      setResult({ type: 'error', text: 'Please wait for your photo to finish uploading before submitting.' });
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/pasabuy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: validItems.map(it => ({
            productName: it.productName.trim(),
            quantity: parseInt(it.quantity, 10) || 1,
            imageUrl: it.imageUrl || null,
            notes: it.notes.trim() || null,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not submit your order. Please try again.');
      setResult({ type: 'success', text: data.message || 'Order request received!' });
      setForm(EMPTY_FORM);
      setItems([{ ...EMPTY_ITEM }]);
    } catch (err: any) {
      setResult({ type: 'error', text: err.message || 'Could not submit your order. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="pasabuy" className="py-20 bg-gradient-to-b from-[#FFF8E1] to-white scroll-mt-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <span className="inline-block px-4 py-1 bg-[#D32F2F] text-white text-sm font-semibold rounded-full mb-4">
            🇵🇭 PASABUY — ORDERS NOW OPEN 🇳🇿
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#3E2723]">
            Filipino Grocery Pasabuy
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Missing your favourite Filipino snacks, biscuits, canned goods and pantry essentials?
            We're now taking orders for our next Filipino grocery shipment! 🇵🇭❤️
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white border border-[#F9A825]/40 rounded-xl px-5 py-3 shadow-sm">
              <Calendar className="w-5 h-5 text-[#D32F2F] flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs text-gray-400 uppercase font-semibold">Order Cut-off</p>
                <p className="text-sm font-bold text-[#3E2723]">20 September 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white border border-[#F9A825]/40 rounded-xl px-5 py-3 shadow-sm">
              <Ship className="w-5 h-5 text-[#D32F2F] flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs text-gray-400 uppercase font-semibold">Estimated Arrival</p>
                <p className="text-sm font-bold text-[#3E2723]">Last week of September 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white border border-[#F9A825]/40 rounded-xl px-5 py-3 shadow-sm">
              <MapPin className="w-5 h-5 text-[#D32F2F] flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs text-gray-400 uppercase font-semibold">Collection</p>
                <p className="text-sm font-bold text-[#3E2723]">Dunedin, NZ</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-[#3E2723] mb-3">🛒 How It Works</h3>
              <ol className="space-y-2.5">
                {HOW_IT_WORKS.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F9A825]/20 text-[#3E2723] text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-[#3E2723] mb-2">💰 Pricing</h3>
              <p className="text-sm text-gray-600">
                Our prices are calculated to include the product cost, international freight and
                anticipated import/clearance costs. Additional charges may apply in exceptional
                circumstances (e.g. unforeseen customs/MPI inspection costs) — if any unexpected
                charge affects your order, we'll contact you before proceeding.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-[#3E2723] mb-3">📦 Please Note</h3>
              <ul className="space-y-2">
                {PLEASE_NOTE.map((note, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-[#D32F2F] flex-shrink-0">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
            {result?.type === 'success' ? (
              <div className="flex flex-col items-center text-center py-10 gap-3">
                <CheckCircle className="w-14 h-14 text-green-500" />
                <h3 className="text-xl font-bold text-[#3E2723]">Order Received!</h3>
                <p className="text-gray-500 max-w-sm">{result.text}</p>
                <button
                  onClick={() => setResult(null)}
                  className="mt-2 px-5 py-2 bg-[#F9A825] text-[#3E2723] font-semibold rounded-lg hover:bg-[#FFB300] transition-colors"
                >
                  Submit another order
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-[#3E2723] mb-1">Send Us Your Order</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Limited shipment capacity available, so get your orders in before 20 September! 🇵🇭❤️
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Juan dela Cruz"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="021 234 5678"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What would you like to order?</label>
                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                        <div className="flex items-center gap-3">
                          {/* Image upload/preview */}
                          <button
                            type="button"
                            onClick={() => handleItemImageSelect(i)}
                            disabled={item.uploading}
                            className="flex-shrink-0 w-64 h-64 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden hover:border-[#F9A825] transition-colors disabled:opacity-60"
                            title="Add a reference photo (optional)"
                          >
                            {item.uploading ? (
                              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                            ) : item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center text-gray-400 gap-1.5">
                                <ImageIcon className="w-8 h-8" />
                                <span className="text-xs">Add photo</span>
                              </div>
                            )}
                          </button>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                required={i === 0}
                                value={item.productName}
                                onChange={e => updateItem(i, { productName: e.target.value })}
                                placeholder="e.g. Nagaraya Garlic Snack"
                                className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent"
                              />
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={e => updateItem(i, { quantity: e.target.value })}
                                className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white text-center focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent"
                                title="Quantity"
                              />
                            </div>
                            <input
                              type="text"
                              value={item.notes}
                              onChange={e => updateItem(i, { notes: e.target.value })}
                              placeholder="Variant/brand notes (optional) — e.g. spicy version, family size"
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent"
                            />
                          </div>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(i)}
                              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#D32F2F] hover:text-[#B71C1C] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                  <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Tip: a reference photo helps us find the exact brand/packaging.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Anything else we should know?"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent resize-none"
                  />
                </div>

                {result?.type === 'error' && (
                  <p className="text-red-500 text-sm">{result.text}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting || items.some(it => it.uploading)}
                  className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold py-3.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : items.some(it => it.uploading) ? 'Uploading photo...' : 'Submit Pasabuy Order'}
                </button>

                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" /> Prefer to message us instead?
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://www.facebook.com/profile.php?id=61593512277062"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#1877F2] font-medium hover:underline"
                    >
                      <FacebookF className="w-3.5 h-3.5" /> Message us
                    </a>
                    <span className="text-gray-300">|</span>
                    <a href="/contact?subject=Order%20Enquiry" className="text-[#D32F2F] font-medium hover:underline">
                      Contact form
                    </a>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
