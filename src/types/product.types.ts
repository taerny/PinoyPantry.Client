/**
 * Product Types
 * These types define the structure for products in the application.
 * They are designed to work with both mock data and Shopify API responses.
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Multiple images support
  badge?: 'BESTSELLER' | 'NEW' | 'SALE' | string;
  rating?: number;
  category?: string;
  inStock?: boolean;
  inventory?: number;
  sku?: string;
  tags?: string[];
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  icon: string;
  itemCount: number;
  description?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  tags?: string[];
}

export interface ProductSort {
  field: 'price' | 'name' | 'rating' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  totalCount: number;
  hasMore: boolean;
}
