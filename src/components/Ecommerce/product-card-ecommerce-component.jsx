import { ArrowUpRight } from "lucide-react";

export default function ProductCard({ product, onAddToCart }) {
  const {
    name,
    description,
    price,
    is_active,
    image_url,
  } = product;



  return (
    <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-xl">
      {/* Image Section */}
      <div className="relative z-0 p-3">
        <img
          src={image_url || "/placeholder.png"}
          alt={name}
          className="h-64 w-full rounded-lg object-cover shadow-lg"
        />

        {/* Badge */}
        {is_active && (
          <div className="absolute top-6 left-5 z-10 rounded-full bg-white px-2 py-1 backdrop-blur-3xl pointer-events-none">
            <span className="text-sm font-semibold text-black">Active</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <h2 className="mb-1 text-xl font-bold leading-tight text-gray-900">
            {name}
          </h2>
          <div className="rounded-xl bg-gray-100 px-3 py-1">
            <span className="text-base font-semibold text-gray-900">₹{price}</span>
          </div>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-gray-500">
          {description}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart?.(product)}
          className="group relative z-30 flex w-full items-center justify-center gap-3 rounded-xl bg-black px-4 py-2 text-base font-medium text-white transition-colors duration-300 hover:bg-gray-800 cursor-pointer"
        >
          <span>Add to Cart</span>
          <ArrowUpRight className="h-5 w-5 rounded-full bg-white text-black transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </button>
      
      </div>
    </div>
  );
}
