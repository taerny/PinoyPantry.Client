import { Product, Category, ProductFilters, ProductSort, ProductsResponse } from '../types';
import { 
  mockProducts, 
  mockCategories, 
  getFeaturedProducts, 
  getProductsByCategory,
  getCategoryBySlug 
} from '../data/mockProducts';
import { ShopifyProductService } from './shopifyProductService';

/**
 * Product Service
 * 
 * This service provides a clean abstraction for product data.
 * Automatically switches between mock data and Shopify based on VITE_USE_MOCK_DATA.
 * 
 * Set VITE_USE_MOCK_DATA=true for development with mock data
 * Set VITE_USE_MOCK_DATA=false to use real Shopify data
 */

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export class ProductService {
  /**
   * Get all categories
   */
  static async getCategories(): Promise<Category[]> {
    if (USE_MOCK_DATA) {
      await this.delay(300);
      return mockCategories;
    }
    
    // Use Shopify
    return ShopifyProductService.getCollections();
  }

  /**
   * Get a single category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    await this.delay(200);
    return getCategoryBySlug(slug);
  }

  /**
   * Get all products or filtered products
   */
  static async getProducts(filters?: ProductFilters, sort?: ProductSort): Promise<ProductsResponse> {
    // Mock path
    if (USE_MOCK_DATA) {
      await this.delay(500);

      let products = [...mockProducts];

      // Apply filters
      if (filters) {
        if (filters.category && filters.category !== 'all-products') {
          products = products.filter(p => p.category === filters.category);
        }

        if (filters.minPrice !== undefined) {
          products = products.filter(p => p.price >= filters.minPrice!);
        }

        if (filters.maxPrice !== undefined) {
          products = products.filter(p => p.price <= filters.maxPrice!);
        }

        if (filters.inStock) {
          products = products.filter(p => p.inStock);
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          products = products.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower)
          );
        }

        if (filters.tags && filters.tags.length > 0) {
          products = products.filter(p =>
            p.tags?.some(tag => filters.tags!.includes(tag))
          );
        }
      }

      // Apply sorting
      if (sort) {
        products.sort((a, b) => {
          let comparison = 0;

          switch (sort.field) {
            case 'price':
              comparison = a.price - b.price;
              break;
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'rating':
              comparison = (a.rating || 0) - (b.rating || 0);
              break;
            default:
              comparison = 0;
          }

          return sort.direction === 'desc' ? -comparison : comparison;
        });
      }

      return {
        products,
        totalCount: products.length,
        hasMore: false,
      };
    }

    // Shopify path
    // If a category filter is provided, treat it as a Shopify collection handle.
    if (filters?.category && filters.category !== 'all-products') {
      const products = await ShopifyProductService.getProductsByCollection(filters.category);
      return {
        products: this.applyLocalFiltersAndSort(products, { ...filters, category: undefined }, sort),
        totalCount: products.length,
        hasMore: false,
      };
    }

    const response = await ShopifyProductService.getProducts();
    const filtered = this.applyLocalFiltersAndSort(response.products, filters, sort);

    // Apply filters
    return {
      products: filtered,
      totalCount: filtered.length,
      hasMore: false,
    };
  }

  /**
   * Get featured products for homepage
   */
  static async getFeaturedProducts(): Promise<Product[]> {
    if (USE_MOCK_DATA) {
      await this.delay(400);
      return getFeaturedProducts();
    }
    
    // Use Shopify - get first 6 products as featured
    const response = await ShopifyProductService.getProducts(6);
    return response.products.slice(0, 6);
  }

  /**
   * Get products by category slug
   */
  static async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    if (USE_MOCK_DATA) {
      await this.delay(400);
      return getProductsByCategory(categorySlug);
    }
    
    // Use Shopify - fetch by collection handle
    if (categorySlug === 'all-products') {
      const response = await ShopifyProductService.getProducts();
      return response.products;
    }
    
    return ShopifyProductService.getProductsByCollection(categorySlug);
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(id: string): Promise<Product | undefined> {
    await this.delay(300);
    return mockProducts.find(p => p.id === id);
  }

  /**
   * Search products by query
   */
  static async searchProducts(query: string): Promise<Product[]> {
    if (USE_MOCK_DATA) {
      await this.delay(500);
      const queryLower = query.toLowerCase();
      return mockProducts.filter(p =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description?.toLowerCase().includes(queryLower) ||
        p.category?.toLowerCase().includes(queryLower)
      );
    }
    
    // Use Shopify search
    return ShopifyProductService.searchProducts(query);
  }

  /**
   * Utility function to simulate API delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Local filtering/sorting helper (used for both mock + Shopify results).
   * Note: Shopify products don't currently have a reliable `category` field,
   * so category filtering is handled via collections before calling this.
   */
  private static applyLocalFiltersAndSort(
    productsInput: Product[],
    filters?: ProductFilters,
    sort?: ProductSort
  ): Product[] {
    let products = [...productsInput];

    if (filters) {
      if (filters.minPrice !== undefined) {
        products = products.filter(p => p.price >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        products = products.filter(p => p.price <= filters.maxPrice!);
      }

      if (filters.inStock) {
        products = products.filter(p => p.inStock);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        products = products.filter(p =>
          p.tags?.some(tag => filters.tags!.includes(tag))
        );
      }
    }

    if (sort) {
      products.sort((a, b) => {
        let comparison = 0;

        switch (sort.field) {
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'rating':
            comparison = (a.rating || 0) - (b.rating || 0);
            break;
          // createdAt isn't available in our Product model yet
          default:
            comparison = 0;
        }

        return sort.direction === 'desc' ? -comparison : comparison;
      });
    }

    return products;
  }
}

// Export as default for convenience
export default ProductService;
