import { shopifyClient } from './shopifyClient';
import { Product, Category, ProductsResponse } from '../types';

/**
 * Shopify Product Service
 * 
 * Fetches products and collections from Shopify Storefront API
 */

// GraphQL query to fetch products
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
                quantityAvailable
              }
            }
          }
          tags
        }
      }
    }
  }
`;

// GraphQL query to fetch collections (categories)
const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
          }
          products(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;

export class ShopifyProductService {
  /**
   * Fetch products from Shopify
   */
  static async getProducts(limit = 50): Promise<ProductsResponse> {
    try {
      const response = await fetch(shopifyClient.getStorefrontApiUrl(), {
        method: 'POST',
        headers: shopifyClient.getPublicTokenHeaders(),
        body: JSON.stringify({
          query: PRODUCTS_QUERY,
          variables: { first: limit },
        }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        console.error('Shopify API errors:', errors);
        throw new Error('Failed to fetch products from Shopify');
      }

      const products: Product[] = data.products.edges.map((edge: any) => {
        const node = edge.node;
        const variant = node.variants.edges[0]?.node;
        
        // Safely parse price with fallback
        const price = node.priceRange?.minVariantPrice?.amount 
          ? parseFloat(node.priceRange.minVariantPrice.amount)
          : 0;

        return {
          id: node.id,
          name: node.title,
          description: node.description,
          price,
          originalPrice: node.compareAtPriceRange?.minVariantPrice?.amount
            ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
            : undefined,
          image: node.featuredImage?.url || '',
          inStock: variant?.availableForSale || false,
          inventory: variant?.quantityAvailable,
          tags: node.tags,
          rating: 4.5, // Default rating since Shopify doesn't have built-in ratings
        };
      });

      return {
        products,
        totalCount: products.length,
        hasMore: false,
      };
    } catch (error) {
      console.error('Error fetching products from Shopify:', error);
      throw error;
    }
  }

  /**
   * Fetch collections (categories) from Shopify
   */
  static async getCollections(limit = 20): Promise<Category[]> {
    try {
      const response = await fetch(shopifyClient.getStorefrontApiUrl(), {
        method: 'POST',
        headers: shopifyClient.getPublicTokenHeaders(),
        body: JSON.stringify({
          query: COLLECTIONS_QUERY,
          variables: { first: limit },
        }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        console.error('Shopify API errors:', errors);
        throw new Error('Failed to fetch collections from Shopify');
      }

      const collections: Category[] = data.collections.edges.map((edge: any) => {
        const node = edge.node;
        
        return {
          id: node.id,
          title: node.title,
          slug: node.handle,
          icon: '🛍️', // Default icon
          itemCount: node.products?.edges?.length || 0,
          description: node.description,
        };
      });

      return collections;
    } catch (error) {
      console.error('Error fetching collections from Shopify:', error);
      throw error;
    }
  }

  /**
   * Fetch products by collection
   */
  static async getProductsByCollection(collectionHandle: string, limit = 50): Promise<Product[]> {
    const COLLECTION_PRODUCTS_QUERY = `
      query GetCollectionProducts($handle: String!, $first: Int!) {
        collection(handle: $handle) {
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
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(shopifyClient.getStorefrontApiUrl(), {
        method: 'POST',
        headers: shopifyClient.getPublicTokenHeaders(),
        body: JSON.stringify({
          query: COLLECTION_PRODUCTS_QUERY,
          variables: { handle: collectionHandle, first: limit },
        }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        console.error('Shopify API errors:', errors);
        return [];
      }

      if (!data.collection) {
        return [];
      }

      const products: Product[] = data.collection.products.edges.map((edge: any) => {
        const node = edge.node;
        const variant = node.variants.edges[0]?.node;
        
        // Safely parse price with fallback
        const price = node.priceRange?.minVariantPrice?.amount 
          ? parseFloat(node.priceRange.minVariantPrice.amount)
          : 0;

        return {
          id: node.id,
          name: node.title,
          description: node.description,
          price,
          originalPrice: node.compareAtPriceRange?.minVariantPrice?.amount
            ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
            : undefined,
          image: node.featuredImage?.url || '',
          inStock: variant?.availableForSale || false,
          rating: 4.5,
        };
      });

      return products;
    } catch (error) {
      console.error('Error fetching products by collection:', error);
      return [];
    }
  }

  /**
   * Search products by query
   */
  static async searchProducts(query: string, limit = 50): Promise<Product[]> {
    const SEARCH_QUERY = `
      query SearchProducts($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
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

    // Format search query for Shopify (add wildcards for partial matching)
    const formattedQuery = query
      .trim()
      .split(/\s+/)
      .map(word => `title:*${word}* OR tag:*${word}*`)
      .join(' OR ');

    console.log(`🔍 Original query: "${query}"`);
    console.log(`🔍 Formatted query: "${formattedQuery}"`);

    try {
      const response = await fetch(shopifyClient.getStorefrontApiUrl(), {
        method: 'POST',
        headers: shopifyClient.getPublicTokenHeaders(),
        body: JSON.stringify({
          query: SEARCH_QUERY,
          variables: { query: formattedQuery, first: limit },
        }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        console.error('Shopify search errors:', errors);
        return [];
      }

      console.log(`🔍 Search query: "${query}"`, `Found ${data.products.edges.length} products`);

      const products: Product[] = data.products.edges.map((edge: any) => {
        const node = edge.node;
        const variant = node.variants.edges[0]?.node;
        
        // Safely parse price with fallback
        const price = node.priceRange?.minVariantPrice?.amount 
          ? parseFloat(node.priceRange.minVariantPrice.amount)
          : 0;
        
        if (!node.priceRange?.minVariantPrice?.amount) {
          console.warn(`Product ${node.title} has no price data`);
        }

        return {
          id: node.id,
          name: node.title,
          description: node.description,
          price,
          originalPrice: node.compareAtPriceRange?.minVariantPrice?.amount
            ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
            : undefined,
          image: node.featuredImage?.url || '',
          inStock: variant?.availableForSale || false,
          tags: node.tags,
          rating: 4.5,
        };
      });

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}
