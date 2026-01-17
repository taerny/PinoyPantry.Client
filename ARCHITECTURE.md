# PinoyPantry Client - Architecture Documentation

## Overview
This document describes the architecture of the PinoyPantry client application after refactoring for Shopify integration.

## Project Structure

```
src/
├── components/          # React UI components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── figma/          # Figma-generated components
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── ProductCard.tsx
│   ├── CategoryCard.tsx
│   ├── CategoryPage.tsx
│   ├── ShoppingCartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── LoginPage.tsx
│   └── Footer.tsx
│
├── contexts/           # React Context providers
│   ├── CartContext.tsx # Shopping cart state management
│   └── index.ts        # Context exports
│
├── hooks/             # Custom React hooks
│   ├── useProducts.ts  # Product data hooks
│   └── useCategories.ts # Category data hooks
│
├── services/          # API service layer
│   └── productService.ts # Product/category data fetching
│
├── types/             # TypeScript type definitions
│   ├── product.types.ts
│   ├── cart.types.ts
│   └── index.ts
│
├── data/              # Mock data (temporary)
│   └── mockProducts.ts # Product/category mock data
│
├── utils/             # Utility functions
│
├── App.tsx            # Main application component
└── main.tsx          # Application entry point
```

## Architecture Patterns

### 1. Service Layer Pattern
All data fetching is abstracted through a service layer (`productService.ts`). This provides:
- **Separation of concerns**: UI components don't know about data sources
- **Easy testing**: Services can be mocked
- **Swappable implementations**: Currently uses mock data, can easily switch to Shopify API

### 2. Custom Hooks Pattern
Data fetching logic is encapsulated in custom hooks:
- `useProducts()` - Fetch products with filters/sorting
- `useFeaturedProducts()` - Fetch featured products
- `useProductsByCategory()` - Fetch products by category
- `useCategories()` - Fetch all categories
- `useCategory()` - Fetch single category

Benefits:
- Reusable across components
- Built-in loading and error states
- Clean component code

### 3. Context API for State Management
Cart state is managed using React Context:
- Global cart state accessible anywhere
- No prop drilling
- Will integrate with Shopify checkout later

## Data Flow

```
Component
    ↓
Custom Hook (useProducts, useCategories, etc.)
    ↓
Service Layer (ProductService)
    ↓
Data Source (Mock Data → Shopify API later)
```

## TypeScript Types

### Product Type
```typescript
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  badge?: string;
  rating?: number;
  category?: string;
  inStock?: boolean;
  inventory?: number;
  sku?: string;
  tags?: string[];
}
```

### Category Type
```typescript
interface Category {
  id: string;
  title: string;
  slug: string;
  icon: string;
  itemCount: number;
  description?: string;
}
```

### Cart Types
```typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string; // For Shopify variants
  sku?: string;
}
```

## Environment Variables

Configuration is managed through `.env` file:

```env
# Shopify Store Configuration
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token_here
VITE_SHOPIFY_API_VERSION=2024-01
VITE_USE_MOCK_DATA=true
```

## Next Steps: Shopify Integration

### Phase 1: Install Shopify SDK
```bash
npm install @shopify/hydrogen-react
# OR
npm install shopify-buy
```

### Phase 2: Create Shopify Service Implementation
Create `src/services/shopifyService.ts` that implements:
- Fetch products from Shopify Storefront API
- Fetch collections (categories)
- Handle product variants
- Manage checkout sessions

### Phase 3: Update ProductService
Modify `productService.ts` to use Shopify service when `VITE_USE_MOCK_DATA=false`

### Phase 4: Cart Integration
Update `CartContext.tsx` to:
- Create Shopify checkout session
- Sync cart with Shopify
- Handle checkout URL redirect

### Phase 5: Complete Integration
- Product search
- Filtering/sorting
- Customer accounts
- Order tracking

## Key Benefits of Current Architecture

1. **Clean Separation**: UI, business logic, and data are properly separated
2. **Type Safety**: Full TypeScript support with proper type definitions
3. **Testable**: Service layer can be easily mocked for testing
4. **Maintainable**: Clear structure makes code easy to understand and modify
5. **Scalable**: Easy to add new features or swap implementations
6. **Shopify-Ready**: Designed to easily integrate with Shopify API

## Development Workflow

### Running the App
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

### Adding New Features
1. Define types in `src/types/`
2. Add service methods in `src/services/`
3. Create hooks in `src/hooks/` if needed
4. Update components to use hooks
5. Test with mock data
6. Integrate with Shopify when ready

## Migration Notes

### What Changed
- ✅ Product data extracted from components to centralized location
- ✅ Service layer added for data fetching
- ✅ Custom hooks created for data management
- ✅ CartContext moved to `contexts/` folder
- ✅ TypeScript types properly defined
- ✅ Environment configuration added

### What Stayed the Same
- All UI components work identically
- User experience unchanged
- No breaking changes for users
- Same design and functionality

### Before vs After

**Before:**
```tsx
// Products hardcoded in component
const products = [
  { name: 'Product 1', price: 100, ... },
  // ...
];

return products.map(p => <ProductCard {...p} />);
```

**After:**
```tsx
// Products fetched from service
const { products, loading } = useFeaturedProducts();

if (loading) return <Loading />;
return products.map(p => <ProductCard {...p} />);
```

## Troubleshooting

### Dev Server Won't Start
- Check if port 3000 is available
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript errors in console

### Build Fails
- Verify all imports are correct
- Check TypeScript types
- Ensure all files are saved

### Mock Data Not Loading
- Check `VITE_USE_MOCK_DATA=true` in `.env`
- Verify service layer is returning data correctly
- Check browser console for errors

## Future Enhancements

1. **Search Functionality**: Add product search with Shopify
2. **Filters**: Price range, availability, ratings
3. **Product Variants**: Size, color options
4. **Reviews**: Customer reviews integration
5. **Recommendations**: Related/recommended products
6. **Analytics**: Track user behavior
7. **Performance**: Image optimization, lazy loading
8. **SEO**: Meta tags, structured data

---

Last Updated: January 17, 2026
