import { ChevronDown, Grid3x3, X } from 'lucide-react';

const sortOptions = [
  { value: 'best_match', label: 'Best Match' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductSearchBar({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
  searchQuery,  
  activeFilters,
  onRemoveFilter,
  onClearAllFilters,
}) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            1 - {Math.min(16, resultCount)} over {resultCount} result for{' '}
            <span className="text-orange-600">"{searchQuery}"</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm font-medium text-gray-900 hover:border-orange-400 focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          {/* View Toggle */}
          <button className="rounded-lg border border-gray-300 p-2 transition-colors hover:border-orange-400 hover:bg-orange-50">
            <Grid3x3 className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <div
              key={filter}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm"
            >
              <span className="text-gray-700">{filter}</span>
              <button
                onClick={() => onRemoveFilter(filter)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={onClearAllFilters}
            className="ml-2 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
