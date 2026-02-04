import { motion } from 'framer-motion';
import { Clock, DollarSign, FileText, Plus, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAddService } from '../../hook/dbOperation';
import { supabase } from "../../lib/supabaseClient";
import Papa from 'papaparse';

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
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvError, setCsvError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState('');
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [storeId, setStoreId] = useState(null); // Local state for store ID
  
  const fileInputRef = useRef(null);
  const { addService, addCategory, loading } = useAddService();

  // Get store ID from localStorage
  const getStoreIdFromLocalStorage = () => {
    try {
      const appStorage = localStorage.getItem('app-storage');
      if (appStorage) {
        const parsedStorage = JSON.parse(appStorage);
        return parsedStorage?.state?.store_id || null;
      }
    } catch (error) {
      console.error('Error reading store ID from localStorage:', error);
    }
    return null;
  };

  // Generate slug from category name
  const generateSlug = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

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

  // Fetch categories from Supabase for current store
  const fetchCategories = async () => {
    const currentStoreId = getStoreIdFromLocalStorage();
    if (!currentStoreId) {
      console.log('No store ID found in localStorage');
      return;
    }
    
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .eq("store_id", currentStoreId) // Only fetch categories for current store
      .order("category_name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data);
    }
  };

  useEffect(() => {
    // Get store ID from localStorage on component mount
    const currentStoreId = getStoreIdFromLocalStorage();
    if (currentStoreId) {
      setStoreId(currentStoreId);
      fetchCategories();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!selectedCategoryId) {
      alert('Please select or create a category!');
      return;
    }

    setIsSubmitting(true);
    const newService = await addService({
      ...formData,
      category_id: selectedCategoryId,
    });

    setIsSubmitting(false);
    if (newService) {
      onAddService(newService);
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset states
    setCsvError('');
    setCsvSuccess('');
    setCsvData([]);

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setCsvError('Please upload a CSV file');
      return;
    }

    // Get store ID from localStorage before parsing
    const currentStoreId = getStoreIdFromLocalStorage();
    if (!currentStoreId) {
      setCsvError('Store ID not found. Please ensure you are logged in and have a store selected.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setCsvError('Error parsing CSV file');
          return;
        }

        const data = results.data;
        
        // Validate CSV structure - Only category, service_name, and price are required
        const requiredColumns = ['category', 'service_name', 'price'];
        const firstRow = data[0] || {};
        const missingColumns = requiredColumns.filter(col => !firstRow.hasOwnProperty(col));
        
        if (missingColumns.length > 0) {
          setCsvError(`Missing required columns: ${missingColumns.join(', ')}`);
          return;
        }

        // Validate data
        const errors = [];
        const validData = [];
        
        data.forEach((row, index) => {
          const rowErrors = [];
          
          if (!row.category || !row.category.trim()) {
            rowErrors.push('Category is required');
          }
          
          if (!row.service_name || !row.service_name.trim()) {
            rowErrors.push('Service name is required');
          }
          
          // Duration is optional, but if provided, validate it
          if (row.duration && !durationOptions.includes(row.duration.trim())) {
            rowErrors.push(`Duration must be one of: ${durationOptions.join(', ')} or left empty`);
          }
          
          if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0) {
            rowErrors.push('Valid price is required');
          }
          
          if (row.description && row.description.length > 30) {
            rowErrors.push('Description must be 30 characters or less');
          }
          
          if (rowErrors.length === 0) {
            validData.push({
              category: row.category.trim(),
              name: row.service_name.trim(),
              duration: row.duration ? row.duration.trim() : '30 min',
              price: row.price.trim(),
              description: (row.description || '').trim(),
              // Append store ID from localStorage to each service
              store_id: currentStoreId
            });
          } else {
            errors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
          }
        });

        if (errors.length > 0) {
          setCsvError(`Found ${errors.length} error(s): ${errors.join('; ')}`);
        }

        if (validData.length > 0) {
          setCsvData(validData);
          setCsvSuccess(`Successfully parsed ${validData.length} valid service(s) for store: ${currentStoreId.substring(0, 8)}...`);
          setShowCsvModal(true);
        } else {
          setCsvError('No valid services found in CSV');
        }
      },
      error: (error) => {
        setCsvError('Error reading CSV file');
      }
    });
  };

  // Handle category creation with proper data structure
  const handleCreateCategory = async (categoryName) => {
    const currentStoreId = getStoreIdFromLocalStorage();
    if (!currentStoreId) {
      console.error('Store ID is required to create a category');
      return null;
    }

    const categoryData = {
      category_name: categoryName,
      slug: generateSlug(categoryName),
      description: '',
      icon: '',
      is_active: true,
      store_id: currentStoreId // Store ID from localStorage
    };

    try {
      const newCategory = await addCategory(categoryData);
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  };

  const processCsvData = async () => {
    if (csvData.length === 0) return;

    setIsProcessingCsv(true);
    setCsvError('');
    setCsvSuccess('');

    let successCount = 0;
    let errorCount = 0;
    const errorMessages = [];

    for (const service of csvData) {
      try {
        // Find or create category - check for current store only
        let categoryId = null;
        const existingCategory = categories.find(
          c => c.category_name.toLowerCase() === service.category.toLowerCase() && 
               c.store_id === service.store_id // Use the store_id from CSV data
        );

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category with proper data structure including store_id from CSV
          const categoryData = {
            category_name: service.category,
            slug: generateSlug(service.category),
            description: '',
            icon: '',
            is_active: true,
            store_id: service.store_id // Use store_id from CSV data
          };

          // Call addCategory with the complete category data
          const newCategory = await addCategory(categoryData);
          if (newCategory) {
            categoryId = newCategory.id;
            setCategories(prev => [...prev, newCategory]);
          }
        }

        if (!categoryId) {
          errorCount++;
          errorMessages.push(`${service.name}: Failed to create/find category`);
          continue;
        }

        // Add service
        const newService = await addService({
          name: service.name,
          duration: service.duration,
          price: service.price,
          description: service.description,
          category_id: categoryId
        });

        if (newService) {
          successCount++;
          onAddService(newService);
        } else {
          errorCount++;
          errorMessages.push(`${service.name}: Failed to add service`);
        }
      } catch (error) {
        errorCount++;
        errorMessages.push(`${service.name}: ${error.message}`);
      }
    }

    setIsProcessingCsv(false);
    
    if (errorCount > 0) {
      setCsvError(`Failed to import ${errorCount} service(s): ${errorMessages.join('; ')}`);
    }
    
    if (successCount > 0) {
      setCsvSuccess(`Successfully imported ${successCount} service(s) for your store`);
      setShowCsvModal(false);
      setCsvData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh categories list for current store
      fetchCategories();
    }
  };

  // Handle manual category creation in the form
  const handleManualCategoryCreate = async () => {
    const currentStoreId = getStoreIdFromLocalStorage();
    if (!currentStoreId) {
      alert('Store ID is required to create a category. Please ensure you are logged in.');
      return;
    }

    setIsCreating(true);
    const newCategory = await handleCreateCategory(category.trim());
    setIsCreating(false);

    if (newCategory) {
      setCategories((prev) => [...prev, newCategory]);
      setSelectedCategoryId(newCategory.id);
      setCategory(newCategory.category_name);
      setIsCategoryOpen(false);
    }
  };

  // Helper function to check if category exists for current store
  const getCategoriesForCurrentStore = () => {
    const currentStoreId = getStoreIdFromLocalStorage();
    if (!currentStoreId) return [];
    
    return categories.filter(category => category.store_id === currentStoreId);
  };

  // Get current store ID for display
  const currentStoreId = getStoreIdFromLocalStorage();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Service</h2>
          </div>
          
          <motion.label
            htmlFor="csv-upload"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              ref={fileInputRef}
            />
          </motion.label>
        </div>

        {/* Store ID Info */}
        {currentStoreId ? (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              Store ID: <span className="font-mono">{currentStoreId.substring(0, 8)}...</span>
              <span className="ml-2 text-xs">(All imported services will be linked to your store)</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Source: localStorage → app-storage.state.store_id
            </p>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              Warning: Store ID not found in localStorage. 
              Please ensure you are logged in and have selected a store.
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Expected location: localStorage → app-storage.state.store_id
            </p>
          </div>
        )}

        {/* CSV Status Messages */}
        {(csvError || csvSuccess) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-lg ${csvError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}
          >
            <p className={`text-sm ${csvError ? 'text-red-700' : 'text-green-700'}`}>
              {csvError || csvSuccess}
            </p>
          </motion.div>
        )}

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
                disabled={!currentStoreId}
              />

              {isCategoryOpen && currentStoreId && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                  {getCategoriesForCurrentStore().filter((c) =>
                    c.category_name.toLowerCase().includes(category.toLowerCase())
                  ).length > 0 ? (
                    getCategoriesForCurrentStore()
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
                        No categories found for your store
                      </div>
                    )
                  )}

                  {!getCategoriesForCurrentStore().some(
                    (c) =>
                      c.category_name.toLowerCase() === category.trim().toLowerCase()
                  ) && category.trim() !== "" && (
                    <div
                      onClick={handleManualCategoryCreate}
                      disabled={isCreating || !currentStoreId}
                      className="px-4 py-2 cursor-pointer text-green-600 hover:bg-green-50 transition-colors flex items-center justify-between border-t border-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>+ Create "{category.trim()}" for your store</span>
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
                Duration
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

          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={loading || isSubmitting || !selectedCategoryId || !currentStoreId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 ${(loading || isSubmitting || !selectedCategoryId || !currentStoreId) ? 'opacity-75 cursor-not-allowed' : ''
                }`}
            >
              {(loading || isSubmitting) ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* CSV Preview Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Import Preview ({csvData.length} services)
                  </h3>
                  {csvData.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Store ID: <span className="font-mono text-xs">{csvData[0]?.store_id?.substring(0, 12)}...</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowCsvModal(false);
                    setCsvData([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  All {csvData.length} services will be imported for your store. 
                  Each service will be linked to store ID from localStorage.
                </p>
              </div>

              <div className="overflow-y-auto max-h-[300px] border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Service Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Store ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvData.map((service, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {service.category}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {service.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {service.duration}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ₹{service.price}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
                          {service.store_id?.substring(0, 8)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCsvModal(false);
                    setCsvData([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isProcessingCsv}
                >
                  Cancel
                </button>
                <button
                  onClick={processCsvData}
                  disabled={isProcessingCsv || !currentStoreId}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingCsv ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Import {csvData.length} Services</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};