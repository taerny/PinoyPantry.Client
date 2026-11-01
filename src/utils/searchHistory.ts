// Recent searches, kept only in this browser (localStorage) - nothing is sent to or stored on a
// server. Newest first, no duplicates (case-insensitive), capped at MAX_RECENT.
const KEY = 'pp_recent_searches';
const MAX_RECENT = 6;

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s): s is string => typeof s === 'string').slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function save(list: string[]): string[] {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage unavailable - history just will not persist */ }
  return list;
}

export function addRecentSearch(term: string): string[] {
  const clean = term.trim();
  if (clean.length < 2) return getRecentSearches();
  const rest = getRecentSearches().filter(s => s.toLowerCase() !== clean.toLowerCase());
  return save([clean, ...rest].slice(0, MAX_RECENT));
}

export function removeRecentSearch(term: string): string[] {
  return save(getRecentSearches().filter(s => s !== term));
}

export function clearRecentSearches(): string[] {
  return save([]);
}
