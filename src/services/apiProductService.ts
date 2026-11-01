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
  stockQuantity: number;
  shortDescription?: string;
  publishedAt?: string | null;
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
// A product is "new" for this many days after it was first published (matches the API).
const NEW_DAYS = 14;
function isNewProduct(publishedAt?: string | null): boolean {
  if (!publishedAt) return false;
  return Date.now() - new Date(publishedAt).getTime() < NEW_DAYS * 24 * 60 * 60 * 1000;
}

function mapApiProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.imageUrl || '',
    category: p.category,
    inStock: p.stockQuantity > 0,
    inventory: p.stockQuantity,
    shortDescription: p.shortDescription || undefined,
    publishedAt: p.publishedAt ?? undefined,
    badge: isNewProduct(p.publishedAt) ? 'NEW' : undefined,
  };
}

const API_URL = import.meta.env.VITE_API_URL as string;

const LIST_CACHE_MS = 2 * 60 * 1000;
const listCache = new Map<string, { at: number; value: any }>();

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
  'soups-mixes':     'Soups & Mixes',
  'dairy':           'Dairy',
  'dried-fish':      'Dried Fish',
  'spreads':         'Spreads',
};

export const ApiProductService = {
  async getProducts(
    filters?: ProductFilters,
    page = 1,
    limit = 12,
    opts?: { sort?: 'newest'; newOnly?: boolean }
  ): Promise<ProductsResponse & { totalPages: number; currentPage: number }> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (opts?.sort) params.set('sort', opts.sort);
    if (opts?.newOnly) params.set('newOnly', 'true');

    if (filters?.category && filters.category !== 'all-products') {
      // Translate slug to the DB category name; fall back to slug if not mapped
      const dbCategory = SLUG_TO_CATEGORY[filters.category] ?? filters.category;
      params.set('category', dbCategory);
    }

    if (filters?.search) {
      params.set('search', filters.search);
    }

    // Short-lived cache so pressing Back returns to the same list instantly (no reload, no
    // skeleton flash) instead of re-fetching every product again.
    const cacheKey = params.toString();
    const cached = listCache.get(cacheKey);
    if (cached && Date.now() - cached.at < LIST_CACHE_MS) return cached.value;

    const response = await fetch(`${API_URL}/api/products?${cacheKey}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiPagedResult<ApiProduct> = await response.json();

    const value = {
      products: result.data.map(mapApiProduct),
      totalCount: result.totalCount,
      hasMore: result.page < result.totalPages,
      totalPages: result.totalPages,
      currentPage: result.page,
    };
    listCache.set(cacheKey, { at: Date.now(), value });
    return value;
  },

  // Most recently published products still inside the "new" window and in stock.
  async getNewArrivals(limit = 12): Promise<Product[]> {
    const result = await this.getProducts(undefined, 1, limit, { sort: 'newest', newOnly: true });
    return result.products;
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
      return this.getAllProducts();
    }
    return this.getAllProducts({ category: categorySlug });
  },

  // getProducts() is paged (12 by default) - fine for the homepage's featured strip, but the
  // "All Products" and category pages have no pager, so a single page silently showed only the
  // first 12 items while implying that was everything. Walk every page instead.
  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    const PAGE_SIZE = 100;
    const all: Product[] = [];
    let page = 1;
    while (true) {
      const result = await this.getProducts(filters, page, PAGE_SIZE);
      all.push(...result.products);
      if (!result.hasMore) break;
      page++;
    }
    return all;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const result = await this.getProducts(undefined, 1, 6);
    return result.products;
  },

  async searchProducts(query: string): Promise<Product[]> {
    const result = await this.getProducts({ search: query });
    return result.products;
  },

  async getCategoryCounts(): Promise<Record<string, number>> {
    const response = await fetch(`${API_URL}/api/products/category-counts`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
};
