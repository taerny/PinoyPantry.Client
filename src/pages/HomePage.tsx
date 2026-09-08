import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { ProductsGridSkeleton } from '../components/Skeleton';
import { PasabuySection } from '../components/PasabuySection';
import { PromoCards } from '../components/PromoCards';
import { useFeaturedProducts } from '../hooks/useProducts';
import { scrollToSection } from '../utils/scrollToSection';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

export function HomePage() {
  useDocumentTitle('');
  const navigate = useNavigate();
  const location = useLocation();
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts();

  // Arriving here via the "Pasabuy" nav link from another page — smooth-scroll to
  // the section once it's rendered (App.tsx's route-change scroll-to-top is skipped
  // for this case so it doesn't fight with this scroll).
  useEffect(() => {
    if (location.hash === '#pasabuy') {
      const timer = setTimeout(() => scrollToSection('pasabuy'), 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubscribe() {
    if (!newsletterEmail.trim()) {
      setSubscribeMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    setSubscribing(true);
    setSubscribeMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not subscribe. Please try again.');
      setSubscribeMessage({ type: 'success', text: data.message || 'Subscribed!' });
      setNewsletterEmail('');
    } catch (err: any) {
      setSubscribeMessage({ type: 'error', text: err.message || 'Could not subscribe. Please try again.' });
    } finally {
      setSubscribing(false);
    }
  }

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
              className="hidden md:flex items-center gap-2 bg-[#3E2723] text-white px-6 py-3 rounded-full hover:bg-[#4A332E] transition-all hover:gap-3 shadow-lg hover:shadow-xl font-medium"
            >
              View All Products
              <span>→</span>
            </button>
          </div>
          {productsLoading ? (
            <ProductsGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  badge={product.badge}
                  rating={product.rating}
                  inventory={product.inventory}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <PasabuySection />

      {/* Newsletter - Enhanced */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-[#D32F2F] via-[#B71C1C] to-[#D32F2F]">
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
            <p className="text-xl mb-10 text-white">
              Subscribe to our newsletter and get exclusive deals, new product updates, and Filipino food recipes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubscribe(); }}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-full border-2 border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#F9A825] bg-white/10 backdrop-blur-sm"
              />
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="bg-[#F9A825] text-[#3E2723] px-8 py-4 rounded-full hover:bg-[#FFB300] transition-all whitespace-nowrap font-semibold shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
              >
                {subscribing ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </div>
            {subscribeMessage && (
              <p className={`mt-4 text-sm font-medium ${subscribeMessage.type === 'success' ? 'text-green-200' : 'text-yellow-200'}`}>
                {subscribeMessage.text}
              </p>
            )}
          </div>
        </div>
      </section>

      <PromoCards />
    </>
  );
}
