import { ArrowUpRight } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
  const { name, slug, description, price, sku, stock, tax_rate, is_active, image_url, created_at } =
    product;

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl">
      {/* Image Section */}
      <div className="relative p-3">
        <img src={image_url} alt={name} className="h-65 w-full rounded-lg object-cover shadow-xl" />

        {/* Badge */}
        {is_active && (
          <div className="absolute top-6 left-5 rounded-full bg-white px-2 py-1 backdrop-blur-3xl">
            <span className="text-sm font-semibold text-black">Active</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h2 className="mb-1 text-xl leading-tight font-bold text-gray-900">{name}</h2>
          <div className="rounded-xl bg-gray-100 px-3 py-1">
            <span className="text-base font-semibold text-gray-900">₹{price}</span>
          </div>
        </div>
        <p className="mb-4 w-[70%] text-sm leading-relaxed text-wrap text-gray-400">
          {description}
        </p>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onAddToCart?.(product)}
            className="group flex w-full items-center justify-center gap-5 rounded-xl bg-black px-4 py-2 text-base font-medium text-white transition-colors hover:cursor-pointer hover:bg-gray-800"
          >
            Add to Cart
            <ArrowUpRight className="h-5 w-5 rounded-full bg-white text-black transition-all duration-300 group-hover:translate-x-1 hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
