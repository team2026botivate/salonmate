import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../../lib/supabase';

export default function ProductCard({ product, onAddToCart }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (stock < 20) return { text: 'Low Stock', color: 'text-orange-600' };
    return { text: 'In Stock', color: 'text-green-600' };
  };

  const stockStatus = getStockStatus(product.stock);
  const rating = 4.5;

  return (
    <div className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.image_url || 'https://images.pexels.com/photos/18105/pexels-photo.jpg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.stock < 20 && product.stock > 0 && (
          <div className="absolute top-3 left-3 rounded bg-orange-500 px-2 py-1 text-xs font-medium text-white">
            Low Stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 rounded bg-red-500 px-2 py-1 text-xs font-medium text-white">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Price and Rating */}
        <div className="mb-2 flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.tax_rate > 0 && (
              <span className="text-xs text-gray-500">+{product.tax_rate}% tax</span>
            )}
          </div>
          <div className="flex items-center gap-1 rounded bg-orange-50 px-2 py-1">
            <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
            <span className="text-sm font-medium text-gray-900">{rating}</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="mb-2 line-clamp-2 min-h-[3rem] text-base font-semibold text-gray-900">
          {product.name}
        </h3>

        {/* Description */}
        <p className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm text-gray-600">
          {product.description}
        </p>

        {/* Stock Status and Sales */}
        <div className="mb-4 flex items-center justify-between text-xs">
          <span className={`font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
          <span className="text-gray-500">Sold {Math.floor(Math.random() * 200 + 20)}</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart?.(product)}
          disabled={product.stock === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
