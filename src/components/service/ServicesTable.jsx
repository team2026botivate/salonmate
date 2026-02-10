import { motion } from 'framer-motion';
import { Clock, DollarSign, FileText, Plus, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAddService } from '../../hook/dbOperation';
import { supabase } from "../../lib/supabaseClient";
import Papa from 'papaparse';
import { useAppData } from '@/zustand/appData';

const durationOptions = [
  '15 min', '30 min', '45 min', '1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours'
];

const AddServiceForm = ({ onAddService }) => {
  const { store_id } = useAppData(); // Get store_id from app data
  
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
  const [csvData, setCsvData] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
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
      .eq("store_id", store_id) // Filter by current store
      .order("category_name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      console.log("Fetched categories:", data);
      setCategories(data || []);
    }
  };

  useEffect(() => {
    if (store_id) {
      fetchCategories();
    }
  }, [store_id]);

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

  // Handle CSV file upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFileName(file.name);
    setUploadStatus('');
    setUploadProgress(0);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('Parsed CSV data:', results.data);
        setCsvData(results.data);
        analyzeCsvData(results.data);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setUploadStatus('Error parsing CSV file');
      }
    });
  };

  // Analyze CSV data to categorize services
  const analyzeCsvData = (data) => {
    if (!data || data.length === 0) {
      setUploadStatus('No valid data found in CSV');
      return;
    }

    // Extract unique categories from CSV
    const uniqueCategories = [...new Set(data.map(row => row.category_name).filter(Boolean))];
    console.log('Unique categories in CSV:', uniqueCategories);
    
    if (uniqueCategories.length === 0) {
      setUploadStatus('No categories found in CSV. Please ensure CSV has "category_name" column.');
    }
  };

  // Process and upload CSV data
  const processCsvUpload = async () => {
    if (!csvData || csvData.length === 0) {
      setUploadStatus('No data to upload');
      return;
    }

    // Check if store_id is available
    if (!store_id) {
      setUploadStatus('Error: Store ID not available. Please try again.');
      setIsUploading(false);
      return;
    }

    setIsUploading(true);
    setUploadStatus('Starting upload...');
    setUploadProgress(0);

    try {
      // Step 1: Process categories first
      const categoriesMap = new Map();
      const uniqueCategories = [...new Set(csvData.map(row => row.category_name).filter(Boolean))];
      
      let categoryProgress = 0;
      for (const categoryName of uniqueCategories) {
        setUploadStatus(`Creating category: ${categoryName}`);
        
        // Check if category already exists for this store
        let category = categories.find(c => 
          c.category_name === categoryName && c.store_id === store_id
        );
        
        if (!category) {
          // Create new category for current store
          const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const { data, error } = await supabase
            .from('service_categories')
            .insert([{
              category_name: categoryName,
              slug: slug,
              description: null,
              icon: null,
              is_active: true,
              store_id: store_id // Use current store ID
            }])
            .select()
            .single();

          if (error) throw error;
          category = data;
          setCategories(prev => [...prev, category]);
        }
        
        categoriesMap.set(categoryName, category.id);
        categoryProgress++;
        setUploadProgress(Math.round((categoryProgress / uniqueCategories.length) * 50));
      }

      // Step 2: Process hair services
      let serviceProgress = 0;
      const totalServices = csvData.length;
      
      for (const row of csvData) {
        setUploadStatus(`Uploading service: ${row.service_name || 'Unknown'}`);
        
        const categoryId = categoriesMap.get(row.category_name);
        if (!categoryId) {
          console.warn(`No category found for: ${row.category_name}`);
          continue;
        }

        // Map CSV columns to hair_service table
        const serviceData = {
          serial_no: row.serial_no || null,
          service_id: row.service_id || null,
          service_name: row.service_name || null,
          time_duration: row.time_duration || '30 min',
          base_price: parseFloat(row.base_price) || 0,
          description: row.description || null,
          delete_flag: row.delete_flag === 'true' || row.delete_flag === true,
          store_id: store_id, // Use current store ID
          category_id: categoryId
        };

        // Insert into hair_service table
        const { error } = await supabase
          .from('hair_service')
          .insert([serviceData]);

        if (error) {
          console.error('Error inserting service:', error);
          throw error;
        }

        serviceProgress++;
        setUploadProgress(50 + Math.round((serviceProgress / totalServices) * 50));
      }

      setUploadStatus(`Successfully uploaded ${csvData.length} services from CSV`);
      
      // Refresh categories list
      await fetchCategories();
      
      // Reset CSV data
      setCsvData(null);
      setCsvFileName('');
      
    } catch (error) {
      console.error('Error processing CSV upload:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadStatus('');
        setUploadProgress(0);
      }, 3000);
    }
  };

  // Sample CSV template for download
  const downloadSampleCsv = () => {
    const sampleData = [
      {
        serial_no: 'SVC-001',
        service_id: 'Eyebrows',
        service_name: 'Eyebrows',
        time_duration: '30 min',
        base_price: '60',
        description: '',
        delete_flag: 'false',
        category_name: 'Threading'
      },
      {
        serial_no: 'SVC-002',
        service_id: 'Haircut',
        service_name: 'Haircut',
        time_duration: '30 min',
        base_price: '500',
        description: 'Basic haircut',
        delete_flag: 'false',
        category_name: 'Hair Services'
      }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_services_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
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
          <h2 className="text-xl font-semibold text-gray-900">Add Services</h2>
        </div>
        
        {/* CSV Upload Button */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Download Template
          </button>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
              disabled={isUploading}
            />
            <div className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload CSV</span>
            </div>
          </label>
        </div>
      </div>

      {/* CSV Upload Status */}
      {csvFileName && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">{csvFileName}</span>
              <span className="text-sm text-gray-600">({csvData?.length || 0} rows)</span>
            </div>
            <button
              onClick={() => {
                setCsvData(null);
                setCsvFileName('');
                setUploadStatus('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {csvData && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Found {csvData.length} services in {[...new Set(csvData.map(row => row.category_name).filter(Boolean))].length} categories
              </div>

              {uploadStatus && (
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{uploadStatus}</span>
                    <span className="text-gray-700">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={processCsvUpload}
                disabled={isUploading || !store_id}
                className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                  isUploading || !store_id
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : !store_id ? (
                  <span>Waiting for store information...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Process and Upload CSV Data</span>
                  </>
                )}
              </button>
            </div>
          )}
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
            />

            {isCategoryOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
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
                        onMouseDown={(e) => {
                          e.preventDefault();
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

                {!categories.some(
                  (c) =>
                    c.category_name.toLowerCase() === category.trim().toLowerCase()
                ) && category.trim() !== "" && (
                    <div
                      onMouseDown={async (e) => {
                        e.preventDefault();
                        setIsCreating(true);
                        // Pass store_id when creating category
                        const newCat = await addCategory({
                          name: category.trim(),
                          store_id: store_id
                        });
                        setIsCreating(false);

                        if (newCat) {
                          setCategories((prev) => [...prev, newCat]);
                          setSelectedCategoryId(newCat.id);
                          setCategory(newCat.category_name);
                          setIsCategoryOpen(false);
                        }
                      }}
                      disabled={isCreating || !store_id}
                      className={`px-4 py-2 cursor-pointer text-green-600 hover:bg-green-50 transition-colors flex items-center justify-between border-t border-gray-200 font-medium ${isCreating || !store_id ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        <div className="flex space-x-4">
          <motion.button
            type="submit"
            disabled={loading || !store_id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 ${isSubmitting || !store_id ? 'opacity-75 cursor-not-allowed' : ''
              }`}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : !store_id ? (
              <span>Waiting for store information...</span>
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
  );
}; 



export default AddServiceForm