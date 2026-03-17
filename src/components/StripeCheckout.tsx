import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface StripeCheckoutProps {
  items: CartItem[];
  total: number;
  onSuccess: () => void;
  onCancel: () => void;
}

let stripePromise: ReturnType<typeof loadStripe> | null = null;

async function getStripe() {
  if (!stripePromise) {
    try {
      const res = await fetch(`${API_URL}/api/payment/config`);
      const { publishableKey } = await res.json();
      stripePromise = loadStripe(publishableKey);
    } catch {
      stripePromise = null;
    }
  }
  return stripePromise;
}

function CheckoutForm({ onSuccess, total }: { onSuccess: () => void; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      // Use in-place confirmation so we can show the success UI
      // instead of redirecting away from the app.
      confirmParams: {},
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed.');
      setProcessing(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-[#D32F2F] text-white py-3 rounded-lg hover:bg-[#B71C1C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
      >
        <Lock className="w-4 h-4" />
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)} NZD`}
      </button>
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <CreditCard className="w-3.5 h-3.5" />
        Secured by Stripe
      </div>
    </form>
  );
}

export function StripeCheckout({ items, total, onSuccess, onCancel }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeLoaded, setStripeLoaded] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stripe = await getStripe();
        if (!stripe) throw new Error('Stripe not available');
        setStripeLoaded(getStripe());

        const res = await fetch(`${API_URL}/api/payment/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(i => ({ productId: i.id, name: i.name, price: i.price, quantity: i.quantity }))
          }),
        });
        if (!res.ok) throw new Error('Failed to create payment');
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch {
        setError('Payment service unavailable. Stripe keys need to be configured.');
      } finally {
        setLoading(false);
      }
    })();
  }, [items]);

  if (loading) return <div className="text-center py-8 text-gray-500">Setting up payment...</div>;

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <p className="text-gray-600 mb-1">{error}</p>
        <p className="text-xs text-gray-400 mb-4">The store owner needs to add Stripe API keys.</p>
        <button onClick={onCancel} className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Go Back</button>
      </div>
    );
  }

  if (!clientSecret || !stripeLoaded) return null;

  return (
    <Elements stripe={stripeLoaded} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <CheckoutForm onSuccess={onSuccess} total={total} />
    </Elements>
  );
}
