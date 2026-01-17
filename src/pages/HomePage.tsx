import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { ProductsGridSkeleton, CategoriesGridSkeleton } from '../components/Skeleton';
import { useCategories } from '../hooks/useCategories';
import { useFeaturedProducts } from '../hooks/useProducts';
import { Package, Truck, Shield, Headphones } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts();

  return (
    <>
      <Hero />

      {/* Features */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
              <Package className="w-10 h-10 text-[#D32F2F] flex-shrink-0" />
              <div>
                <h4 className="text-sm">Authentic Products</h4>
                <p className="text-xs text-muted-foreground">100% Filipino</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
              <Truck className="w-10 h-10 text-[#D32F2F] flex-shrink-0" />
              <div>
                <h4 className="text-sm">Fast Delivery</h4>
                <p className="text-xs text-muted-foreground">Nationwide Shipping</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
              <Shield className="w-10 h-10 text-[#D32F2F] flex-shrink-0" />
              <div>
                <h4 className="text-sm">Secure Payment</h4>
                <p className="text-xs text-muted-foreground">Safe & Protected</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
              <Headphones className="w-10 h-10 text-[#D32F2F] flex-shrink-0" />
              <div>
                <h4 className="text-sm">24/7 Support</h4>
                <p className="text-xs text-muted-foreground">We're Here to Help</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-2">Shop by Category</h2>
            <p className="text-muted-foreground">Find your favorite Filipino products</p>
          </div>
          {categoriesLoading ? (
            <CategoriesGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(1).map((category) => (
                <div
                  key={category.id}
                  onClick={() => navigate(`/category/${category.slug}`)}
                  className="cursor-pointer"
                >
                  <CategoryCard 
                    title={category.title}
                    icon={category.icon}
                    itemCount={category.itemCount}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked favorites for you</p>
            </div>
            <button 
              onClick={() => navigate('/category/all-products')}
              className="text-[#D32F2F] hover:text-[#B71C1C] transition-colors"
            >
              View All →
            </button>
          </div>
          {productsLoading ? (
            <ProductsGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
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
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-[#FAF3E0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-[#3E2723]">Stay Updated with PinoyPantry</h2>
          <p className="mb-8 text-[#6D4C41] max-w-2xl mx-auto">
            Subscribe to our newsletter and get exclusive deals, new product updates, and Filipino food recipes!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#F9A825] bg-white"
            />
            <button className="bg-[#D32F2F] text-white px-8 py-3 rounded-lg hover:bg-[#B71C1C] transition-colors whitespace-nowrap">
              Subscribe Now
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
