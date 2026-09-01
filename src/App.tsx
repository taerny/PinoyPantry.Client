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
import { StatsComparePage } from './pages/StatsComparePage';
import { HomeRunsPage } from './pages/HomeRunsPage';
import { AdminUploadPage } from './pages/AdminUploadPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminImportPage } from './pages/AdminImportPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AdminHeroPage } from './pages/AdminHeroPage';
import { ContactPage } from './pages/ContactPage';
import { PlayerStatsPage } from './pages/PlayerStatsPage';
import { DesktopLayoutPage } from './pages/DesktopLayoutPage';
import { CartProvider, useCart } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HeroContentProvider, useHeroContent } from './contexts/HeroContentContext';
import { useCategories } from './hooks/useCategories';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useCategories();
  const { showCartDrawer, setShowCartDrawer } = useCart();
  const { isAdmin, loading: authLoading } = useAuth();
  const { content: heroContent, loading: heroLoading } = useHeroContent();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Don't render the real site (even for a flash) until we know both who's asking
  // (admin or not) and whether maintenance mode is on — avoids a content flicker.
  if (authLoading || heroLoading) {
    return <div className="min-h-screen bg-white" />;
  }

  // Maintenance mode: everyone except a logged-in admin sees the maintenance page,
  // except on /login and /admin/* so admin can still sign in to turn it back off.
  const isAdminRoute = location.pathname === '/login' || location.pathname.startsWith('/admin');
  if (heroContent.isMaintenanceMode && !isAdmin && !isAdminRoute) {
    return <MaintenancePage headline={heroContent.maintenanceHeadline} message={heroContent.maintenanceMessage} />;
  }

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

  // Don't show header/footer on login page or stats pages
  const isLoginPage = location.pathname === '/login';
  const isStatsComparePage = location.pathname === '/stats-compare';
  const isHomeRunsPage = location.pathname === '/home-runs';
  const isPlayerStatsPage = location.pathname === '/player-stats';
  const isDesktopLayoutPage = location.pathname === '/desktop-layout';
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleCheckoutFromDrawer = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoginPage && !isStatsComparePage && !isHomeRunsPage && !isPlayerStatsPage && !isDesktopLayoutPage && !isAdminPage && (
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
          <Route path="/stats-compare" element={<StatsComparePage />} />
          <Route path="/home-runs" element={<HomeRunsPage />} />
          <Route path="/admin/upload" element={<AdminUploadPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/import" element={<AdminImportPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/hero" element={<AdminHeroPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/player-stats" element={<PlayerStatsPage />} />
          <Route path="/desktop-layout" element={<DesktopLayoutPage />} />
        </Routes>
      </main>

      {!isLoginPage && !isStatsComparePage && !isHomeRunsPage && !isPlayerStatsPage && !isDesktopLayoutPage && !isAdminPage && <Footer />}

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
  return (
    <BrowserRouter>
      <AuthProvider>
        <HeroContentProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </HeroContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
