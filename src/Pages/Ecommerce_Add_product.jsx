import { useCallback, useState } from 'react';
import ProductForm from '@/components/Ecommerce/addproduct/ProductForm';
import { Plus, Save, FileText, LoaderCircle, ArrowLeft } from 'lucide-react';
import { useNewProductIntoStore } from '@/hook/ecommerce-store-hook';
import { useNavigate } from 'react-router-dom';

export default function Ecommerce_Add_product() {
  const navigate = useNavigate();
  const { add_newProduct_to_store, isLoading } = useNewProductIntoStore();
  const [forms, setForms] = useState([1]);
  const [products, setProducts] = useState([]); //

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
    const emptyFields = products.map(
      (value) =>
        value.name === '' || value.imageUrl === '' || value.description === '' || value.price === ''
    );

    if (emptyFields.some(Boolean)) {
      alert('Please fill in all required fields');
      return;
    }
    const filtered = products.filter(Boolean);

    await add_newProduct_to_store(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div  className='flex items-center gap-5'>
            <div onClick={() => navigate(-1)} className="hover:cursor-pointer">
              <ArrowLeft />
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-900 p-2">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Products</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveAll}
              className={
                isLoading
                  ? 'inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-600'
                  : 'inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-600'
              }
            >
              {isLoading ? <LoaderCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              Save All Products
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
