import { createStorefrontClient } from '@shopify/hydrogen-react';

/**
 * Shopify Storefront API Client
 * 
 * This client is configured with your store credentials from .env
 */

const storeDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '';
const storefrontAccessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || '2026-01';

export const shopifyClient = createStorefrontClient({
  storeDomain,
  storefrontApiVersion: apiVersion,
  publicStorefrontToken: storefrontAccessToken,
});

// Export the storefront object for making GraphQL queries
export const { getStorefrontApiUrl, getPublicTokenHeaders } = shopifyClient;
