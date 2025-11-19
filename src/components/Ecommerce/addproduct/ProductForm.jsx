import { useEffect, useMemo, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadProductImage } from '@/lib/uploadProductImage';


const initialState = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
};

const MAX_NAME_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 66;

export default function ProductForm({ index, onChange, onRemove }) {
  const [form, setForm] = useState(initialState);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // NEW: error states for UI
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (typeof onChange === 'function') onChange(index, form);
  }, [index, form]);

  const handleNameInput = (e) => {
    const value = e.target.value;

    if (value.length <= MAX_NAME_LENGTH) {
      setForm((prev) => ({ ...prev, name: value }));
      setFieldErrors((prev) => ({ ...prev, name: '' }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        name: `Maximum ${MAX_NAME_LENGTH} characters allowed`,
      }));
    }
  };

  const handleDescriptionInput = (e) => {
    const value = e.target.value;

    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setForm((prev) => ({ ...prev, description: value }));
      setFieldErrors((prev) => ({ ...prev, description: '' }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        description: `Maximum ${MAX_DESCRIPTION_LENGTH} characters allowed`,
      }));
    }
  };

  const handleInput = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const valid = ['image/jpeg', 'image/png'];
    if (!valid.includes(file.type)) {
      setError('Only JPEG or PNG images are allowed');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const publicUrl = await uploadProductImage(file);
      setForm((prev) => ({ ...prev, imageUrl: publicUrl }));
    } catch (err) {
      setError(err?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const hasImage = useMemo(() => Boolean(form.imageUrl), [form.imageUrl]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Product {index + 1}</h3>
        <button
          type="button"
          onClick={() => onRemove?.(index)}
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          <X className="mr-1 h-4 w-4" /> Remove
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">

          {/* NAME FIELD */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Product Name</label>

            <input
              type="text"
              value={form.name}
              onChange={handleNameInput}
              placeholder="Enter product name"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 transition outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />

            {/* error + counter */}
            <div className="mt-1 flex items-center justify-between">
              {fieldErrors.name && (
                <p className="text-xs text-red-600">{fieldErrors.name}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {form.name.length}/{MAX_NAME_LENGTH}
              </p>
            </div>
          </div>

          {/* DESCRIPTION FIELD */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Product Description
            </label>

            <textarea
              rows={4}
              value={form.description}
              onChange={handleDescriptionInput}
              placeholder="Enter product description"
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 transition outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />

            {/* error + counter */}
            <div className="mt-1 flex items-center justify-between">
              {fieldErrors.description && (
                <p className="text-xs text-red-600">{fieldErrors.description}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {form.description.length}/{MAX_DESCRIPTION_LENGTH}
              </p>
            </div>
          </div>

          {/* PRICE FIELD */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleInput('price')}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 transition outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 ">Product Image</label>
          <div className="relative flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
            {hasImage ? (
              <img
                src={form.imageUrl}
                alt="Product"
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="text-center text-gray-500">
                <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                <p className="text-sm">Upload JPEG or PNG</p>
              </div>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFile}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>

          {uploading && <p className="mt-2 text-sm text-blue-600">Uploading...</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
