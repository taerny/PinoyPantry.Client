import { Clock, X } from 'lucide-react';

interface RecentSearchesProps {
  searches: string[];
  onPick: (term: string) => void;
  onRemove: (term: string) => void;
  onClear: () => void;
  className?: string;
}

// Dropdown shown under the search box (while it is empty) listing the customer's last few searches.
export function RecentSearches({ searches, onPick, onRemove, onClear, className = '' }: RecentSearchesProps) {
  if (searches.length === 0) return null;
  return (
    <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <span className="text-xs text-gray-500 font-semibold uppercase">Recent searches</span>
        <button type="button" onClick={onClear} className="text-xs text-[#D32F2F] hover:underline">
          Clear all
        </button>
      </div>
      <ul className="py-1">
        {searches.map(term => (
          <li key={term} className="flex items-center hover:bg-[#FAF3E0] transition-colors">
            <button
              type="button"
              onClick={() => onPick(term)}
              className="flex-1 min-w-0 flex items-center gap-3 px-4 py-2.5 text-left text-sm text-[#3E2723]"
            >
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{term}</span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(term)}
              className="p-2 mr-2 text-gray-300 hover:text-[#D32F2F] rounded transition-colors"
              aria-label={`Remove ${term} from recent searches`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
