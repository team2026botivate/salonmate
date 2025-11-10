import { ArrowUpRight } from "lucide-react";
import { useAddToCart } from "@/hook/ecommerce-store-hook";
import { useEcommerceStore } from "@/zustand/ecommerce-store-zustand";

export default function ProductCard({ product, onAddToCart, storeId }) {
  const { name, description, price, is_active, image_url } = product;
  const { addToCart, loading, error } = useAddToCart();
  const { cartLength, setCartLength } = useEcommerceStore();

  const handleAddToCart = async () => {
    try {
      // Update global cart count
      setCartLength(cartLength + 1);

      const result = await addToCart(product, storeId);

      if (result?.success) {

        // Optional: Notify parent component
        onAddToCart?.(product);
        console.log('Product added to cart:', product);
        return;

      }
      // If addTocart failed, rollback optimistic change
      setCartLength(prev => Math.max(0, prev - 1));
      console.log('Error adding product to cart: ', result?.error || error);
    } catch (err) {
      setCartLength(prev => Math.max(0, prev - 1));
      console.error("Error adding product to cart:", err);
    }
  };

  return (
    <div className="relative flex h-full w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-xl">
      <div className="relative p-3">
        <img
          src={image_url || '/placeholder.png'}
          alt={name}
          className="h-64 w-full rounded-lg object-cover shadow-lg"
        />
        {is_active && (
          <div className="pointer-events-none absolute top-6 left-5 rounded-full bg-white px-2 py-1 backdrop-blur-sm">
            <span className="text-sm font-semibold text-black">Active</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between">
          <h2 className="mb-1 text-xl leading-tight font-bold text-gray-900">{name}</h2>
          <div className="rounded-xl bg-gray-100 px-3 py-1">
            <span className="text-base font-semibold text-gray-900">₹{price}</span>
          </div>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-gray-500">{description}</p>

        <div className="mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-black px-4 py-2 text-base font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{loading ? 'Adding...' : 'Add to Cart'}</span>
            {!loading && (
              <ArrowUpRight className="h-5 w-5 rounded-full bg-white text-black transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            )}
          </button>

          {error && <p className="mt-2 text-center text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}