import { Loader2 } from 'lucide-react';
import { useState } from 'react';
// import { supabase } from '../../lib/supabas
import { doFilterProduct } from '@/lib/filterSearch';
import ProductCard from './product-card-ecommerce-component';

import { useAuth } from '@/Context/AuthContext';
import { useAllProductStore, useEcommerceStore } from '@/zustand/ecommerce-store-zustand';
import { useEffect } from 'react';
import { useEcommerceStoreFetchAllProduct } from '@/hook/ecommerce-store-hook';

export default function ProductGrid({ searchTerm, currentPage, itemsPerPage, onProductsLoaded }) {
  const { allProduct } = useAllProductStore();
  const { fetchAllProducts } = useEcommerceStoreFetchAllProduct();
  const { setCartLength, cartLength } = useEcommerceStore();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  //filter all the products

  const handleAddToCart = async (product) => {

    console.log(product,"form outter page ")

    
    const {} = product


    // setCartLength(cartLength + 1);
  };

  const filterdProduct = allProduct?.data ? doFilterProduct(allProduct.data, searchTerm) : [];
  // Effect to fetch products when page or limit changes
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      await fetchAllProducts(currentPage, itemsPerPage);
      setLoading(false);
    };

    loadProducts();
  }, [currentPage, itemsPerPage]);

  // Effect to update total products when API response changes
  useEffect(() => {
    if (!allProduct) return;

    const totalFromApi =
      allProduct.total ??
      allProduct.totalCount ??
      allProduct.total_count ??
      allProduct.count ??
      allProduct.pagination?.total ??
      allProduct.meta?.total;

    if (typeof totalFromApi === 'number') {
      onProductsLoaded(totalFromApi);
    }
  }, [allProduct, currentPage, onProductsLoaded]);

  if (filterdProduct?.length === 0 && !loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <p className="text-lg font-medium text-gray-600">No products found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5271FF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-600">Error loading products</p>
        <p className="mt-2 text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (filterdProduct.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <p className="text-lg font-medium text-gray-600">No products found</p>
        <p className="mt-2 text-sm text-gray-500">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filterdProduct.map((product) => (

        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
      ))}
    </div>
  );
}
