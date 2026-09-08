// Google Analytics (GA4). Loaded only in production builds (import.meta.env.PROD) — never
// during local dev — so testing on localhost doesn't pollute real visitor data. The
// Measurement ID lives in VITE_GA_MEASUREMENT_ID; if it's ever unset, everything here is a
// harmless no-op.
declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

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
