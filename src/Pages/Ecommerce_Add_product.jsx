import { useCallback, useState } from 'react';
import ProductForm from '@/components/Ecommerce/addproduct/ProductForm';
import { Plus, Save, FileText } from 'lucide-react';

export default function Ecommerce_Add_product() {
  const [forms, setForms] = useState([0]); // track number of forms
  const [products, setProducts] = useState([]); // collected product data

  const addForm = () => setForms((prev) => [...prev, prev.length]);

  const removeForm = (index) => {
    setForms((prev) => prev.filter((_, i) => i !== index));
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const onFormChange = useCallback((index, data) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = data;
      return next;
    });
  }, []);

  const saveAll = async () => {
    try {
      const filtered = products.filter(Boolean);
      const res = await fetch('http://localhost:5000/api/products/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: filtered }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to save');
      // eslint-disable-next-line no-alert
      alert('Products saved successfully');
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message || 'Error saving products');
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
            <h1 className="text-2xl font-bold text-gray-900">Add New Products</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveAll}
              className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-600"
            >
              <Save className="h-4 w-4" /> Save All Products
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {forms.map((_, index) => (
            <ProductForm key={index} index={index} onChange={onFormChange} onRemove={removeForm} />
          ))}
        </div>

        <button
          onClick={addForm}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-4 font-medium text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
        >
          <Plus className="h-5 w-5" /> Add Another Product
        </button>
      </div>
    </div>
  );
}
