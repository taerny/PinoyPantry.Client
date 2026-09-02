import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

const NZ_PHONE_REGEX = /^(\+64|0)[2-9][0-9]{6,9}$/;
const DUNEDIN_DELIVERY_FEE = 5;

type DeliveryMethod = 'Click & Collect' | 'Delivery within Dunedin' | 'Delivery outside Dunedin';

const DELIVERY_OPTIONS: { value: DeliveryMethod; label: string; description: string }[] = [
  {
    value: 'Click & Collect',
    label: 'Click & Collect',
    description: "Pick up your order yourself — we'll message you with pickup details.",
  },
  {
    value: 'Delivery within Dunedin',
    label: 'Delivery within Dunedin — $5',
    description: 'Flat $5 delivery fee, added to your total below.',
  },
  {
    value: 'Delivery outside Dunedin',
    label: 'Delivery outside Dunedin',
    description: "Delivery fee depends on distance — we'll contact you to arrange it and confirm the final total before you pay.",
  },
];

function isValidNzPhone(raw: string) {
  return NZ_PHONE_REGEX.test(raw.replace(/[\s\-()]/g, ''));
}

interface CheckoutPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export function CheckoutPage({ onBack, onComplete }: CheckoutPageProps) {
  const { cartItems, clearCart } = useCart();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    deliveryMethod: '' as DeliveryMethod | '',
    address: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [confirmedInvoice, setConfirmedInvoice] = useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const phoneValid = isValidNzPhone(form.phone);
  const showPhoneError = phoneTouched && form.phone.length > 0 && !phoneValid;
  const needsAddress = form.deliveryMethod !== '' && form.deliveryMethod !== 'Click & Collect';
  const deliveryFee = form.deliveryMethod === 'Delivery within Dunedin' ? DUNEDIN_DELIVERY_FEE : 0;
  const feePending = form.deliveryMethod === 'Delivery outside Dunedin';
  const total = subtotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handlePlaceOrder() {
    setError(null);
    setPhoneTouched(true);

    if (!phoneValid) {
      setError('Please enter a valid NZ phone number, e.g. 021 234 5678.');
      return;
    }
    if (!form.deliveryMethod) {
      setError('Please choose a delivery method.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.fullName,
          customerEmail: form.email,
          customerPhone: form.phone,
          customerAddress: form.address,
          notes: form.notes,
          deliveryMethod: form.deliveryMethod,
          items: cartItems.map(item => ({ productId: parseInt(item.id, 10), quantity: item.quantity })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Could not place your order. Please try again.');
      }
      const order = await res.json();
      clearCart();
      setConfirmedInvoice(order.invoiceNumber);
    } catch (err: any) {
      setError(err.message || 'Could not place your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedInvoice) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl p-8 text-center">
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#3E2723] mb-2">Order Placed!</h1>
          <p className="text-sm text-gray-500 mb-1">Invoice <span className="font-semibold text-[#3E2723]">{confirmedInvoice}</span></p>
          <p className="text-sm text-gray-500 mb-6">
            We've sent a confirmation to your email. We'll be in touch shortly to confirm payment{feePending ? ' and delivery' : ''}.
          </p>
          <button
            onClick={onComplete}
            className="w-full px-4 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-medium hover:bg-[#B71C1C] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#3E2723] hover:text-[#D32F2F] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Cart
        </button>

        <h1 className="mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="mb-6">Delivery Method</h2>
              <div className="flex flex-col gap-3">
                {DELIVERY_OPTIONS.map(option => {
                  const selected = form.deliveryMethod === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer border-2 transition-colors ${
                        selected ? 'border-[#F9A825] bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={selected}
                        onChange={() => setForm({ ...form, deliveryMethod: option.value })}
                        className="mt-1 w-4 h-4 accent-[#D32F2F]"
                      />
                      <div>
                        <p className="text-sm font-medium text-[#3E2723]">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Contact & Delivery Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="mb-6">Contact Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">
                    Full Name <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">
                    Email <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2">
                    Phone <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    onBlur={() => setPhoneTouched(true)}
                    placeholder="021 234 5678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    required
                  />
                  {showPhoneError ? (
                    <p className="mt-1.5 text-xs text-[#D32F2F]">
                      Please enter a valid NZ phone number, e.g. 021 234 5678.
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      So we can call to confirm your order and delivery.
                    </p>
                  )}
                </div>

                {form.deliveryMethod === 'Click & Collect' ? (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">
                      No address needed — we'll message you with pickup details once your order is confirmed.
                    </p>
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block mb-2">
                      Delivery Address {needsAddress && <span className="text-[#D32F2F]">*</span>}
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                      required={needsAddress}
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block mb-2">Order Notes (optional)</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="mb-6">Payment Method</h2>
              <div className="p-4 border-2 border-[#F9A825] rounded-lg bg-yellow-50">
                <p>Pay Later (Bank Transfer)</p>
                <p className="text-sm text-muted-foreground">
                  We'll email you bank transfer details once your order is confirmed. No payment is taken now.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{feePending ? 'To be confirmed' : `$${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span>Total{feePending ? ' + delivery' : ''}</span>
                    <span className="text-[#D32F2F]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting || cartItems.length === 0}
                className="w-full py-3 rounded-lg transition-colors mb-3 bg-[#D32F2F] text-white hover:bg-[#B71C1C] disabled:opacity-50"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
