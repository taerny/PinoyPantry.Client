import { useEffect } from 'react';

// Every route showed the same generic tab title before this - bad for SEO (search engines
// weight the <title> tag heavily) and for anyone with multiple tabs open. Appends the site
// name automatically so callers just pass the page-specific part, e.g. "Canned Goods".
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} — PinoyPantry` : 'PinoyPantry - Authentic Filipino Products';
    return () => { document.title = previousTitle; };
  }, [title]);
}
