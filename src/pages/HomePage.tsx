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

      {/* Features - Enhanced */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-3 text-center p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-[#3E2723] mb-1 tracking-tight text-base">Authentic Products</h4>
                <p className="text-xs text-gray-600 font-medium">100% Filipino</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 text-center p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F9A825] to-[#F57C00] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-[#3E2723] mb-1 tracking-tight text-base">Fast Delivery</h4>
                <p className="text-xs text-gray-600 font-medium">Nationwide Shipping</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 text-center p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-[#3E2723] mb-1 tracking-tight text-base">Secure Payment</h4>
                <p className="text-xs text-gray-600 font-medium">Safe & Protected</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 text-center p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2196F3] to-[#1565C0] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-[#3E2723] mb-1 tracking-tight text-base">24/7 Support</h4>
                <p className="text-xs text-gray-600 font-medium">We're Here to Help</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF3E0] via-white to-[#FFF8E1] opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1 bg-[#F9A825] text-[#3E2723] text-sm font-semibold rounded-full mb-4">
              EXPLORE
            </span>
            <h2 className="text-4xl font-bold mb-3 text-[#3E2723]">Shop by Category</h2>
            <p className="text-gray-600 text-lg">Find your favorite Filipino products</p>
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
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-14">
            <div>
              <span className="inline-block px-4 py-1 bg-[#D32F2F] text-white text-sm font-semibold rounded-full mb-4">
                BESTSELLERS
              </span>
              <h2 className="text-4xl font-bold mb-3 text-[#3E2723]">Featured Products</h2>
              <p className="text-gray-600 text-lg">Handpicked favorites for you</p>
            </div>
            <button 
              onClick={() => navigate('/category/all-products')}
              className="hidden md:flex items-center gap-2 bg-[#D32F2F] text-white px-6 py-3 rounded-full hover:bg-[#B71C1C] transition-all hover:gap-3 shadow-lg hover:shadow-xl font-medium"
            >
              View All Products
              <span>→</span>
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

      {/* Newsletter - Enhanced */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-[#4A332E] via-[#3E2723] to-[#4A332E]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 bg-[#F9A825] text-[#3E2723] text-sm font-semibold rounded-full mb-6">
              STAY CONNECTED
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Stay Updated with PinoyPantry
            </h2>
            <p className="text-xl mb-10 text-gray-300">
              Subscribe to our newsletter and get exclusive deals, new product updates, and Filipino food recipes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-full border-2 border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F9A825] bg-white/10 backdrop-blur-sm"
              />
              <button className="bg-[#F9A825] text-[#3E2723] px-8 py-4 rounded-full hover:bg-[#FFB300] transition-all whitespace-nowrap font-semibold shadow-xl hover:shadow-2xl hover:scale-105">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
