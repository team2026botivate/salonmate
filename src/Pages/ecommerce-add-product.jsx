import { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Plus, Save, FileText } from 'lucide-react';
import { ProductForm } from '@/components/Ecommerce/addproduct/addproductForm';

function Ecommerce_Add_product() {
  const [products, setProducts] = useState([0]);
  const [productData, setProductData] = useState({});
  const { user } = useAuth();

  const addProduct = () => {
    setProducts([...products, products.length]);
    console.log(products, 'products');
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
    console.log(products, 'products');
  };

  const updateProductForm = (index, data) => {
    console.log(data, 'data');
    console.log(index, 'index');
    setProductData((prev) => ({ ...prev, [index]: data }));
  };

  const handleSaveProducts = async () => {
    try {
      const storeId = user?.profile?.store_id;
      if (!storeId) {
        throw new Error('Missing store_id. User is not associated with a store.');
      }
      const productsPayload = Object.values(productData || {}).map((p) => ({
        ...p,
        store_id: storeId,
      }));

      console.log(productsPayload, 'product payload ');
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API}/store/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productsPayload }),
      });

      console.log(res, 'after the api call ');

      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || 'Failed to save products');
      }
      // Try parse json if possible
      try {
        const json = JSON.parse(text);
        console.log(json);
      } catch {
        console.log(text);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-900 p-2">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveProducts}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-600"
            >
              <Save className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {products.map((_, index) => (
            <ProductForm
              key={index}
              index={index}
              onRemove={() => removeProduct(index)}
              showRemove={products.length > 1}
              onFormChange={updateProductForm}
            />
          ))}
        </div>

        <button
          onClick={addProduct}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-4 font-medium text-gray-700 transition-all hover:border-green-500 hover:bg-green-50 hover:text-green-500"
        >
          <Plus className="h-5 w-5" />
          Add Another Product
        </button>
      </div>
    </div>
  );
}

export default Ecommerce_Add_product;
