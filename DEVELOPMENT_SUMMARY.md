# PinoyPantry E-Commerce Development Summary

**Date:** January 17-18, 2026  
**Developer Learning Document**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Dependencies](#tech-stack--dependencies)
3. [Architecture & Project Structure](#architecture--project-structure)
4. [Features Implemented](#features-implemented)
5. [Routing Implementation](#routing-implementation)
6. [State Management](#state-management)
7. [UI/UX Enhancements](#uiux-enhancements)
8. [Performance Optimizations](#performance-optimizations)
9. [Best Practices Applied](#best-practices-applied)
10. [Key Learnings](#key-learnings)

---

## Project Overview

**PinoyPantry** is a modern e-commerce web application built for selling Filipino pantry products in New Zealand. The application integrates with Shopify's Storefront API for product management and features a fully custom React frontend.

### Core Objectives:
- Modern, responsive UI/UX
- Fast performance with skeleton loading
- Seamless shopping experience
- Mobile-first design
- Integration with Shopify backend

---

## Tech Stack & Dependencies

### Frontend Framework
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "typescript": "^5.x",
  "vite": "^6.x"
}
```

### Routing
```json
{
  "react-router-dom": "^6.x"
}
```
**Why React Router?**
- Client-side routing for SPA experience
- URL-based navigation improves SEO
- Browser history management
- Dynamic route parameters
- Cleaner URL structure

### UI Components & Styling
```json
{
  "@radix-ui/react-*": "Various components",
  "tailwindcss": "^3.x",
  "lucide-react": "Icon library"
}
```

**Radix UI Benefits:**
- Accessible by default (ARIA compliant)
- Unstyled (full styling control)
- Composable components
- Keyboard navigation support

### Shopify Integration
```json
{
  "@shopify/hydrogen-react": "Storefront API client"
}
```

**API Configuration:**
- API Version: `2025-07`
- Access: Storefront API (GraphQL)
- Features: Products, Collections, Search

### Fonts
- **Google Fonts:** Poppins (300, 400, 500, 600, 700, 800)

---

## Architecture & Project Structure

### Directory Structure
```
src/
├── components/         # Reusable UI components
│   ├── Header.tsx     # Navigation, search, cart
│   ├── ProductCard.tsx # Product display
│   ├── CartDrawer.tsx  # Sliding cart panel
│   ├── Skeleton.tsx    # Loading states
│   └── figma/         # Design system components
│
├── pages/             # Route-based pages
│   ├── HomePage.tsx   # Landing page
│   ├── CategoryPage.tsx
│   ├── SearchResultsPage.tsx
│   ├── ShoppingCartPage.tsx
│   └── CheckoutPage.tsx
│
├── contexts/          # React Context providers
│   └── CartContext.tsx # Global cart state
│
├── hooks/             # Custom React hooks
│   ├── useCategories.ts
│   ├── useProducts.ts
│   ├── useFeaturedProducts.ts
│   └── useProductsByCategory.ts
│
├── services/          # Business logic & API calls
│   ├── shopifyProductService.ts
│   └── productService.ts
│
├── types/             # TypeScript definitions
│   ├── product.types.ts
│   └── cart.types.ts
│
└── App.tsx            # Root component with routing
```

### Design Patterns Used

#### 1. **Service Layer Pattern**
**Purpose:** Separate API logic from components

```typescript
// services/shopifyProductService.ts
class ShopifyProductService {
  async getProducts(): Promise<Product[]> {
    // GraphQL API calls
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    // Search logic
  }
}
```

**Benefits:**
- Single source of truth for API calls
- Easy to mock for testing
- Can switch backends without touching components
- Centralized error handling

#### 2. **Custom Hooks Pattern**
**Purpose:** Reusable stateful logic

```typescript
// hooks/useProducts.ts
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Fetch logic
  }, []);
  
  return { products, loading, error };
};
```

**Benefits:**
- Reusable across components
- Encapsulates loading/error states
- Easy to test
- Cleaner components

#### 3. **Context API for Global State**
**Purpose:** Share cart state across app

```typescript
// contexts/CartContext.tsx
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  
  // Cart operations...
  
  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeItem, ... }}>
      {children}
    </CartContext.Provider>
  );
};
```

**Benefits:**
- Avoids prop drilling
- Global cart state
- Persistent across navigation
- Single source of truth

---

## Features Implemented

### 1. React Router Implementation

**Problem:** Initially, all navigation happened on the same URL (index page). No proper routing, no browser history, poor SEO.

**Solution:** Implemented React Router for proper client-side routing.

#### Installation:
```bash
npm install react-router-dom
```

#### App Structure:
```typescript
// App.tsx
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <>
      <Header onSearch={(query) => navigate(`/search?q=${query}`)} />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/cart" element={<ShoppingCartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
      
      <CartDrawer />
    </>
  );
}
```

#### Key Concepts:

**1. Dynamic Routes:**
```typescript
// Route definition
<Route path="/category/:slug" element={<CategoryPage />} />

// In CategoryPage.tsx
import { useParams } from 'react-router-dom';

const CategoryPage = () => {
  const { slug } = useParams(); // Gets 'rice-grains' from /category/rice-grains
  // Use slug to fetch category products
};
```

**2. Query Parameters:**
```typescript
// Route definition
<Route path="/search" element={<SearchResultsPage />} />

// In SearchResultsPage.tsx
import { useSearchParams } from 'react-router-dom';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); // Gets 'adobo' from /search?q=adobo
};
```

**3. Programmatic Navigation:**
```typescript
const navigate = useNavigate();

// Navigate on search
const handleSearch = (query: string) => {
  navigate(`/search?q=${query}`);
};

// Navigate on category click
const handleCategoryClick = (slug: string) => {
  navigate(`/category/${slug}`);
};
```

**Benefits:**
- ✅ Clean URLs: `/category/rice-grains` instead of `/?category=rice-grains`
- ✅ Browser back/forward works
- ✅ Can bookmark/share specific pages
- ✅ Better SEO
- ✅ Cleaner code organization

---

### 2. Search Functionality with Autocomplete

**Implementation:** Real-time search with live suggestions

#### Features:
- Debounced input (300ms delay)
- Live product suggestions
- Minimum 2 characters to trigger
- Click outside to close
- Keyboard navigation support

#### Code Structure:
```typescript
// Header.tsx
const Header = ({ onSearch }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const results = await ProductService.searchProducts(searchQuery, 5);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && 
          !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
};
```

#### Shopify Search API Implementation:
```typescript
// services/shopifyProductService.ts
async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
  // Format query with wildcards for partial matching
  const formattedQuery = query
    .trim()
    .split(/\s+/)
    .map(word => `title:*${word}* OR tag:*${word}*`)
    .join(' OR ');

  const SEARCH_QUERY = `
    query SearchProducts($query: String!, $first: Int!) {
      search(query: $query, first: $first, types: PRODUCT) {
        edges {
          node {
            ... on Product {
              id
              title
              handle
              description
              tags
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await this.client.request(SEARCH_QUERY, {
    variables: { query: formattedQuery, first: limit },
  });

  // Transform and return products
}
```

#### Key Learnings:

**1. Debouncing:**
- Prevents excessive API calls
- Waits for user to stop typing
- 300ms is optimal (not too fast, not too slow)
- Must cleanup timeout on unmount

**2. Click Outside Detection:**
```typescript
const handleClickOutside = (event: MouseEvent) => {
  if (ref.current && !ref.current.contains(event.target as Node)) {
    // Clicked outside
    setShowSuggestions(false);
  }
};
```

**3. Wildcard Search:**
- `title:*adobo*` matches "Adobo Sauce", "Pork Adobo", etc.
- More flexible than exact match
- Better UX for users

---

### 3. Currency Display Update

**Change:** PHP (₱) → NZD ($)

**Why:** PinoyPantry operates in New Zealand market.

#### Files Updated:
1. **ProductCard.tsx**
```typescript
// Before
<span className="text-xs font-bold">₱{price?.toFixed(2) || '0.00'}</span>

// After
<span className="text-xs font-bold">${price?.toFixed(2) || '0.00'}</span>
```

2. **Header.tsx** - Free shipping banner
```typescript
// Before
Free shipping on orders over ₱999

// After
Free shipping on orders over $50
```

3. **ShoppingCartPage.tsx** & **CheckoutPage.tsx**
- Updated all price displays
- Updated free shipping threshold

#### Defensive Programming:
```typescript
${price?.toFixed(2) || '0.00'}
```
- `?.` optional chaining prevents crash if price is null/undefined
- `|| '0.00'` provides fallback value

---

### 4. Sticky Header with Smooth Animations

**Challenge:** Create sticky header that doesn't cause scroll jitter or layout shifts.

#### Requirements:
- Logo visible on scroll (shrinks)
- Free shipping banner hides smoothly
- Search bar stays visible (shrinks)
- No layout shifts (constant height)
- Smooth animations

#### Implementation:
```typescript
// Header.tsx
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        
        // Immediate expand at top
        if (currentScrollY === 0) {
          setIsScrolled(false);
          scrollPositionRef.current = 0;
          return;
        }

        // Hysteresis: threshold to prevent jitter
        const SCROLL_THRESHOLD = 50;
        const scrollDiff = Math.abs(currentScrollY - scrollPositionRef.current);

        if (scrollDiff > SCROLL_THRESHOLD) {
          setIsScrolled(currentScrollY > 50);
          scrollPositionRef.current = currentScrollY;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Free Shipping Banner - Animates height and opacity together */}
      <div className={`bg-gradient-to-r from-[#F9A825] to-[#FFC107] overflow-hidden transition-all duration-500 ${
        isScrolled ? 'h-0 opacity-0' : 'h-10 opacity-100'
      }`}>
        <div className={`flex items-center justify-center h-10 transition-opacity duration-500 ${
          isScrolled ? 'opacity-0' : 'opacity-100'
        }`}>
          <p className="text-sm text-[#3E2723] font-medium">
            Free shipping on orders over $50
          </p>
        </div>
      </div>

      {/* Main Header - Fixed height prevents layout shift */}
      <div className="container mx-auto px-4 py-3 min-h-[80px] flex items-center">
        {/* Logo - Shrinks on scroll */}
        <img
          src="/images/logo.png"
          alt="PinoyPantry Logo"
          className={`transition-all duration-300 ${
            isScrolled ? 'h-12' : 'h-16 lg:h-20'
          }`}
        />

        {/* Search Bar - Shrinks and moves right */}
        <div className={`ml-auto transition-all duration-300 ${
          isScrolled ? 'max-w-md' : 'max-w-xl'
        }`}>
          {/* Search input */}
        </div>
      </div>
    </header>
  );
};
```

#### Key Techniques:

**1. `requestAnimationFrame`:**
- Syncs with browser repaint cycle
- Prevents scroll jitter
- Better performance than direct state updates

**2. Hysteresis:**
```typescript
const SCROLL_THRESHOLD = 50;
const scrollDiff = Math.abs(currentScrollY - scrollPositionRef.current);

if (scrollDiff > SCROLL_THRESHOLD) {
  // Only update if scrolled enough
}
```
- Prevents flickering on small scroll movements
- Makes animations feel intentional

**3. Fixed Height Container:**
```typescript
<div className="min-h-[80px]">
```
- Prevents layout shifts
- Elements inside can shrink/grow
- Container stays constant height

**4. Simultaneous Animations:**
```typescript
className={`transition-all duration-500 ${
  isScrolled ? 'h-0 opacity-0' : 'h-10 opacity-100'
}`}
```
- `transition-all` animates both height and opacity
- Same duration ensures synchronized fade

---

### 5. Cart Drawer Feature

**Feature:** Sliding cart panel from right side when items added.

#### User Flow:
1. User clicks "Add to Cart"
2. Cart drawer slides in from right
3. Shows cart items, quantities, prices
4. Can update quantities or remove items
5. Shows subtotal, shipping, total
6. Free shipping progress indicator
7. Can close or proceed to checkout

#### Implementation:

**Step 1: Context Setup**
```typescript
// contexts/CartContext.tsx
interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  showCartDrawer: boolean;
  setShowCartDrawer: (show: boolean) => void;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  const addToCart = (product: Product) => {
    // Add or update quantity
    setShowCartDrawer(true); // Auto-open drawer
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      addToCart,
      removeItem,
      updateQuantity,
      showCartDrawer,
      setShowCartDrawer,
    }}>
      {children}
    </CartContext.Provider>
  );
};
```

**Step 2: Cart Drawer Component**
```typescript
// components/CartDrawer.tsx
export const CartDrawer = () => {
  const { cartItems, showCartDrawer, setShowCartDrawer, updateQuantity, removeItem } = useCart();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = 50;
  const shipping = subtotal >= freeShippingThreshold ? 0 : 8;
  const total = subtotal + shipping;
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          showCartDrawer ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowCartDrawer(false)}
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          showCartDrawer ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Shopping Cart ({cartItems.length})</h2>
          <button onClick={() => setShowCartDrawer(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {subtotal < freeShippingThreshold && (
          <div className="p-4 bg-amber-50">
            <div className="flex justify-between text-xs mb-1">
              <span>Add ${(freeShippingThreshold - subtotal).toFixed(2)} for free shipping!</span>
              <span>{shippingProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex gap-3 p-2 border-b">
              <img src={item.image} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1">
                <h3 className="text-xs font-semibold">{item.name}</h3>
                <p className="text-xs text-gray-600">${item.price.toFixed(2)}</p>
                
                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-5 h-5 flex items-center justify-center border rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-5 h-5 flex items-center justify-center border rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => removeItem(item.id)}>
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="text-xs font-bold">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer with totals */}
        <div className="border-t p-4">
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button className="w-full bg-[#D32F2F] text-white py-3 rounded-lg font-bold">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
};
```

#### Key Concepts:

**1. Slide Animation:**
```typescript
className={`transform transition-transform duration-300 ${
  showCartDrawer ? 'translate-x-0' : 'translate-x-full'
}`}
```
- `translate-x-full` moves 100% right (hidden)
- `translate-x-0` brings it back (visible)
- `transition-transform` animates the movement

**2. Backdrop Overlay:**
```typescript
<div className={`fixed inset-0 bg-black ${
  showCartDrawer ? 'opacity-50' : 'opacity-0 pointer-events-none'
}`} />
```
- `fixed inset-0` covers entire screen
- `pointer-events-none` when hidden (allows clicks through)
- Semi-transparent black overlay

**3. Quantity Management:**
```typescript
const updateQuantity = (productId: string, delta: number) => {
  setCartItems(prevItems =>
    prevItems.map(item =>
      item.id === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0)
  );
};
```
- `delta` can be +1 or -1
- `Math.max(1, ...)` ensures minimum quantity of 1
- `.filter()` removes items with 0 quantity

**4. Free Shipping Progress:**
```typescript
const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
```
- Calculates percentage towards free shipping
- `Math.min(..., 100)` caps at 100%
- Visual progress bar motivates users

---

### 6. Skeleton Loading States

**Purpose:** Show loading placeholders while data fetches.

**Why?**
- Better perceived performance
- Prevents layout shift
- Users know content is coming
- More professional feel

#### Implementation:
```typescript
// components/Skeleton.tsx
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-2 animate-pulse">
      {/* Image skeleton */}
      <div className="w-full aspect-square bg-gray-200 rounded-lg mb-2" />
      
      {/* Badge skeleton */}
      <div className="h-4 w-16 bg-gray-200 rounded mb-1" />
      
      {/* Title skeleton */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
      
      {/* Price skeleton */}
      <div className="h-5 bg-gray-200 rounded w-20 mb-2" />
      
      {/* Stars skeleton */}
      <div className="flex gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-3 h-3 bg-gray-200 rounded" />
        ))}
      </div>
      
      {/* Button skeleton */}
      <div className="h-8 bg-gray-200 rounded" />
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
```

#### Usage:
```typescript
// pages/CategoryPage.tsx
const CategoryPage = () => {
  const { slug } = useParams();
  const { products, loading, error } = useProductsByCategory(slug || '');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductGridSkeleton count={12} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
};
```

#### Key Technique:
```css
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```
- Pulsing animation creates "shimmer" effect
- Gray placeholders match content layout
- Smooth transition when content loads

---

### 7. Homepage Visual Enhancements

**Goal:** Make homepage more "standout" and modern.

#### Changes Made:

**1. Typography - Poppins Font**
```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

```css
/* src/index.css */
@layer base {
  * {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  body {
    @apply antialiased;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold;
  }
}
```

**Why Poppins?**
- Modern geometric sans-serif
- Excellent readability
- Professional yet friendly
- Multiple weights for hierarchy
- Popular in e-commerce

**2. Features Section Enhancement**
```typescript
// Before
<h4 className="font-semibold text-[#3E2723] mb-1">Authentic Products</h4>

// After
<h4 className="font-bold text-[#3E2723] mb-1 tracking-tight text-base">
  Authentic Products
</h4>
```

Changes:
- `font-semibold` → `font-bold` (bolder)
- Added `tracking-tight` (tighter letter spacing)
- Added `text-base` (slightly larger)
- Made subtext `font-medium` (bolder)

**Visual Impact:**
- More prominent feature titles
- Better hierarchy
- Easier to scan
- More professional

**3. Gradient Icon Backgrounds**
```typescript
<div className="w-16 h-16 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] rounded-2xl 
               flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
  <Package className="w-8 h-8 text-white" />
</div>
```

Features:
- Gradient backgrounds (brand colors)
- Hover scale effect
- Drop shadow for depth
- Smooth transitions

**4. Categories Section Redesign**
```typescript
<section className="py-16 bg-gradient-to-b from-white via-amber-50/30 to-white relative overflow-hidden">
  {/* Decorative background */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute top-10 left-10 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
    <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-400 rounded-full blur-3xl" />
  </div>

  <div className="container mx-auto px-4 relative z-10">
    {/* "EXPLORE" badge */}
    <span className="inline-block px-4 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold tracking-wider mb-3">
      EXPLORE
    </span>
    
    <h2 className="text-4xl md:text-5xl font-bold text-[#3E2723] mb-3">
      Shop by Category
    </h2>
  </div>
</section>
```

Enhancements:
- Gradient background
- Decorative blur circles
- Badge above heading
- Larger heading text
- Better spacing

**5. Newsletter Section**
```typescript
<section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
  {/* Dotted pattern overlay */}
  <div className="absolute inset-0 opacity-10" 
       style={{
         backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
         backgroundSize: '20px 20px'
       }} 
  />

  <div className="container mx-auto px-4 relative z-10">
    {/* Glassmorphism input */}
    <input
      type="email"
      placeholder="Your email address"
      className="flex-1 px-6 py-4 rounded-l-xl bg-white/10 backdrop-blur-md border border-white/20 
                 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
    />
    
    <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 
                       font-bold rounded-r-xl hover:from-amber-600 hover:to-amber-700 
                       transform hover:scale-105 transition-all shadow-lg">
      Subscribe
    </button>
  </div>
</section>
```

Features:
- Dark gradient background
- Dotted pattern texture
- Glassmorphism input (frosted glass effect)
- Gradient button with hover effects
- Scale animation on hover

---

### 8. Mobile Responsiveness

**Key Areas:**

**1. Hamburger Menu Position**
```typescript
// Before - Hamburger could be misaligned on mobile

// After - Always on right side
<div className="flex items-center gap-3 flex-shrink-0 ml-auto md:ml-0">
  {/* Icons */}
  <button className="md:hidden">
    <Menu className="w-5 h-5" />
  </button>
</div>
```

- `ml-auto` on mobile pushes icons right
- `md:ml-0` removes margin on desktop (search bar already has `ml-auto`)

**2. Responsive Grid**
```typescript
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
  {products.map(product => <ProductCard key={product.id} {...product} />)}
</div>
```

- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 4 columns

**3. Responsive Typography**
```typescript
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
  Welcome to PinoyPantry
</h1>
```

- Mobile: 4xl
- Tablet: 5xl
- Desktop: 6xl

**4. Cart Drawer Width**
```typescript
<div className="w-full md:w-96">
```

- Mobile: Full width
- Desktop: Fixed 384px (24rem)

---

## Performance Optimizations

### 1. Shopify Prompt Caching

**What is it?**
Shopify/Claude API caches frequently accessed context to reduce costs.

**How it works:**
```typescript
// First request - Full cost
Input: 100,000 tokens
Cache Write: 100,000 tokens (1.25x cost)
Output: 1,000 tokens
Cost: High

// Second request - Cached
Input (w/o Cache): 1,000 tokens (new content only)
Cache Read: 100,000 tokens (0.1x cost - 90% cheaper!)
Output: 1,000 tokens
Cost: Low
```

**How to maximize cache:**
1. Keep files open during sessions
2. Don't restart Cursor frequently
3. Work in batches on related files
4. Continue same conversation thread
5. Work on fewer files per session

### 2. React Component Optimization

**Memoization:**
```typescript
// Expensive component that doesn't need to re-render often
const ProductCard = React.memo(({ name, price, image, onAddToCart }: ProductCardProps) => {
  // Component logic
});
```

**useMemo for expensive calculations:**
```typescript
const filteredProducts = useMemo(() => {
  return products
    .filter(p => p.category === selectedCategory)
    .sort((a, b) => sortFunction(a, b));
}, [products, selectedCategory, sortFunction]);
```

**useCallback for stable function references:**
```typescript
const handleAddToCart = useCallback((product: Product) => {
  addToCart(product);
  setShowCartDrawer(true);
}, [addToCart, setShowCartDrawer]);
```

### 3. Image Optimization

**Fallback Images:**
```typescript
export const ImageWithFallback = ({ src, alt, fallback = '/images/placeholder.png' }: ImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallback)}
      loading="lazy"
    />
  );
};
```

**Lazy Loading:**
```typescript
<img src={image} alt={name} loading="lazy" />
```
- Defers loading off-screen images
- Improves initial page load
- Native browser feature

### 4. Code Splitting

**Route-based splitting:**
```typescript
const HomePage = lazy(() => import('./pages/HomePage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));

<Suspense fallback={<LoadingSkeleton />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/category/:slug" element={<CategoryPage />} />
  </Routes>
</Suspense>
```

- Only loads code for current route
- Reduces initial bundle size
- Faster first paint

---

## Best Practices Applied

### 1. TypeScript for Type Safety

**Interface Definitions:**
```typescript
// types/product.types.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  inStock: boolean;
  rating: number;
}

export interface CartItem extends Product {
  quantity: number;
}
```

**Benefits:**
- Catches errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring

### 2. Component Composition

**Small, reusable components:**
```typescript
// Bad - Monolithic component
const ProductPage = () => {
  return (
    <div>
      {/* 500 lines of JSX */}
    </div>
  );
};

// Good - Composed components
const ProductPage = () => {
  return (
    <>
      <ProductHeader />
      <ProductGallery />
      <ProductInfo />
      <ProductReviews />
      <RelatedProducts />
    </>
  );
};
```

### 3. Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 4. Defensive Programming

**Always handle null/undefined:**
```typescript
// ❌ Bad
const price = product.price.toFixed(2);

// ✅ Good
const price = product?.price?.toFixed(2) || '0.00';
```

**Always handle errors:**
```typescript
try {
  const products = await ProductService.getProducts();
  setProducts(products);
} catch (error) {
  console.error('Error fetching products:', error);
  setError(error);
} finally {
  setLoading(false);
}
```

### 5. Accessibility (a11y)

**Semantic HTML:**
```typescript
// ✅ Good
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

// ❌ Bad
<div className="header">
  <div className="nav">
    <div className="link">Home</div>
  </div>
</div>
```

**ARIA labels:**
```typescript
<button aria-label="Add to cart">
  <ShoppingCart />
</button>

<input
  type="search"
  aria-label="Search products"
  placeholder="Search..."
/>
```

**Keyboard navigation:**
```typescript
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</button>
```

---

## Key Learnings

### 1. React Router Fundamentals

**Key Concepts:**
- `BrowserRouter` wraps entire app
- `Routes` and `Route` define path mappings
- `useNavigate()` for programmatic navigation
- `useParams()` for URL parameters
- `useSearchParams()` for query strings
- `useLocation()` for current path

**When to use:**
- Multi-page applications
- SEO requirements
- Shareable URLs
- Browser history support

### 2. React Context API

**When to use Context:**
- Global state (cart, user, theme)
- Prop drilling becomes painful
- State needs to be accessed by many components

**Pattern:**
```typescript
// 1. Create context
const MyContext = createContext<Type | undefined>(undefined);

// 2. Create provider
export const MyProvider = ({ children }) => {
  const [state, setState] = useState();
  return <MyContext.Provider value={{ state, setState }}>{children}</MyContext.Provider>;
};

// 3. Create custom hook
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) throw new Error('useMyContext must be used within MyProvider');
  return context;
};

// 4. Use in components
const Component = () => {
  const { state, setState } = useMyContext();
};
```

### 3. Debouncing & Throttling

**Debouncing:** Wait for user to stop typing
```typescript
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
```

**Throttling:** Limit function calls per time period
```typescript
const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};
```

**When to use:**
- Debouncing: Search input, resize events
- Throttling: Scroll events, mousemove

### 4. CSS Transitions vs Animations

**Transitions:** Between two states
```css
.element {
  transition: all 0.3s ease-in-out;
}
.element:hover {
  transform: scale(1.1);
}
```

**Animations:** Complex, multi-step
```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
.element {
  animation: fadeIn 0.5s ease-in;
}
```

### 5. Shopify Integration Best Practices

**GraphQL Query Structure:**
```graphql
query GetProducts {
  products(first: 20) {
    edges {
      node {
        id
        title
        # Only request fields you need
      }
    }
  }
}
```

**Error Handling:**
```typescript
if (response.errors) {
  console.error('Shopify API errors:', response.errors);
  throw new Error('Failed to fetch from Shopify');
}

if (!response.data) {
  throw new Error('No data returned from Shopify');
}
```

**Defensive Data Access:**
```typescript
const products = response.data?.products?.edges?.map(edge => edge.node) || [];
```

---

## Common Pitfalls & Solutions

### 1. Infinite Re-renders

**Problem:**
```typescript
// ❌ Bad - Creates new function every render
const Component = () => {
  return <Child onClick={() => console.log('clicked')} />;
};
```

**Solution:**
```typescript
// ✅ Good - Stable reference
const Component = () => {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <Child onClick={handleClick} />;
};
```

### 2. Stale Closures in useEffect

**Problem:**
```typescript
// ❌ Bad - Uses stale value
useEffect(() => {
  setTimeout(() => {
    console.log(count); // Always logs initial value
  }, 1000);
}, []); // Empty deps - captures initial count
```

**Solution:**
```typescript
// ✅ Good - Always uses current value
useEffect(() => {
  setTimeout(() => {
    console.log(count);
  }, 1000);
}, [count]); // Include dependency
```

### 3. Not Cleaning Up Side Effects

**Problem:**
```typescript
// ❌ Bad - Event listener never removed
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
}, []);
```

**Solution:**
```typescript
// ✅ Good - Cleanup function
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);
```

### 4. Mutating State Directly

**Problem:**
```typescript
// ❌ Bad - Direct mutation
const handleClick = () => {
  cartItems.push(newItem);
  setCartItems(cartItems); // React won't detect change!
};
```

**Solution:**
```typescript
// ✅ Good - Create new array
const handleClick = () => {
  setCartItems([...cartItems, newItem]);
};
```

---

## Testing Recommendations

### Unit Tests (Jest + React Testing Library)
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('displays product information', () => {
    const product = {
      name: 'Adobo Sauce',
      price: 5.99,
      image: '/test.jpg',
    };
    
    render(<ProductCard {...product} />);
    
    expect(screen.getByText('Adobo Sauce')).toBeInTheDocument();
    expect(screen.getByText('$5.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard {...product} onAddToCart={mockAddToCart} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests
```typescript
describe('Shopping Cart Flow', () => {
  it('adds product to cart and shows in drawer', () => {
    render(
      <CartProvider>
        <App />
      </CartProvider>
    );
    
    // Click product
    fireEvent.click(screen.getByText('Adobo Sauce'));
    
    // Click add to cart
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    
    // Cart drawer should open
    expect(screen.getByText(/shopping cart/i)).toBeInTheDocument();
    
    // Product should be in cart
    expect(screen.getByText('Adobo Sauce')).toBeInTheDocument();
  });
});
```

---

## Future Improvements

### 1. Authentication
- User login/registration
- Social login (Google, Facebook)
- Password reset
- Email verification

### 2. Payment Integration
- Stripe/PayPal integration
- Multiple payment methods
- Saved payment methods
- Order confirmation emails

### 3. Advanced Features
- Product reviews/ratings
- Wishlist functionality
- Product recommendations
- Recent viewed products
- Compare products

### 4. Performance
- Service Worker for offline support
- PWA (Progressive Web App)
- Image optimization (WebP, lazy loading)
- Bundle size optimization

### 5. Analytics
- Google Analytics
- Conversion tracking
- User behavior tracking
- A/B testing

---

## Resources & References

### Documentation
- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Shopify Storefront API](https://shopify.dev/api/storefront)

### Tools Used
- **Vite:** Build tool
- **TypeScript:** Type safety
- **ESLint:** Code linting
- **Prettier:** Code formatting
- **Git:** Version control

### Best Practice Guides
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Web Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Conclusion

This document covered the complete development journey of PinoyPantry e-commerce platform, including:

✅ **Routing:** React Router implementation for proper navigation  
✅ **State Management:** Context API for global cart state  
✅ **Search:** Real-time search with autocomplete  
✅ **UI/UX:** Sticky header, cart drawer, skeleton loading  
✅ **Styling:** Modern design with Poppins font, gradients, animations  
✅ **Performance:** Caching, lazy loading, optimization techniques  
✅ **Best Practices:** TypeScript, component composition, error handling  

**Key Takeaway:** Building a modern e-commerce site requires careful attention to user experience, performance, and maintainable code architecture. Every decision—from routing to animations—impacts the final product.

---

**Happy Coding! 🚀**

*Last Updated: January 18, 2026*

---

---

# Session Log — March 25, 2026

**Topics Covered:**
1. Azure SQL Database auto-paused — diagnosis and fix
2. Switching Azure SQL to the Basic (paid) tier
3. Footer copyright year update
4. Replacing exposed email address with a Contact Us form page

---

## Issue 1 — Azure SQL Database Auto-Paused

### What happened

The live website at `https://gentle-dune-0c69a8700.6.azurestaticapps.net` stopped showing products after approximately 2 weeks of inactivity. The API at `https://pinoypantry-api-f0a8hbfwc6fwdfbg.australiaeast-01.azurewebsites.net` was returning `HTTP 500.30 - ASP.NET Core app failed to start`.

The root cause was the **Azure SQL Database was paused** — not a code problem.

### Why it paused

The database was on the **Azure SQL Free Offer (Serverless tier)**. This tier has two separate pause triggers:

| Pause Type | Cause | Default Setting |
|---|---|---|
| **Inactivity auto-pause** | No DB connections for a set time | 1 hour of idle |
| **Free credit exhaustion** | Monthly vCore seconds used up | 100,000 vCore-seconds/month |

After 2 weeks of no traffic, **both** conditions were met:
- Auto-pause fired from inactivity
- The monthly free vCore credit counter showed **0 vCore seconds remaining**

When free credits are exhausted, the DB pauses and **will not resume** until either:
- The next calendar month (credits reset)
- You remove the free offer and switch to a paid tier

### How we diagnosed it

1. Opened the Azure Portal → `pinoypantry-db` → Overview
2. **Status: Paused** was visible
3. In **Compute + storage**, the banner showed: *"Free offer limits reached — 0 vCore seconds remaining"*
4. API response body confirmed: `HTTP Error 500.30 - ASP.NET Core app failed to start` (the app could not connect to the DB on startup)

### What Serverless actually means

The **Serverless compute tier** in Azure SQL:
- **Scales compute automatically** (0.5 to N vCores based on demand)
- **Billed per vCore-second** of actual CPU/memory used
- **Auto-pauses** after inactivity to save cost
- **Auto-resumes** on the next connection (first request after pause is slow — ~30–60 sec cold start)
- Has a **free offer** that provides 100,000 free vCore-seconds per month; once exhausted → DB pauses

The **Free Offer** is great for demos/learning but not reliable for a site you want always available.

---

## Fix — Switch to Azure SQL Basic Tier

### What is the Basic tier

The **Basic (DTU-based)** tier is a simple, flat-rate always-on option:

| Property | Value |
|---|---|
| Model | DTU (Database Transaction Units) — fixed performance |
| DTUs | 5 |
| Max storage | 2 GB |
| Price | ~$5.39 USD/month |
| Auto-pause | **Never** — always on 24/7 |
| Free credits | None needed — flat rate |
| Cold starts | **None** — always warm |

This is ideal for a low-traffic portfolio/demo site.

### Step-by-step: How to switch

1. Azure Portal → search **SQL databases** → click **pinoypantry-db**
2. Left menu → **Settings** → **Compute + storage**
3. Toggle **"Free database offer"** → **Off** (turns it to "Not Applied")
   - This reveals the full tier selection dropdown
4. In the **Service tier** dropdown → select **Basic (For less demanding workloads)**
5. Verify the **Cost summary** panel shows ~$5.39 USD/month
6. Scroll down → click **Apply**
7. Wait 1–2 minutes for **"Scaling in progress..."** to finish
8. Go to **Overview** → confirm **Status: Online** and **Pricing tier: Basic**

### How to confirm the change applied

Go to `pinoypantry-db` → **Activity log** (left menu).
You should see two entries like:

```
Operation name          Status      Time
Update SQL database     Succeeded   4 minutes ago
Update SQL database     Succeeded   6 minutes ago
```

Both marked **Succeeded** = the tier change was applied and billing has started.

### Why the API still showed 500 after the DB came back

Even after the DB is online, the **App Service** (API host) can stay in a failed-to-start state because it crashed during startup when the DB was unreachable. It needs a **Restart** to try connecting again.

To restart the API:
1. Azure Portal → search **App Services** → click **pinoypantry-api**
2. Top toolbar → click **Restart**
3. Wait ~60 seconds
4. Test: `https://pinoypantry-api-f0a8hbfwc6fwdfbg.australiaeast-01.azurewebsites.net/api/products`

### Key learning: Two-layer architecture

```
Browser
  ↓
Azure Static Web App (frontend — always fast, CDN)
  ↓  (API calls)
Azure App Service (API — .NET 8 backend)
  ↓  (SQL queries)
Azure SQL Database (data)
```

If any layer fails, the layers above it also fail. In this case:
- DB paused → API crashes on startup → website shows no products

---

## Fix — How to avoid this in future

| Setting | Where | What to set |
|---|---|---|
| Tier | Compute + storage | Basic (never pauses) |
| Auto-pause (if back on Serverless) | Compute + storage → Auto-pause delay | Disabled |
| Overage billing (if on free offer) | Compute + storage → Behavior when limit reached | "Continue using database for additional charges" |

With Basic tier, none of the above are needed — it is always running.

---

## Code Change 1 — Footer Copyright Year

**File:** `src/components/Footer.tsx`

**Change:** Updated copyright year from 2024 to 2026.

```tsx
// Before
<p>&copy; 2024 PinoyPantry. All rights reserved. Pasabuy Na Ba!</p>

// After
<p>&copy; 2026 PinoyPantry. All rights reserved. Pasabuy Na Ba!</p>
```

**Why this matters:**
- Outdated copyright years make a site look unmaintained
- Visitors and potential employers/clients notice this
- Best practice: use `new Date().getFullYear()` to keep it auto-updating:

```tsx
<p>&copy; {new Date().getFullYear()} PinoyPantry. All rights reserved. Pasabuy Na Ba!</p>
```

---

## Code Change 2 — Remove Exposed Email Address from Footer

**File:** `src/components/Footer.tsx`

**Problem:**
Showing a real email address directly in HTML is bad practice because:
- Web scrapers and spam bots harvest email addresses from HTML
- You get more spam
- It looks unprofessional vs a proper contact form
- No way to filter/validate the message before it reaches your inbox

**Before:**
```tsx
<li className="flex items-center gap-2 text-white/80">
  <Mail className="w-5 h-5 flex-shrink-0" />
  <span>hello@pinoypantry.com</span>
</li>
```

**After:**
```tsx
<li className="flex items-center gap-2">
  <Mail className="w-5 h-5 flex-shrink-0 text-white/80" />
  <a href="/contact" className="text-[#F9A825] hover:underline font-medium">
    Send us a message
  </a>
</li>
```

The mail icon stays for visual context, but the email address is replaced by a link to the new `/contact` page.

---

## Code Change 3 — New Contact Page with Form

**File:** `src/pages/ContactPage.tsx` (new file)

### Why a form instead of an email link

| Approach | Pros | Cons |
|---|---|---|
| Show email address | Simple | Spam bots harvest it; no structure |
| `mailto:` link | Opens mail client | Email address visible in HTML; not everyone has mail client set up |
| Contact form | Clean UX; structured data; email hidden | Needs a form handler service |

### Page structure

```
ContactPage
├── Hero banner (brown background, page title)
└── Two-column layout
    ├── Left: Info cards (Location, Phone, Email note)
    └── Right: Contact form
        ├── Full Name + Email (side by side)
        ├── Subject (dropdown with preset options)
        ├── Message (textarea)
        ├── Error message (if submit fails)
        ├── Submit button (with loading state)
        └── Success screen (shown after submit)
```

### Form state management

```tsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  subject: '',
  message: '',
});
const [submitted, setSubmitted] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

**Three states:**
- `loading` — submit button shows "Sending..." and is disabled
- `error` — shows red error message below form
- `submitted` — replaces entire form with a success screen

### How the form submission works (Formspree)

The form posts to [Formspree](https://formspree.io) — a free third-party service that:
1. Receives the form POST
2. Forwards it to your email inbox
3. Returns a 200 OK response

**Why Formspree instead of building a backend endpoint?**
- No backend code needed — works with any static frontend
- Free tier: 50 submissions/month (more than enough for a portfolio site)
- Takes 2 minutes to set up
- No SMTP/email server configuration

**Setup steps for Formspree:**
1. Go to [formspree.io](https://formspree.io) → Sign up (free)
2. Click **+ New Form** → name it "PinoyPantry Contact"
3. Copy your form ID (looks like `xabcdefg`)
4. In `ContactPage.tsx`, replace `YOUR_FORM_ID`:

```tsx
// Before
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {

// After (example)
const response = await fetch('https://formspree.io/f/xabcdefg', {
```

5. Push the change → deploy → done

### Submit handler pattern

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();      // Prevent default HTML form POST/page reload
  setLoading(true);
  setError('');

  try {
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setSubmitted(true);                                    // Show success screen
      setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
    } else {
      setError('Something went wrong. Please try again.');  // Show inline error
    }
  } catch {
    setError('Unable to send message. Please try again later.'); // Network error
  } finally {
    setLoading(false);   // Always re-enable submit button
  }
};
```

**Key concepts used:**
- `e.preventDefault()` — stops the browser's default form submit (which would reload the page)
- `try/catch/finally` — handles both server errors (`response.ok === false`) and network errors (fetch throws)
- `finally` — always runs, ensures `loading` is reset even if an error occurs

### Styling approach

The page follows PinoyPantry's existing design system:
- `bg-[#3E2723]` — dark brown (brand primary, used in header/footer)
- `text-[#F9A825]` / `bg-[#F9A825]` — amber/gold (brand accent)
- `focus:ring-[#F9A825]` — focus ring matches brand color
- `rounded-xl`, `shadow-sm` — consistent border radius and shadow style

---

## Code Change 4 — Route Added in App.tsx

**File:** `src/App.tsx`

Two lines added:

```tsx
// 1. Import at top of file
import { ContactPage } from './pages/ContactPage';

// 2. Route inside <Routes>
<Route path="/contact" element={<ContactPage />} />
```

**How React Router routing works (recap):**

```
User visits /contact
  ↓
BrowserRouter intercepts the URL (no full page reload)
  ↓
Routes component checks each <Route path="..."> in order
  ↓
Finds path="/contact" → renders <ContactPage />
  ↓
Header and Footer still render (they're outside <Routes>)
```

The `/contact` route automatically gets the site's Header and Footer because those are rendered unconditionally outside the `<Routes>` block (except for admin/login pages which are excluded via the `isLoginPage`/`isAdminPage` checks).

---

## GitHub Repositories

| Repo | URL | What it contains |
|---|---|---|
| Frontend | [github.com/taerny/PinoyPantry.Client](https://github.com/taerny/PinoyPantry.Client) | React + Vite + TypeScript |
| Backend | [github.com/taerny/PinoyPantry.API](https://github.com/taerny/PinoyPantry.API) | .NET 8 Web API |

### Auto-deploy workflow

Every `git push` to `main` triggers GitHub Actions:

```
git push origin main
  ↓
GitHub Actions reads .github/workflows/azure-static-web-apps-gentle-dune-0c69a8700.yml
  ↓
Runs: npm install → npm run build → uploads /build to Azure Static Web App
  ↓
Live site updates at gentle-dune-0c69a8700.6.azurestaticapps.net
```

**How to monitor a deploy:**
1. Go to [github.com/taerny/PinoyPantry.Client/actions](https://github.com/taerny/PinoyPantry.Client/actions)
2. Click the latest workflow run
3. Watch the steps expand in real time
4. Green checkmark = deployed successfully
5. Red X = build or deploy failed (click step to see error)

---

*Last Updated: March 25, 2026*
