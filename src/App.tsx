import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { ShoppingCartPage } from './pages/ShoppingCartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { CartProvider, useCart } from './contexts/CartContext';
import { useCategories } from './hooks/useCategories';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useCategories();
  const { showCartDrawer, setShowCartDrawer } = useCart();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Get current category from URL
  const getCurrentCategory = () => {
    if (location.pathname.startsWith('/category/')) {
      return location.pathname.split('/category/')[1];
    }
    return null;
  };

  // Navigation handlers
  const handleLogoClick = () => {
    // Always scroll to top instantly when logo is clicked (for immediate header transition)
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Navigate to home (if not already there)
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  const handleSearch = (query: string) => {
    console.log('App.tsx - handleSearch called with:', query);
    console.log('Navigating to:', `/search?q=${encodeURIComponent(query)}`);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleCartClick = () => {
    setShowCartDrawer(true);
  };

  const handleUserClick = () => {
    navigate('/login');
  };

  // Don't show header/footer on login page
  const isLoginPage = location.pathname === '/login';

  const handleCheckoutFromDrawer = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoginPage && (
        <Header
          onCartClick={handleCartClick}
          onCategoryClick={handleCategoryClick}
          onLogoClick={handleLogoClick}
          onUserClick={handleUserClick}
          onSearch={handleSearch}
          selectedCategory={getCurrentCategory()}
          categories={categories}
        />
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/cart" element={<ShoppingCartPage onClose={() => navigate(-1)} onCheckout={() => navigate('/checkout')} />} />
          <Route path="/checkout" element={<CheckoutPage onBack={() => navigate('/cart')} onComplete={() => navigate('/')} />} />
          <Route path="/login" element={<LoginPage onClose={() => navigate('/')} />} />
        </Routes>
      </main>

      {!isLoginPage && <Footer />}

      {/* Sliding Cart Drawer */}
      <CartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        onCheckout={handleCheckoutFromDrawer}
      />
    </div>
  );
}

export default function App() {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  // If maintenance mode is enabled, show maintenance page only
  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}
