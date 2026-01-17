import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductsGridSkeleton, Skeleton } from '../components/Skeleton';
import { Search, Filter } from 'lucide-react';
import ProductService from '../services/productService';
import { Product } from '../types';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  useEffect(() => {
    const search = async () => {
      try {
        setLoading(true);
        const results = await ProductService.searchProducts(searchQuery);
        setRawProducts(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      search();
    }
  }, [searchQuery]);

  // Sort products based on selected option
  const products = [...rawProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'featured':
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-[#4A332E] text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-8 h-8 text-[#F9A825]" />
              <Skeleton className="h-8 w-48 bg-white/20" />
            </div>
            <Skeleton className="h-5 w-64 bg-white/20" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filter Bar Skeleton */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <ProductsGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#4A332E] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-8 h-8 text-[#F9A825]" />
            <h1 className="text-3xl font-bold">Search Results</h1>
          </div>
          <p className="text-white/80">
            {products.length} {products.length === 1 ? 'result' : 'results'} found for "{searchQuery}"
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No products found</h2>
            <p className="text-muted-foreground">
              Try different keywords or browse our categories
            </p>
          </div>
        ) : (
          <>
            {/* Filters & Sort */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {products.length} {products.length === 1 ? 'result' : 'results'}
                </span>
              </div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825] cursor-pointer transition-all hover:border-[#F9A825]"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  badge={product.badge}
                  rating={product.rating}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
