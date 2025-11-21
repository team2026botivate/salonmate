import { useCallback, useState } from 'react';
import { ProductForm } from '@/components/Ecommerce/addproduct/addproductForm';
import { Plus, Save, FileText, LoaderCircle, ArrowLeft } from 'lucide-react';
import { useNewProductIntoStore } from '@/hook/ecommerce-store-hook';
import { useNavigate } from 'react-router-dom';
import { uploadProductImage } from '@/lib/uploadProductImage';

export default function Ecommerce_Add_product() {
  const navigate = useNavigate();
  const { add_newProduct_to_store, isLoading } = useNewProductIntoStore();
  const [forms, setForms] = useState([1]);
  const [products, setProducts] = useState([]); //
  const [uploadProgress, setUploadProgress] = useState([]); // per-form index progress 0-100
  const [isUploadingImages, setIsUploadingImages] = useState(false);

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
    const filtered = products.filter(Boolean);
    // Validate required fields: name, description, price, and at least one image
    const invalid = filtered.find((p) => {
      const nameOk = (p?.name || '').trim().length > 0;
      const descOk = (p?.description || '').trim().length > 0;
      const priceOk = (p?.price || '').toString().trim().length > 0;
      const imgOk = Array.isArray(p?.images)
        ? p.images.length > 0
        : !!p?.imageUrl || !!p?.image_url;
      return !(nameOk && descOk && priceOk && imgOk);
    });
    if (invalid) {
      alert('Please fill in all required fields (name, description, price, image).');
      return;
    }

    // 1) Upload images to Supabase if they are File objects
    setIsUploadingImages(true);
    const withUploadedImages = [];
    for (const p of filtered) {
      let imageUrl = p.image_url || p.imageUrl || null;
      // If user used ImageUpload (files array), take first file and upload
      if (!imageUrl && Array.isArray(p.images) && p.images[0]) {
        const file = p.images[0];
        try {
          const index = filtered.indexOf(p);
          imageUrl = await uploadProductImage(file, (pct) => {
            setUploadProgress((prev) => {
              const next = [...prev];
              next[index] = pct;
              return next;
            });
          });
        } catch (e) {
          alert(e?.message || 'Image upload failed');
          setIsUploadingImages(false);
          return;
        }
      }
      withUploadedImages.push({ ...p, imageUrl });
    }
    setIsUploadingImages(false);

    // 2) Transform to backend shape expected by /store/save -> addProduct controller
    const payload = withUploadedImages.map((p) => ({
      name: p.name,
      description: p.description,
      price: p.price, // backend coerces to Number
      image_url: p.image_url || p.imageUrl || null,
      stock: p.stock_quantity ? Number(p.stock_quantity) : 0,
    }));

    await add_newProduct_to_store(payload);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
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
                'inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70'
              }
              disabled={isLoading || isUploadingImages}
            >
              {isLoading || isUploadingImages ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isUploadingImages
                ? `Uploading Images ${Math.round(uploadProgress.filter(Boolean).reduce((a, b) => a + b, 0) / Math.max(1, uploadProgress.filter((v) => v != null).length) || 0)}%`
                : 'Save All Products'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {forms.map((_, index) => (
            <ProductForm
              key={index}
              index={index}
              onFormChange={onFormChange}
              onRemove={() => removeForm(index)}
            />
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
