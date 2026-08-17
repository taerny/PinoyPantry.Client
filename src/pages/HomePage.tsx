import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { ProductsGridSkeleton } from '../components/Skeleton';
import { useFeaturedProducts } from '../hooks/useProducts';

export function HomePage() {
  const navigate = useNavigate();
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts();

  return (
    <>
      <Hero />

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
