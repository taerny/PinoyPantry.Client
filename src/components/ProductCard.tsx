import { ShoppingCart, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating?: number;
  inventory?: number;
}

export function ProductCard({ id, name, price, originalPrice, image, badge, rating = 4.5, inventory }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const isSoldOut = inventory === 0;
  const isLimitedStock = !isSoldOut && inventory !== undefined && inventory <= 10;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart({
      id,
      name,
      price,
      image,
    });

    // Show feedback animation
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <div className="bg-white rounded-md shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100">
      {/* Image Container - Square */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <ImageWithFallback
          src={image}
          alt={name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${isSoldOut ? 'grayscale opacity-60' : ''}`}
        />
        {badge && (
          <span className="absolute top-2 left-2 bg-[#D32F2F] text-white px-2 py-0.5 rounded-full text-xs">
            {badge}
          </span>
        )}
        {discount > 0 && !isSoldOut && (
          <span className="absolute top-2 right-2 bg-[#F9A825] text-[#3E2723] px-2 py-0.5 rounded-full text-xs">
            -{discount}%
          </span>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="bg-black text-white font-bold tracking-wide px-3 py-1 rounded-md text-xs uppercase shadow-lg">
              Sold Out
            </span>
          </div>
        )}
        {isLimitedStock && (
          <span className="absolute bottom-2 left-2 bg-[#D32F2F] text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide animate-pulse shadow-md">
            Limited Stock
          </span>
        )}
        <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white">
          <Heart className="w-4 h-4 text-[#D32F2F]" />
        </button>
      </div>

      {/* Content - Very Compact */}
      <div className="p-2">
        <h3 className="mb-1 line-clamp-2 min-h-[2rem] text-xs leading-tight font-medium">{name}</h3>
        
        {/* Rating - Smaller */}
        <div className="flex items-center gap-0.5 mb-1">
          <div className="flex text-xs">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(rating) ? 'text-[#F9A825]' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground ml-0.5">({rating})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[#D32F2F] font-semibold text-sm">${price?.toFixed(2) || '0.00'}</span>
          {originalPrice && (
            <span className="text-muted-foreground line-through text-[10px]">${originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Add to Cart Button - Smaller */}
        <button
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className={`w-full py-1.5 rounded text-xs transition-all flex items-center justify-center gap-1.5 ${
            isSoldOut
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isAdding
              ? 'bg-green-600 text-white'
              : 'bg-[#3E2723] text-white hover:bg-[#4A332E]'
          }`}
        >
          {!isSoldOut && <ShoppingCart className="w-3.5 h-3.5" />}
          {isSoldOut ? 'Sold Out' : isAdding ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
