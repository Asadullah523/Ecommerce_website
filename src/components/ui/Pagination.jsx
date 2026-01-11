import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Pagination UI component
 * Handles page numbering and navigation for large lists (e.g., orders).
 */
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // To keep it simple and premium, we show a limited number of page buttons if there are many pages
  // For now, let's just render all of them as the number of orders won't be in the thousands immediately
  
  return (
    <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-white/5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl bg-bg-800 border border-gray-700 text-gray-400 hover:text-white hover:border-accent-cyan disabled:opacity-30 disabled:hover:border-gray-700 disabled:hover:text-gray-400 transition-all"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-xl font-black text-sm transition-all border ${
              currentPage === page
                ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                : 'bg-bg-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl bg-bg-800 border border-gray-700 text-gray-400 hover:text-white hover:border-accent-cyan disabled:opacity-30 disabled:hover:border-gray-700 disabled:hover:text-gray-400 transition-all"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
