// Google Analytics (GA4). Loaded only in production builds (import.meta.env.PROD) — never
// during local dev — so testing on localhost doesn't pollute real visitor data. The
// Measurement ID lives in VITE_GA_MEASUREMENT_ID; if it's ever unset, everything here is a
// harmless no-op.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

// Must be assigned to window.gtag, not just kept as a local helper — gtag.js's own internal
// features (Enhanced Measurement's scroll/click/outbound-link tracking) call window.gtag(...)
// directly to report what they observe. Without a real global gtag, the library still loads
// and processes dataLayer internally (so it looks like it's "working"), but never actually
// sends any measurement hit — confirmed by testing: no network request fires until this
// exists as a callable global, even though the script and dataLayer show no errors otherwise.
function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}
window.gtag = gtag;

let initialized = false;

// Call once on app startup. Injects the gtag.js script and does the initial config — GA's own
// "Enhanced measurement" already sends the first page_view automatically from this, so no
// manual event needed for the very first load.
export function initAnalytics() {
  if (initialized || !import.meta.env.PROD || !GA_MEASUREMENT_ID) return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Google Consent Mode (default) — gtag.js now withholds actual measurement hits until
  // consent is explicitly granted, even outside the EU and with no cookie banner in play.
  // This site doesn't run ads/remarketing, so only analytics_storage needs to be granted;
  // the ad_* signals stay denied since nothing here uses them.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  });

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
}

// Call on every client-side route change. This is a single-page app — React Router swaps
// pages without a real browser navigation, so GA's automatic page_view tracking only ever
// sees the very first load unless each route change is reported manually like this.
export function trackPageView(path: string) {
  if (!import.meta.env.PROD || !GA_MEASUREMENT_ID) return;
  gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
