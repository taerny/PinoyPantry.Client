import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { HeroContentService, DEFAULT_HERO_CONTENT, type HeroContent } from '../services/heroContentService';

interface HeroContentContextType {
  content: HeroContent;
  loading: boolean;
}

const HeroContentContext = createContext<HeroContentContextType>({
  content: DEFAULT_HERO_CONTENT,
  loading: true,
});

// How often an already-open tab re-checks for admin changes (e.g. maintenance mode
// being flipped on) without the visitor needing to manually refresh.
const POLL_INTERVAL_MS = 20_000;

/**
 * Single fetch + poll for site content (hero, footer, top bar, maintenance mode),
 * shared via context so Header/Hero/Footer/App's maintenance gate all read the same
 * data instead of each firing their own request.
 */
export function HeroContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchContent = () => {
      HeroContentService.getHeroContent()
        .then(data => { if (!cancelled) setContent(data); })
        .catch(() => { /* keep last known content on a transient failure */ })
        .finally(() => { if (!cancelled) setLoading(false); });
    };

    fetchContent();
    const interval = setInterval(fetchContent, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <HeroContentContext.Provider value={{ content, loading }}>
      {children}
    </HeroContentContext.Provider>
  );
}

export function useHeroContent() {
  return useContext(HeroContentContext);
}
