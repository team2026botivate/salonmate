import { motion } from 'framer-motion';
import { Clock, DollarSign, FileText, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAddService } from '../../hook/dbOperation';
import { supabase } from "../../lib/supabaseClient";

const durationOptions = [
  '15 min', '30 min', '45 min', '1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours'
];

export const AddServiceForm = ({ onAddService }) => {
  const [formData, setFormData] = useState({
    name: '',
    duration: '30 min',
    price: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState(''); // input value
  const [categories, setCategories] = useState([]); // fetched from supabase
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // id to link
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { addService, addCategory, loading } = useAddService();
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (formData.description.length > 30) {
      newErrors.description = 'Description must be 30 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Fetch categories from Supabase
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .order("category_name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!selectedCategoryId) {
      alert('Please select or create a category!');
      return;
    }

    const newService = await addService({
      ...formData,
      category_id: selectedCategoryId,
    });

    if (newService) {
      onAddService(newService); // callback to parent
      setFormData({ name: '', duration: '30 min', price: '', description: '' });
      setCategory('');
      setSelectedCategoryId(null);
      setErrors({});
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <Plus className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Add New Service</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <div className="relative">
            <input
              type="text"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSelectedCategoryId(null);
              }}
              onFocus={() => setIsCategoryOpen(true)}
              onBlur={() => setTimeout(() => setIsCategoryOpen(false), 200)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Search or select category..."
            />

            {/* Dropdown - Show all categories when focused */}
            {isCategoryOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {/* Filtered categories */}
                {categories.filter((c) =>
                  c.category_name.toLowerCase().includes(category.toLowerCase())
                ).length > 0 ? (
                  categories
                    .filter((c) =>
                      c.category_name.toLowerCase().includes(category.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setCategory(c.category_name);
                          setSelectedCategoryId(c.id);
                          setIsCategoryOpen(false);
                        }}
                        className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0 ${selectedCategoryId === c.id ? 'bg-indigo-100 text-indigo-900' : ''}`}
                      >
                        {c.category_name}
                      </div>
                    ))
                ) : (
                  category.trim() === "" && (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      No categories found
                    </div>
                  )
                )}

                {/* Create New if no exact match */}
                {!categories.some(
                  (c) =>
                    c.category_name.toLowerCase() === category.trim().toLowerCase()
                ) && category.trim() !== "" && (
                  <div
                    onClick={async () => {
                      setIsCreating(true);
                      const newCat = await addCategory(category.trim());
                      setIsCreating(false);

                      if (newCat) {
                        setCategories((prev) => [...prev, newCat]);
                        setSelectedCategoryId(newCat.id);
                        setCategory(newCat.category_name);
                        setIsCategoryOpen(false);
                      }
                    }}
                    disabled={isCreating}
                    className="px-4 py-2 cursor-pointer text-green-600 hover:bg-green-50 transition-colors flex items-center justify-between border-t border-gray-200 font-medium disabled:opacity-50"
                  >
                    <span>+ Create "{category.trim()}"</span>
                    <Plus className="w-4 h-4" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="e.g., Haircut & Style"
            />
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs mt-1"
              >
                {errors.name}
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                {durationOptions.map(duration => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs mt-1"
              >
                {errors.price}
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
              <span className="text-xs text-gray-500 ml-1">
                ({formData.description.length}/30)
              </span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={30}
                rows={2}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Brief description..."
              />
            </div>
            {errors.description && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs mt-1"
              >
                {errors.description}
              </motion.p>
            )}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};