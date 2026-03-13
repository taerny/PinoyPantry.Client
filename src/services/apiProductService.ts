import { Product, ProductFilters, ProductsResponse } from '../types';

/**
 * Matches the shape of ProductResponseDto returned by our .NET API.
 * This is a private type — the rest of the app never sees it.
 * It gets mapped to the frontend Product type below.
 */
interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

/**
 * Matches the shape of PagedResult<T> returned by our .NET API.
 */
interface ApiPagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Maps an API product (ProductResponseDto shape) to the frontend Product type.
 * This is where field name differences are resolved:
 *   - imageUrl  →  image
 *   - id number →  id string
 */
function mapApiProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.imageUrl || '',
    category: p.category,
    inStock: true,
  };
}

const API_URL = import.meta.env.VITE_API_URL as string;

/**
 * Maps URL-friendly slugs (used by the nav menu) to the exact category
 * names stored in the database. Add a new entry here whenever a new
 * category is added to the DB seed data.
 */
const SLUG_TO_CATEGORY: Record<string, string> = {
  'canned-goods':    'Canned Goods',
  'snacks-chips':    'Snacks',
  'instant-noodles': 'Noodles',
  'condiments':      'Condiments',
  'beverages':       'Beverages',
  'sweets':          'Sweets',
  'soups-mixes':     'Soups & Mixes',
  'dairy':           'Dairy',
};

export const ApiProductService = {
  async getProducts(
    filters?: ProductFilters,
    page = 1,
    limit = 12
  ): Promise<ProductsResponse & { totalPages: number; currentPage: number }> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));

    if (filters?.category && filters.category !== 'all-products') {
      // Translate slug to the DB category name; fall back to slug if not mapped
      const dbCategory = SLUG_TO_CATEGORY[filters.category] ?? filters.category;
      params.set('category', dbCategory);
    }

    if (filters?.search) {
      params.set('search', filters.search);
    }

    const response = await fetch(`${API_URL}/api/products?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiPagedResult<ApiProduct> = await response.json();

    return {
      products: result.data.map(mapApiProduct),
      totalCount: result.totalCount,
      hasMore: result.page < result.totalPages,
      totalPages: result.totalPages,
      currentPage: result.page,
    };
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const response = await fetch(`${API_URL}/api/products/${id}`);

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const apiProduct: ApiProduct = await response.json();
    return mapApiProduct(apiProduct);
  },

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    if (categorySlug === 'all-products') {
      const result = await this.getProducts();
      return result.products;
    }
    const result = await this.getProducts({ category: categorySlug });
    return result.products;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const result = await this.getProducts(undefined, 1, 6);
    return result.products;
  },

  async searchProducts(query: string): Promise<Product[]> {
    const result = await this.getProducts({ search: query });
    return result.products;
  },
};
