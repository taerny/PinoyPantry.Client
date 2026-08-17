import { ArrowLeft, X, Mail } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';

interface CheckoutPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export function CheckoutPage({ onBack, onComplete }: CheckoutPageProps) {
  const { cartItems } = useCart();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

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
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="mb-6">Shipping Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">
                    Full Name <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="Juan Dela Cruz"
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
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="juan@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">
                    Phone Number <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="+63 912 345 6789"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">
                    ZIP Code <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="1000"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2">
                    Street Address <span className="text-[#D32F2F]">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="House/Unit No., Street Name, Barangay"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">
                    City <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="Manila"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">
                    Province <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={shippingInfo.province}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="Metro Manila"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="mb-6">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-[#F9A825] rounded-lg cursor-pointer bg-yellow-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#D32F2F]"
                  />
                  <div className="flex-1">
                    <p>Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">
                      Pay securely with Stripe using Visa, Mastercard, etc.
                    </p>
                  </div>
                </label>
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
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
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
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="text-[#D32F2F]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowComingSoonPopup(true)}
                className="w-full py-3 rounded-lg transition-colors mb-3 bg-[#D32F2F] text-white hover:bg-[#B71C1C]"
              >
                Place Order
              </button>

              <p className="text-xs text-center text-muted-foreground">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Online checkout not live yet */}
      {showComingSoonPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center relative">
            <button
              onClick={() => setShowComingSoonPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <Mail className="w-12 h-12 text-[#D32F2F] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#3E2723] mb-2">Online Checkout Coming Soon</h3>
            <p className="text-sm text-gray-500 mb-5">
              We're still setting up online payments. Please contact us directly and we'll help you complete your purchase.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="/contact"
                className="w-full px-4 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-medium hover:bg-[#B71C1C] transition-colors"
              >
                Contact Us
              </a>
              <button
                onClick={() => { setShowComingSoonPopup(false); onComplete(); }}
                className="w-full px-4 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
