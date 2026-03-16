import { createStorefrontClient } from '@shopify/hydrogen-react';

// Shopify is no longer the active data source.
// Data now comes from the .NET API via VITE_API_URL.
// This stub prevents @shopify/hydrogen-react from throwing at startup
// when credentials are absent (which crashes the whole app).

const storeDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '';
const storefrontAccessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || '2025-07';

// The library throws if storeDomain is empty, so only call it when configured.
const _client = storeDomain
  ? createStorefrontClient({ storeDomain, storefrontApiVersion: apiVersion, publicStorefrontToken: storefrontAccessToken })
  : null;

export const shopifyClient = {
  getStorefrontApiUrl: () => _client?.getStorefrontApiUrl() ?? '',
  getPublicTokenHeaders: () => _client?.getPublicTokenHeaders() ?? {},
};

export const getStorefrontApiUrl = shopifyClient.getStorefrontApiUrl;
export const getPublicTokenHeaders = shopifyClient.getPublicTokenHeaders;
