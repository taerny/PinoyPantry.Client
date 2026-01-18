/**
 * Shopify Customer Account Service
 * 
 * Redirects to Shopify's hosted customer account pages (no backend needed)
 * Works with Shopify Legacy Customer Accounts
 */

const storeDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '';

// Shopify hosted account URLs
const SHOPIFY_REGISTER_URL = `https://${storeDomain}/account/register`;
const SHOPIFY_LOGIN_URL = `https://${storeDomain}/account/login`;
const SHOPIFY_ACCOUNT_URL = `https://${storeDomain}/account`;

/**
 * Redirect to Shopify's registration page
 */
export async function registerCustomer(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}) {
  // Since we can't call the API directly from the browser (CORS),
  // we redirect to Shopify's hosted registration page
  
  // Store return URL so Shopify can redirect back
  const returnUrl = window.location.href;
  localStorage.setItem('shopify_return_url', returnUrl);
  
  // Redirect to Shopify's registration page
  window.location.href = `${SHOPIFY_REGISTER_URL}?return_url=${encodeURIComponent(returnUrl)}`;
  
  // Return pending status (redirect is in progress)
  return {
    success: false,
    redirect: true,
    message: 'Redirecting to registration page...',
  };
}

/**
 * Redirect to Shopify's login page
 */
export async function loginCustomer(email: string, password: string) {
  // Redirect to Shopify's hosted login page
  
  // Store return URL so Shopify can redirect back
  const returnUrl = window.location.href;
  localStorage.setItem('shopify_return_url', returnUrl);
  
  // Redirect to Shopify's login page
  window.location.href = `${SHOPIFY_LOGIN_URL}?return_url=${encodeURIComponent(returnUrl)}`;
  
  // Return pending status (redirect is in progress)
  return {
    success: false,
    redirect: true,
    message: 'Redirecting to login page...',
  };
}

/**
 * Check if customer is logged in (check for Shopify session)
 */
export function isCustomerLoggedIn(): boolean {
  // Check if there's a Shopify customer session
  // This would typically be handled by Shopify's customer account system
  // For now, we'll check localStorage or cookies
  return document.cookie.includes('customer_token') || 
         localStorage.getItem('shopify_customer_logged_in') === 'true';
}

/**
 * Redirect to customer account page
 */
export function goToAccount() {
  window.location.href = SHOPIFY_ACCOUNT_URL;
}

/**
 * Logout - redirect to logout URL
 */
export async function logoutCustomer() {
  // Clear local storage
  localStorage.removeItem('shopify_customer_token');
  localStorage.removeItem('shopify_customer_token_expires');
  localStorage.removeItem('shopify_customer_logged_in');
  
  // Redirect to Shopify logout
  window.location.href = `${storeDomain}/account/logout`;
  
  return {
    success: true,
  };
}
