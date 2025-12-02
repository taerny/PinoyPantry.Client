import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryCard } from './components/CategoryCard';
import { ProductCard } from './components/ProductCard';
import { Footer } from './components/Footer';
import { ShoppingCartPage } from './components/ShoppingCartPage';
import { CategoryPage } from './components/CategoryPage';
import { LoginPage } from './components/LoginPage';
import { CheckoutPage } from './components/CheckoutPage';
import { CartProvider } from './components/CartContext';
import { Package, Truck, Shield, Headphones } from 'lucide-react';

export default function App() {
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setShowCart(false);
    setShowLogin(false);
  };

  const handleLogoClick = () => {
    setSelectedCategory(null);
    setShowCart(false);
    setShowLogin(false);
    setShowCheckout(false);
  };

  const handleUserClick = () => {
    setShowLogin(true);
    setShowCart(false);
    setSelectedCategory(null);
    setShowCheckout(false);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
    setShowCart(false);
    setSelectedCategory(null);
    setShowLogin(false);
  };

  const handleCheckoutComplete = () => {
    setShowCheckout(false);
    setShowCart(false);
    setSelectedCategory(null);
    setShowLogin(false);
  };

  if (showLogin) {
    return (
      <CartProvider>
        <LoginPage onClose={handleLogoClick} />
      </CartProvider>
    );
  }

  if (showCheckout) {
    return (
      <CartProvider>
        <Header 
          onCartClick={() => {
            setShowCheckout(false);
            setShowCart(true);
          }}
          onCategoryClick={handleCategoryClick}
          onLogoClick={handleLogoClick}
          onUserClick={handleUserClick}
          selectedCategory={selectedCategory}
        />
        <CheckoutPage 
          onBack={() => {
            setShowCheckout(false);
            setShowCart(true);
          }}
          onComplete={handleCheckoutComplete}
        />
        <Footer />
      </CartProvider>
    );
  }

  if (showCart) {
    return (
      <CartProvider>
        <Header 
          onCartClick={() => setShowCart(false)} 
          onCategoryClick={handleCategoryClick}
          onLogoClick={handleLogoClick}
          onUserClick={handleUserClick}
          selectedCategory={selectedCategory}
        />
        <ShoppingCartPage 
          onClose={() => setShowCart(false)}
          onCheckout={handleCheckout}
        />
        <Footer />
      </CartProvider>
    );
  }

  if (selectedCategory) {
    return (
      <CartProvider>
        <Header 
          onCartClick={() => setShowCart(true)} 
          onCategoryClick={handleCategoryClick}
          onLogoClick={handleLogoClick}
          onUserClick={handleUserClick}
          selectedCategory={selectedCategory}
        />
        <CategoryPage category={selectedCategory} />
        <Footer />
      </CartProvider>
    );
  }
  const categories = [
    { title: 'Canned Goods', icon: '🥫', itemCount: 120 },
    { title: 'Snacks & Chips', icon: '🍟', itemCount: 85 },
    { title: 'Instant Noodles', icon: '🍜', itemCount: 65 },
    { title: 'Beverages', icon: '🥤', itemCount: 45 },
    { title: 'Condiments', icon: '🧂', itemCount: 55 },
    { title: 'Sweets', icon: '🍬', itemCount: 40 },
  ];

  const featuredProducts = [
    {
      name: 'Premium Corned Beef',
      price: 89.99,
      originalPrice: 120.00,
      image: 'https://images.unsplash.com/photo-1733700469173-15d46efc2c09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuZWQlMjBiZWVmJTIwY2FufGVufDF8fHx8MTc2NDI0MTM3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      badge: 'BESTSELLER',
      rating: 4.8,
    },
    {
      name: 'Chippy Chips Assorted Pack',
      price: 45.00,
      image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.5,
    },
    {
      name: 'Canned Sardines in Tomato Sauce',
      price: 32.50,
      originalPrice: 40.00,
      image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.6,
    },
    {
      name: 'Instant Pancit Canton - 10 Pack',
      price: 99.00,
      image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      badge: 'NEW',
      rating: 4.9,
    },
    {
      name: 'Coconut Milk Premium Quality',
      price: 55.00,
      originalPrice: 65.00,
      image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.7,
    },
    {
      name: 'Assorted Filipino Sweets Mix',
      price: 120.00,
      image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.4,
    },
  ];

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header 
          onCartClick={() => setShowCart(true)} 
          onCategoryClick={handleCategoryClick}
          onLogoClick={handleLogoClick}
          onUserClick={handleUserClick}
          selectedCategory={selectedCategory}
        />
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
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
            <button className="text-[#D32F2F] hover:text-[#B71C1C] transition-colors">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
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

      <Footer />
      </div>
    </CartProvider>
  );
}
