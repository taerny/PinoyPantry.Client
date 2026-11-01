import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductsGridSkeleton } from '../components/Skeleton';
import { ApiProductService } from '../services/apiProductService';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Product } from '../types';

export function NewArrivalsPage() {
  useDocumentTitle('New Arrivals');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    ApiProductService.getNewArrivals(60)
      .then(p => { if (!cancelled) setProducts(p); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <span className="inline-block px-4 py-1 bg-[#3E2723] text-[#F9A825] text-sm font-semibold rounded-full mb-3">NEW</span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-2">New Arrivals</h1>
        <p className="text-gray-600">The latest products to land on our shelves.</p>
      </div>

      {loading ? (
        <ProductsGridSkeleton count={8} />
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-6">No new arrivals right now — check back soon!</p>
          <Link to="/category/all-products" className="inline-block px-6 py-3 bg-[#3E2723] text-white rounded-full hover:bg-[#4A332E] transition-colors">
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {products.map(p => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              originalPrice={p.originalPrice}
              image={p.image}
              badge={p.badge}
              rating={p.rating}
              inventory={p.inventory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
