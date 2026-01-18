import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductsGridSkeleton, Skeleton } from '../components/Skeleton';
import { Search, Filter, ArrowRight } from 'lucide-react';
import ProductService from '../services/productService';
import { Product } from '../types';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  useEffect(() => {
    const search = async () => {
      try {
        setLoading(true);
        const results = await ProductService.searchProducts(searchQuery);
        console.log('Search results for:', searchQuery, 'Found:', results.length, 'products');
        setRawProducts(results);

        // If only 1 result (exact match from suggestion click), fetch related products
        if (results.length === 1) {
          const product = results[0];
          fetchRelatedProducts(product);
        } else {
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setRawProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      search();
    } else {
      setLoading(false);
      setRawProducts([]);
      setRelatedProducts([]);
    }
  }, [searchQuery]);

  // Fetch related products from the same category
  const fetchRelatedProducts = async (product: Product) => {
    try {
      setLoadingRelated(true);
      
      console.log('🔍 Fetching related products for:', product.name);
      console.log('🔍 Product category:', product.category);
      console.log('🔍 Product tags:', product.tags);
      
      // Fetch products from the same category
      if (product.category) {
        const categoryProducts = await ProductService.getProductsByCategory(product.category);
        
        console.log('🔍 Category products fetched:', categoryProducts.length);
        
        // Filter out the current product and limit to 4
        const related = categoryProducts
          .filter(p => p.id !== product.id)
          .slice(0, 4);
        
        console.log('🔍 Related products found:', related.length);
        console.log('🔍 Related products:', related.map(p => ({ name: p.name, category: p.category })));
        
        setRelatedProducts(related);
      } else if (product.tags && product.tags.length > 0) {
        console.log('⚠️ No category found, using tags to find related products');
        // If no category, try finding products with similar tags
        const allProducts = await ProductService.getProducts();
        const related = allProducts.products
          .filter(p => {
            // Don't include the current product
            if (p.id === product.id) return false;
            // Find products that share at least one tag
            return p.tags?.some(tag => product.tags?.includes(tag));
          })
          .slice(0, 4);
        
        console.log('🔍 Tag-based related products found:', related.length);
        setRelatedProducts(related);
      } else {
        console.log('⚠️ No category or tags, fetching random products');
        // Last resort: just get some random products
        const allProducts = await ProductService.getProducts();
        const related = allProducts.products
          .filter(p => p.id !== product.id)
          .slice(0, 4);
        
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  };

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

            {/* Related Products Section - Only show when single result */}
            {products.length === 1 && relatedProducts.length > 0 && (
              <div className="mt-12 border-t pt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#3E2723] mb-2">
                      You might also like
                    </h2>
                    <p className="text-gray-600 capitalize">
                      {products[0].category 
                        ? `More from ${products[0].category.replace(/-/g, ' ')}`
                        : 'Similar products you may enjoy'
                      }
                    </p>
                  </div>
                  {products[0].category && (
                    <Link
                      to={`/category/${products[0].category}`}
                      className="flex items-center gap-2 text-[#F9A825] hover:text-[#D32F2F] transition-colors font-medium group whitespace-nowrap"
                    >
                      <span className="capitalize">View all {products[0].category.replace(/-/g, ' ')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>

                {loadingRelated ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                        <div className="bg-gray-200 h-4 rounded mb-1"></div>
                        <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {relatedProducts.map((product) => (
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
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
