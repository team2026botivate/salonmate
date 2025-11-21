import { ArrowUpRight } from 'lucide-react';
import { useAddToCart } from '@/hook/ecommerce-store-hook';
import { useEcommerceStore } from '@/zustand/ecommerce-store-zustand';
import { useEffect, useState } from 'react';
import ToastPortal from './cart/ToastPortal';

export default function ProductCard({ product, onAddToCart }) {
  const { name, description, price, is_active, image_url } = product;
  const { addToCart, loading, error } = useAddToCart();
  const { setCartLength } = useEcommerceStore();
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2500);
    return () => clearTimeout(t);
  }, [toast.show]);

  const handleAddToCart = async () => {
    try {
      const result = await addToCart(product);

      if (result?.success) {
        // Optional: Notify parent component
        onAddToCart?.(product);
        console.log('Product added to cart:', product);
        setToast({ show: true, type: 'success', message: 'Added to cart' });
        return;
      }
      setToast({ show: true, type: 'error', message: result?.error || 'Failed to add to cart' });
    } catch (err) {
      console.error('Error adding product to cart:', err);
      setToast({ show: true, type: 'error', message: 'Failed to add to cart' });
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

      <div className="flex flex-1 flex-col p-4">
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
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-black px-4 py-2 text-base font-medium text-white transition-colors hover:cursor-pointer hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{loading ? 'Adding...' : 'Add to Cart'}</span>
            {!loading && (
              <ArrowUpRight className="h-5 w-5 rounded-full bg-white text-black transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            )}
          </button>

          {error && <p className="mt-2 text-center text-sm text-red-500">{error}</p>}
        </div>
      </div>

      <ToastPortal toast={toast} />
    </div>
  );
}
