# Shopify Integration Guide

## Prerequisites

Before integrating Shopify, ensure you have:

1. ✅ A Shopify store with products
2. ✅ Access to Shopify Admin
3. ✅ Products organized into collections
4. ✅ This refactored codebase ready

## Step 1: Create Shopify Custom App

1. Go to **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Click **Develop apps**
3. Click **Create an app**
4. Name it "PinoyPantry Storefront"
5. Click **Configure Storefront API scopes**
6. Select the following permissions:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_collection_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
7. Click **Save**
8. Click **Install app**
9. Copy the **Storefront API access token** (you'll need this!)

## Step 2: Update Environment Variables

Update your `.env` file with your Shopify credentials:

```env
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=paste_your_token_here
VITE_SHOPIFY_API_VERSION=2024-01
VITE_USE_MOCK_DATA=false
```

**⚠️ Important:** Never commit your `.env` file to Git!

## Step 3: Install Shopify SDK

Choose one of these options:

### Option A: Shopify Buy SDK (Simpler)
```bash
npm install shopify-buy
```

### Option B: Hydrogen React (Recommended for React)
```bash
npm install @shopify/hydrogen-react
```

We'll use Option B for this guide.

## Step 4: Create Shopify Client

Create `src/services/shopifyClient.ts`:

```typescript
import { createStorefrontClient } from '@shopify/hydrogen-react';

export const shopifyClient = createStorefrontClient({
  storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '',
  storefrontApiVersion: import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-01',
  publicStorefrontToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
});
```

## Step 5: Create Shopify Service

Create `src/services/shopifyProductService.ts`:

```typescript
import { shopifyClient } from './shopifyClient';
import { Product, Category, ProductsResponse } from '../types';

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          featuredImage {
            url
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
              }
            }
          }
          tags
        }
      }
    }
  }
`;

export class ShopifyProductService {
  static async getProducts(): Promise<ProductsResponse> {
    const { data } = await shopifyClient.request(PRODUCTS_QUERY, {
      variables: { first: 50 },
    });

    const products: Product[] = data.products.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.title,
      description: edge.node.description,
      price: parseFloat(edge.node.priceRange.minVariantPrice.amount),
      originalPrice: edge.node.compareAtPriceRange?.minVariantPrice?.amount
        ? parseFloat(edge.node.compareAtPriceRange.minVariantPrice.amount)
        : undefined,
      image: edge.node.featuredImage?.url || '',
      inStock: edge.node.variants.edges[0]?.node.availableForSale || false,
      tags: edge.node.tags,
    }));

    return {
      products,
      totalCount: products.length,
      hasMore: false,
    };
  }

  // Add more methods for categories, featured products, etc.
}
```

## Step 6: Update Product Service

Modify `src/services/productService.ts`:

```typescript
import { Product, ProductsResponse } from '../types';
import { mockProducts } from '../data/mockProducts';
import { ShopifyProductService } from './shopifyProductService';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export class ProductService {
  static async getProducts(): Promise<ProductsResponse> {
    if (USE_MOCK_DATA) {
      // Return mock data
      return {
        products: mockProducts,
        totalCount: mockProducts.length,
        hasMore: false,
      };
    }
    
    // Use Shopify service
    return ShopifyProductService.getProducts();
  }
  
  // Update other methods similarly...
}
```

## Step 7: Map Shopify Collections to Categories

In Shopify Admin:
1. Create collections for your categories:
   - Canned Goods
   - Snacks & Chips
   - Instant Noodles
   - Beverages
   - Condiments
   - Sweets

2. Assign products to collections

3. Update your service to fetch collections:

```typescript
const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          productsCount
        }
      }
    }
  }
`;
```

## Step 8: Integrate Cart with Shopify Checkout

Update `src/contexts/CartContext.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { shopifyClient } from '../services/shopifyClient';

export function CartProvider({ children }: { children: ReactNode }) {
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  
  // Create checkout when cart is first used
  useEffect(() => {
    const createCheckout = async () => {
      const { data } = await shopifyClient.request(`
        mutation {
          checkoutCreate(input: {}) {
            checkout {
              id
              webUrl
            }
          }
        }
      `);
      setCheckoutId(data.checkoutCreate.checkout.id);
    };
    
    if (!checkoutId) {
      createCheckout();
    }
  }, []);
  
  // Update addToCart to use Shopify checkout...
}
```

## Step 9: Update Checkout Page

Redirect to Shopify checkout:

```typescript
const handleCheckout = () => {
  // Get Shopify checkout URL from context
  const checkoutUrl = getCheckoutUrl();
  
  // Redirect to Shopify checkout
  window.location.href = checkoutUrl;
};
```

## Step 10: Test Integration

1. Set `VITE_USE_MOCK_DATA=false` in `.env`
2. Restart dev server: `npm run dev`
3. Test:
   - Products load from Shopify ✓
   - Categories display correctly ✓
   - Add to cart works ✓
   - Checkout redirects to Shopify ✓

## Common Issues & Solutions

### Issue: "Access denied" error
**Solution:** Check that you've enabled the correct Storefront API scopes

### Issue: Products not loading
**Solution:** 
- Verify your access token is correct
- Check that products are published to your sales channel
- Look at browser console for GraphQL errors

### Issue: Images not showing
**Solution:** Check that products have featured images in Shopify

### Issue: Checkout not working
**Solution:** Ensure checkout creation permissions are enabled

## Category Mapping Strategy

Map your mock categories to Shopify collections:

| Mock Category | Shopify Collection Handle | Collection ID |
|--------------|---------------------------|---------------|
| Canned Goods | `canned-goods` | (Get from Shopify) |
| Snacks & Chips | `snacks-chips` | (Get from Shopify) |
| Instant Noodles | `instant-noodles` | (Get from Shopify) |
| Beverages | `beverages` | (Get from Shopify) |
| Condiments | `condiments` | (Get from Shopify) |
| Sweets | `sweets` | (Get from Shopify) |

## Product Metafields

To store custom data (like ratings, badges), use Shopify metafields:

1. In Shopify Admin → **Settings** → **Custom data**
2. Create metafields:
   - `custom.badge` (Single line text)
   - `custom.rating` (Decimal)
3. Add values to products
4. Query in GraphQL:

```graphql
{
  product(id: "...") {
    metafield(namespace: "custom", key: "badge") {
      value
    }
  }
}
```

## Performance Optimization

1. **Enable GraphQL Caching:**
   ```typescript
   const cache = new Map();
   // Cache responses for 5 minutes
   ```

2. **Use Pagination:**
   ```graphql
   products(first: 20, after: $cursor)
   ```

3. **Optimize Images:**
   ```graphql
   featuredImage {
     url(transform: { maxWidth: 800 })
   }
   ```

4. **Lazy Load Images:**
   ```tsx
   <img loading="lazy" src={image} />
   ```

## Security Checklist

- ✅ Never expose Admin API token in frontend
- ✅ Only use Storefront API token (safe for public)
- ✅ Don't commit `.env` file
- ✅ Use environment variables for all secrets
- ✅ Validate all user input
- ✅ Use HTTPS in production

## Going Live

1. Update `.env` for production:
   ```env
   VITE_SHOPIFY_STORE_DOMAIN=yourdomain.myshopify.com
   VITE_USE_MOCK_DATA=false
   ```

2. Build and deploy:
   ```bash
   npm run build
   ```

3. Test thoroughly:
   - [ ] All products load
   - [ ] Categories work
   - [ ] Cart functions correctly
   - [ ] Checkout completes successfully
   - [ ] Images load properly
   - [ ] Mobile responsive

4. Monitor Shopify Analytics Dashboard

## Additional Resources

- [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront)
- [Hydrogen React Docs](https://shopify.dev/docs/api/hydrogen-react)
- [GraphQL Explorer](https://shopify.dev/docs/apps/tools/graphiql-admin-api)
- [Shopify Dev Community](https://community.shopify.com/)

## Support

If you need help:
1. Check Shopify Dev Docs
2. Use GraphiQL to test queries
3. Check browser console for errors
4. Review Shopify API changelog for breaking changes

---

Good luck with your Shopify integration! 🚀
