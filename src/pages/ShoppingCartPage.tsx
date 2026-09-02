import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../contexts/CartContext';

interface ShoppingCartPageProps {
  onClose: () => void;
  onCheckout: () => void;
}

export function ShoppingCartPage({ onClose, onCheckout }: ShoppingCartPageProps) {
  const { cartItems, updateQuantity, removeItem } = useCart();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[#3E2723] hover:text-[#D32F2F] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Continue Shopping
        </button>

        <h1 className="mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {cartItems.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="bg-[#D32F2F] text-white px-6 py-2 rounded-lg hover:bg-[#B71C1C] transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <div key={item.id} className="p-4 flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2">{item.name}</h3>
                        <p className="text-[#D32F2F] mb-3">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#D32F2F] hover:text-[#B71C1C]"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <p className="text-[#3E2723]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Delivery/pickup options and fees are set at checkout.
                  </p>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full bg-[#D32F2F] text-white py-3 rounded-lg hover:bg-[#B71C1C] transition-colors mb-3"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={onClose}
                  className="w-full border-2 border-[#3E2723] text-[#3E2723] py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
