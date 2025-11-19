import { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { ImageUpload } from './imageUpload';

const MAX_NAME_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 66;

export function ProductForm({ index, onRemove, showRemove, onFormChange }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    images: [],
  });

  // Notify parent whenever this form's data changes
  useEffect(() => {
    if (typeof onFormChange === 'function') {
      onFormChange(index, formData);
    }
    // Intentionally exclude onFormChange to avoid new function identity on each render
  }, [index, formData]);

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    price: '',
  });

  const handleNameChange = (value) => {
    if (value.length <= MAX_NAME_LENGTH) {
      setFormData({ ...formData, name: value });
      setErrors({ ...errors, name: '' });
    } else {
      setErrors({ ...errors, name: `Maximum ${MAX_NAME_LENGTH} characters allowed` });
    }
  };

  const handleDescriptionChange = (value) => {
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setFormData({ ...formData, description: value });
      setErrors({ ...errors, description: '' });
    } else {
      setErrors({ ...errors, description: `Maximum ${MAX_DESCRIPTION_LENGTH} characters allowed` });
    }
  };

  const handlePriceChange = (value) => {
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setFormData({ ...formData, price: value });
      setErrors({ ...errors, price: '' });
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Product {index + 1}</h3>
        {showRemove && (
          <button onClick={onRemove} className="text-gray-400 transition-colors hover:text-red-500">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">General Information</h4>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter Product Name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                  <p className="ml-auto text-xs text-gray-500">
                    {formData.name.length}/{MAX_NAME_LENGTH}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Enter Product Description"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.description && (
                    <p className="text-xs text-red-600">{errors.description}</p>
                  )}
                  <p className="ml-auto text-xs text-gray-500">
                    {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Pricing & Stock</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Price
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Upload Image</h4>
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
