import { ShoppingCart, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCart } from './CartContext';
import { useState } from 'react';

interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating?: number;
}

export function ProductCard({ name, price, originalPrice, image, badge, rating = 4.5 }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    // Create a unique ID based on the product name
    const id = name.toLowerCase().replace(/\s+/g, '-');
    
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
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-[#D32F2F] text-white px-3 py-1 rounded-full text-sm">
            {badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-[#F9A825] text-[#3E2723] px-3 py-1 rounded-full text-sm">
            -{discount}%
          </span>
        )}
        <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white">
          <Heart className="w-5 h-5 text-[#D32F2F]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 min-h-[3rem]">{name}</h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(rating) ? 'text-[#F9A825]' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({rating})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#D32F2F]">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="text-muted-foreground line-through text-sm">${originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          className={`w-full py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
            isAdding 
              ? 'bg-green-600 text-white' 
              : 'bg-[#3E2723] text-white hover:bg-[#4A332E]'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isAdding ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
