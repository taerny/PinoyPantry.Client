import { createStorefrontClient } from '@shopify/hydrogen-react';

/**
 * Shopify Storefront API Client
 * 
 * This client is configured with your store credentials from .env
 */

const storeDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '';
const storefrontAccessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || '2025-07';

// Shopify is no longer the active data source — validation removed.
// Data now comes from the .NET API via VITE_API_URL.

export const shopifyClient = createStorefrontClient({
  storeDomain,
  storefrontApiVersion: apiVersion,
  publicStorefrontToken: storefrontAccessToken,
});

// Export the storefront object for making GraphQL queries
export const { getStorefrontApiUrl, getPublicTokenHeaders } = shopifyClient;
