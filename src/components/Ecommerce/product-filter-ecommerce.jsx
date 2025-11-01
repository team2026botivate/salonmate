import { Check, Shield } from 'lucide-react';



export default function ProductFilter({
  filters,
  onFilterChange,
  onClearFilters,
}) {
  const toggleArrayFilter = (
    key,
    value
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filter</h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Supplier Types */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Suppliers Types</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                filters.supplierTypes.includes('trade')
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-300 group-hover:border-orange-400'
              }`}
              onClick={() => toggleArrayFilter('supplierTypes', 'trade')}
            >
              {filters.supplierTypes.includes('trade') && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <Shield className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-700">Trade Assurance</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                filters.supplierTypes.includes('verified')
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300 group-hover:border-blue-400'
              }`}
              onClick={() => toggleArrayFilter('supplierTypes', 'verified')}
            >
              {filters.supplierTypes.includes('verified') && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <Check className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-700">Verified Suppliers</span>
          </label>
        </div>
      </div>

      {/* Product Types */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Types</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                filters.productTypes.includes('ready')
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-300 group-hover:border-orange-400'
              }`}
              onClick={() => toggleArrayFilter('productTypes', 'ready')}
            >
              {filters.productTypes.includes('ready') && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-sm text-gray-700">Ready to Ship</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                filters.productTypes.includes('paid')
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-300 group-hover:border-orange-400'
              }`}
              onClick={() => toggleArrayFilter('productTypes', 'paid')}
            >
              {filters.productTypes.includes('paid') && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-sm text-gray-700">Paid Samples</span>
          </label>
        </div>
      </div>

      {/* Condition */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Condition</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                filters.condition.includes('new')
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-300 group-hover:border-orange-400'
              }`}
              onClick={() => toggleArrayFilter('condition', 'new')}
            >
              {filters.condition.includes('new') && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-sm text-gray-700">New Stuff</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                filters.condition.includes('secondhand')
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-300 group-hover:border-orange-400'
              }`}
              onClick={() => toggleArrayFilter('condition', 'secondhand')}
            >
              {filters.condition.includes('secondhand') && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-sm text-gray-700">Second hand</span>
          </label>
        </div>
      </div>

      {/* Min Order */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Min Order</h3>
        <div className="relative">
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={filters.minOrder}
            onChange={(e) =>
              onFilterChange({ ...filters, minOrder: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>10</span>
            <span className="font-medium text-gray-900">{filters.minOrder}</span>
            <span>1000</span>
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Price</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-gray-400">$</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, priceMin: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-gray-400">$</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, priceMax: parseInt(e.target.value) || 10000 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 text-xs text-gray-600">
            <button
              onClick={() => onFilterChange({ ...filters, priceMin: 0, priceMax: 500 })}
              className="px-3 py-1 border border-gray-300 rounded hover:border-orange-500 hover:text-orange-600"
            >
              Under $500
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, priceMin: 500, priceMax: 1000 })}
              className="px-3 py-1 border border-gray-300 rounded hover:border-orange-500 hover:text-orange-600"
            >
              $500 - $1000
            </button>
          </div>
          <button
            onClick={() => onFilterChange({ ...filters, priceMin: 1000, priceMax: 1500 })}
            className="w-full text-xs px-3 py-1 border border-gray-300 rounded hover:border-orange-500 hover:text-orange-600 text-left"
          >
            $1000 - $1500
          </button>
        </div>
      </div>
    </div>
  );
}
