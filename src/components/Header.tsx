import { ShoppingCart, Search, Menu, User, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../contexts/CartContext";
import { Category, Product } from "../types";
import ProductService from "../services/productService";

interface HeaderProps {
  onCartClick?: () => void;
  onCategoryClick?: (category: string) => void;
  onLogoClick?: () => void;
  onUserClick?: () => void;
  onSearch?: (query: string) => void;
  selectedCategory?: string | null;
  categories?: Category[];
}

export function Header({
  onCartClick,
  onCategoryClick,
  onLogoClick,
  onUserClick,
  onSearch,
  selectedCategory,
  categories = [],
}: HeaderProps) {
  const { getCartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const cartCount = getCartCount();

  // Track scroll position for header effects
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Immediately expand header when at top (0px)
          if (currentScrollY === 0 && isScrolled) {
            setIsScrolled(false);
          }
          // Hide banner when scrolled past 30px
          else if (currentScrollY > 30 && !isScrolled) {
            setIsScrolled(true);
          }
          // Show banner when scrolled back near top (<=5px)
          else if (currentScrollY <= 5 && currentScrollY > 0 && isScrolled) {
            setIsScrolled(false);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // Fetch search suggestions with debouncing
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if query is too short
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search (wait 300ms after user stops typing)
    setIsLoadingSuggestions(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await ProductService.searchProducts(searchQuery.trim());
        setSuggestions(results.slice(0, 5)); // Show top 5 suggestions
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
      setShowSuggestions(false);
      setIsMobileSearchOpen(false);
    }
  };

  const handleSuggestionClick = (productName: string) => {
    if (onSearch) {
      onSearch(productName);
      setSearchQuery('');
      setShowSuggestions(false);
      setIsMobileSearchOpen(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length < 2) {
      setShowSuggestions(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 bg-[beige] transition-shadow duration-300 ${
      isScrolled ? 'shadow-lg' : 'shadow-md'
    }`}>
      {/* Top Bar - Fast fade out when scrolled */}
      <div className={`bg-[#F9A825] transition-all duration-300 overflow-hidden ${
        isScrolled ? 'h-0 opacity-0' : 'h-8 opacity-100'
      }`}>
        <div className="container mx-auto px-4 h-full">
          <p className={`text-center text-sm text-[#3E2723] py-2 transition-opacity duration-300 ${
            isScrolled ? 'opacity-0' : 'opacity-100'
          }`}>
            Free shipping on orders over $100! 🇳🇿
          </p>
        </div>
      </div>

      {/* Main Header - Fixed height to prevent layout shift */}
      <div className="container mx-auto px-4 py-3 min-h-[80px] flex items-center">
        <div className="flex items-center w-full gap-4">
          {/* Logo - Shrinks quickly when scrolled */}
          <button onClick={onLogoClick} className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/images/logo.png"
              alt="PinoyPantry Logo"
              className={`w-auto transition-all duration-300 hover:[transform:rotate(3deg)] active:[transform:rotate(-3deg)_scale(0.95)] ${
                isScrolled ? 'h-12' : 'h-16 lg:h-20'
              }`}
            />
          </button>

          {/* Search Bar - Always on right, shrinks when scrolled */}
          <div ref={searchContainerRef} className={`hidden md:flex ml-auto transition-all duration-300 ${
            isScrolled ? 'max-w-md' : 'max-w-xl'
          } relative`}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Search products..."
                  className={`w-full px-4 pr-12 rounded-full text-[#3E2723] bg-white border-2 border-white/20 shadow-md focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-[#F9A825] transition-all duration-300 ${
                    isScrolled ? 'py-2 text-sm' : 'py-2.5'
                  }`}
                />
                <button 
                  type="submit"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 bg-[#D32F2F] text-white rounded-full flex items-center justify-center hover:bg-[#B71C1C] transition-all duration-300 ${
                    isScrolled ? 'w-7 h-7' : 'w-8 h-8'
                  }`}
                >
                  <Search className={`transition-all duration-300 ${isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                </button>
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (searchQuery.trim().length >= 2) && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                {isLoadingSuggestions ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin inline-block w-5 h-5 border-2 border-[#F9A825] border-t-transparent rounded-full"></div>
                    <p className="mt-2 text-sm">Searching...</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs text-gray-500 font-semibold uppercase">
                      Suggested Products
                    </div>
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSuggestionClick(product.name)}
                        className="w-full px-4 py-3 hover:bg-[#FAF3E0] transition-colors flex items-center gap-3 text-left border-t border-gray-100"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#3E2723] truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#D32F2F] font-semibold">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    ))}
                    <button
                      onClick={handleSearch}
                      className="w-full px-4 py-3 text-sm text-[#F9A825] hover:bg-[#FAF3E0] transition-colors font-medium border-t border-gray-200"
                    >
                      See all results for "{searchQuery}" →
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">No products found</p>
                    <p className="text-xs mt-1">Try different keywords</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icons - Fixed size, Always on right */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto md:ml-0">
            <button
              className="md:hidden text-[#3E2723] hover:text-[#F9A825] transition-colors"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="text-[#3E2723] hover:text-[#F9A825] transition-colors hidden md:block"
              onClick={onUserClick}
            >
              <User className="w-5 h-5" />
            </button>
            <button
              className="relative text-[#3E2723] hover:text-[#F9A825] transition-colors"
              onClick={onCartClick}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D32F2F] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden text-[#3E2723] hover:text-[#F9A825] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileSearchOpen && (
          <div className="md:hidden mt-4 relative">
            <form onSubmit={handleSearch}>
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Search products..."
                  autoFocus
                  className="w-full px-4 py-3 pr-12 rounded-full text-[#3E2723] bg-white border-2 border-white/20 shadow-md focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-[#F9A825] transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#D32F2F] text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-[#B71C1C] transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Mobile Search Suggestions */}
            {showSuggestions && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                {isLoadingSuggestions ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin inline-block w-5 h-5 border-2 border-[#F9A825] border-t-transparent rounded-full"></div>
                    <p className="mt-2 text-sm">Searching...</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs text-gray-500 font-semibold uppercase">
                      Suggested Products
                    </div>
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSuggestionClick(product.name)}
                        className="w-full px-4 py-3 hover:bg-[#FAF3E0] transition-colors flex items-center gap-3 text-left border-t border-gray-100"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#3E2723] truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#D32F2F] font-semibold">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    ))}
                    <button
                      onClick={handleSearch}
                      className="w-full px-4 py-3 text-sm text-[#F9A825] hover:bg-[#FAF3E0] transition-colors font-medium border-t border-gray-200"
                    >
                      See all results for "{searchQuery}" →
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">No products found</p>
                    <p className="text-xs mt-1">Try different keywords</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Navigation - Fixed height */}
      <nav className="bg-[#4A332E] border-t border-[#6D4C41] hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-8 py-2.5 overflow-x-auto">
            <li>
              <button
                onClick={() => onCategoryClick?.("all-products")}
                className={`text-white hover:text-[#F9A825] hover:bg-[#F9A825]/10 transition-all whitespace-nowrap pb-1 px-3 py-1 rounded-t-lg ${
                  selectedCategory === "all-products"
                    ? "text-[#F9A825] bg-[#F9A825]/10 border-b-2 border-[#F9A825]"
                    : ""
                }`}
              >
                All Products
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <button
                  onClick={() => onCategoryClick?.(category.slug)}
                  className={`text-white hover:text-[#F9A825] hover:bg-[#F9A825]/10 transition-all whitespace-nowrap pb-1 px-3 py-1 rounded-t-lg ${
                    selectedCategory === category.slug
                      ? "text-[#F9A825] bg-[#F9A825]/10 border-b-2 border-[#F9A825]"
                      : ""
                  }`}
                >
                  {category.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#4A332E] border-t border-[#6D4C41]">
          <div className="container mx-auto px-4 py-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    onCategoryClick?.("all-products");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-white block py-2 px-3 hover:text-[#F9A825] hover:bg-[#F9A825]/10 transition-all w-full text-left rounded-lg ${
                    selectedCategory === "all-products"
                      ? "text-[#F9A825] bg-[#F9A825]/10 border-l-4 border-[#F9A825] pl-3"
                      : ""
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <button
                    onClick={() => {
                      onCategoryClick?.(category.slug);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-white block py-2 px-3 hover:text-[#F9A825] hover:bg-[#F9A825]/10 transition-all w-full text-left rounded-lg ${
                      selectedCategory === category.slug
                        ? "text-[#F9A825] bg-[#F9A825]/10 border-l-4 border-[#F9A825] pl-3"
                        : ""
                    }`}
                  >
                    {category.title}
                  </button>
                </li>
              ))}
              <li className="pt-4 border-t border-[#6D4C41]">
                <button
                  onClick={() => {
                    onUserClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-white block py-2 hover:text-[#F9A825] transition-colors flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  My Account
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
