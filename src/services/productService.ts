import { Product, Category, ProductFilters, ProductSort, ProductsResponse } from '../types';
import { 
  mockProducts, 
  mockCategories, 
  getFeaturedProducts, 
  getProductsByCategory,
  getCategoryBySlug 
} from '../data/mockProducts';
import { ApiProductService } from './apiProductService';

/**
 * Product Service
 *
 * Controls which data source is used based on environment variables:
 *   VITE_API_URL set          → .NET API (our backend)
 *   anything else             → local mock data
 */

const USE_API = !!import.meta.env.VITE_API_URL;

export class ProductService {
  /**
   * Get all categories
   */
  static async getCategories(): Promise<Category[]> {
    // API doesn't have a /categories endpoint yet — use mock categories
    return mockCategories;
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
    if (USE_API) {
      return ApiProductService.getProducts(filters);
    }

    await this.delay(500);
    let products = [...mockProducts];

    if (filters) {
      if (filters.category && filters.category !== 'all-products') {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters.minPrice !== undefined) products = products.filter(p => p.price >= filters.minPrice!);
      if (filters.maxPrice !== undefined) products = products.filter(p => p.price <= filters.maxPrice!);
      if (filters.inStock) products = products.filter(p => p.inStock);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
        );
      }
      if (filters.tags?.length) {
        products = products.filter(p => p.tags?.some(tag => filters.tags!.includes(tag)));
      }
    }

    if (sort) {
      products.sort((a, b) => {
        let comparison = 0;
        switch (sort.field) {
          case 'price': comparison = a.price - b.price; break;
          case 'name':  comparison = a.name.localeCompare(b.name); break;
          case 'rating': comparison = (a.rating || 0) - (b.rating || 0); break;
        }
        return sort.direction === 'desc' ? -comparison : comparison;
      });
    }

    return { products, totalCount: products.length, hasMore: false };
  }

  /**
   * Get featured products for homepage
   */
  static async getFeaturedProducts(): Promise<Product[]> {
    if (USE_API) return ApiProductService.getFeaturedProducts();
    await this.delay(400);
    return getFeaturedProducts();
  }

  /**
   * Get products by category slug
   */
  static async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    if (USE_API) return ApiProductService.getProductsByCategory(categorySlug);
    await this.delay(400);
    return getProductsByCategory(categorySlug);
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(id: string): Promise<Product | undefined> {
    if (USE_API) return ApiProductService.getProductById(id);
    await this.delay(300);
    return mockProducts.find(p => p.id === id);
  }

  /**
   * Search products by query
   * If query exactly matches a product name, returns only that product.
   * Otherwise, returns all products containing the query.
   */
  static async searchProducts(query: string): Promise<Product[]> {
    if (USE_API) return ApiProductService.searchProducts(query);

    await this.delay(500);
    const queryLower = query.toLowerCase().trim();
    const exactMatch = mockProducts.find(p => p.name.toLowerCase() === queryLower);
    if (exactMatch) return [exactMatch];
    return mockProducts.filter(p =>
      p.name.toLowerCase().includes(queryLower) ||
      p.description?.toLowerCase().includes(queryLower) ||
      p.category?.toLowerCase().includes(queryLower)
    );
  }

  /**
   * Utility function to simulate API delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

// Export as default for convenience
export default ProductService;
