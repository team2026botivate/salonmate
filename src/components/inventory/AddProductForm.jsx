import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { calculateStockStatus } from "../../utils/inventory";


const AddProductForm = ({ onAddProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    stockQuantity: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    costPrice: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newProduct = {
      id: Date.now().toString(),
      ...formData,
      stockStatus: calculateStockStatus(formData.stockQuantity),
    };

    onAddProduct(newProduct);
    
    // Reset form
    setFormData({
      name: '',
      stockQuantity: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      costPrice: 0,
    });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl"
    >
      <h2 className="mb-6 text-xl font-bold text-gray-900">Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label htmlFor="stockQuantity" className="block mb-1 text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
            type="number"
            id="stockQuantity"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="0"
          />
        </div>

        <div>
          <label htmlFor="purchaseDate" className="block mb-1 text-sm font-medium text-gray-700">
            Purchase Date
          </label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            className="w-full px-3 py-2 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="costPrice" className="block mb-1 text-sm font-medium text-gray-700">
            Cost Price (₹)
          </label>
          <input
            type="number"
            id="costPrice"
            name="costPrice"
            value={formData.costPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="0.00"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddProductForm;