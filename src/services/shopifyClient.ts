import { createStorefrontClient } from '@shopify/hydrogen-react';

/**
 * Shopify Storefront API Client
 * 
 * This client is configured with your store credentials from .env
 */

const storeDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '';
const storefrontAccessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || '2025-07';

// Validate required environment variables in production
if (import.meta.env.PROD) {
  if (!storeDomain) {
    throw new Error(
      'VITE_SHOPIFY_STORE_DOMAIN is required in production. ' +
      'Please set it in your Netlify environment variables.'
    );
  }
  if (!storefrontAccessToken) {
    throw new Error(
      'VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN is required in production. ' +
      'Please set it in your Netlify environment variables.'
    );
  }
}

export const shopifyClient = createStorefrontClient({
  storeDomain,
  storefrontApiVersion: apiVersion,
  publicStorefrontToken: storefrontAccessToken,
});

// Export the storefront object for making GraphQL queries
export const { getStorefrontApiUrl, getPublicTokenHeaders } = shopifyClient;
