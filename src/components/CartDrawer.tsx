import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { cartItems, updateQuantity, removeItem } = useCart();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    onCheckout();
    onClose();
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sliding Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-[#4A332E] text-white px-6 py-4 flex items-center justify-between border-b border-[#6D4C41]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-[#F9A825]" />
            <div>
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <p className="text-sm text-white/70">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#F9A825] transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="bg-[#FAF3E0] rounded-full p-6 mb-4">
                <ShoppingBag className="w-16 h-16 text-[#D32F2F]" />
              </div>
              <h3 className="text-xl font-semibold text-[#3E2723] mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Start adding some delicious Filipino products!</p>
              <button
                onClick={onClose}
                className="bg-[#D32F2F] text-white px-6 py-3 rounded-lg hover:bg-[#B71C1C] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-md p-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-2">
                    {/* Product Image - Even Smaller */}
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded flex-shrink-0"
                    />

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-xs text-[#3E2723] mb-0.5 line-clamp-1 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-[#D32F2F] font-semibold text-xs mb-1.5">
                        ${item.price.toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-0.5 hover:bg-gray-100 transition-colors rounded-l disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="px-2 py-0.5 font-medium text-xs text-[#3E2723] min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-0.5 hover:bg-gray-100 transition-colors rounded-r"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>

                        <span className="text-[10px] text-gray-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 bg-[#FAF3E0] px-6 py-4">
            {/* Shipping Notice */}
            {subtotal < 100 && (
              <div className="bg-[#FFF3CD] border border-[#F9A825] rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-[#3E2723]">
                  Add <span className="font-semibold text-[#D32F2F]">${(100 - subtotal).toFixed(2)}</span> more for free shipping! 🚚
                </p>
              </div>
            )}

            {/* Price Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping:</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold text-[#3E2723]">
                <span>Total:</span>
                <span className="text-[#D32F2F]">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-[#D32F2F] text-white py-3 rounded-lg hover:bg-[#B71C1C] transition-colors font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="w-full bg-white text-[#3E2723] py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium border border-gray-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
