// Recent searches, kept only in this browser (localStorage) - nothing is sent to or stored on a
// server. Newest first, no duplicates (case-insensitive), capped at MAX_RECENT.
//
// An entry may carry a product id: when the customer picked a specific product from the search
// suggestions, tapping it again in their history goes straight to that product's page instead of
// re-running a search.
export interface RecentSearch {
  term: string;
  id?: string;
}

const KEY = 'pp_recent_searches';
const MAX_RECENT = 6;

export function getRecentSearches(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list
      .map((x: unknown): RecentSearch | null =>
        typeof x === 'string' ? { term: x }
        : x && typeof (x as RecentSearch).term === 'string' ? { term: (x as RecentSearch).term, id: (x as RecentSearch).id }
        : null)
      .filter((x): x is RecentSearch => x !== null)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function save(list: RecentSearch[]): RecentSearch[] {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage unavailable - history just will not persist */ }
  return list;
}

export function addRecentSearch(term: string, id?: string): RecentSearch[] {
  const clean = term.trim();
  if (clean.length < 2) return getRecentSearches();
  const rest = getRecentSearches().filter(s => s.term.toLowerCase() !== clean.toLowerCase());
  return save([{ term: clean, id }, ...rest].slice(0, MAX_RECENT));
}

export function removeRecentSearch(term: string): RecentSearch[] {
  return save(getRecentSearches().filter(s => s.term !== term));
}

export function clearRecentSearches(): RecentSearch[] {
  return save([]);
}
