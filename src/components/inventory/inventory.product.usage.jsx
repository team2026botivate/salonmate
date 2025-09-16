import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  Plus,
  Minus,
  User,
  MessageSquare,
  Check,
  X,
  ShoppingBag,
  Sparkles,
  Scissors,
  Heart,
} from 'lucide-react';
import {
  useGetInventoryData,
  useGetStaffData,
  useRecordInventoryUsage,
} from '../../hook/dbOperation';

const categories = ['All'];

const getCategoryIcon = (category) => {
  return <Package className="w-4 h-4" />;
};

const InventoryProductUsage = () => {
  // Fetch inventory from DB
  const { data: invRows, loading: invLoading, error: invError, refetch } = useGetInventoryData();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usageQuantity, setUsageQuantity] = useState(1);
  // Staff from DB
  const { data: staffRows, loading: staffLoading } = useGetStaffData();
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [usageNote, setUsageNote] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { recordUsage, loading: usageLoading, error: usageError } = useRecordInventoryUsage();
  const [errorToast, setErrorToast] = useState('');

  // Map DB rows to UI products on load
  useEffect(() => {
    const placeholderImg =
      '/3.png';

      
    const mapped = (invRows || []).map((row) => ({
      id: row.product_id,
      name: row.product_name,
      category: 'General',
      brand: '',
      stock: Number(row.stock_quantity) || 0,
      unit: 'units',
      image: placeholderImg,
      lowStockThreshold: 5,
    }));

    
    setProducts(mapped);
    setFilteredProducts(mapped);
  }, [invRows]);

  // Default staff select
  useEffect(() => {
    if (Array.isArray(staffRows) && staffRows.length > 0) {
      setSelectedStaffId(String(staffRows[0].id));
    }
  }, [staffRows]);

  // Filter products based on search, category, and low stock
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Low stock filter
    if (showLowStock) {
      filtered = filtered.filter((product) => product.stock <= product.lowStockThreshold);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, showLowStock]);

  const handleUseProduct = (product) => {
    setSelectedProduct(product);
    setUsageQuantity(1);
    setUsageNote('');
    setIsModalOpen(true);
  };

  const handleConfirmUsage = () => {
    if (!selectedProduct || usageQuantity <= 0 || usageQuantity > selectedProduct.stock) return;

    const staffObj = (staffRows || []).find((s) => String(s.id) === String(selectedStaffId));
    const staffName = staffObj?.staff_name || '';

    (async () => {
      const ok = await recordUsage({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: usageQuantity,
        staffId: selectedStaffId || null,
        staffName,
        note: usageNote,
      });

      console.log(ok);
      if (ok) {
        // Optimistically reflect in UI
        setProducts((prev) =>
          prev.map((p) =>
            p.id === selectedProduct.id ? { ...p, stock: Math.max(p.stock - usageQuantity, 0) } : p
          )
        );
        // Refetch from DB to stay in sync
        await refetch?.();

        setIsModalOpen(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
        setSelectedProduct(null);
        setUsageQuantity(1);
        setUsageNote('');
      } else {
        const msg = usageError || 'Failed to record usage. Please try again.';
        console.error('Confirm usage failed:', msg);
        setErrorToast(msg);
        setTimeout(() => setErrorToast(''), 4000);
      }
    })();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setUsageQuantity(1);
    setUsageNote('');
  };

  const adjustQuantity = (delta) => {
    const newQuantity = usageQuantity + delta;
    if (newQuantity >= 1 && newQuantity <= (selectedProduct?.stock || 0)) {
      setUsageQuantity(newQuantity);
    }
  };

  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Track daily product usage and manage stock levels</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {filteredProducts.length} Products
                  </span>
                </div>
              </div>
              {lowStockCount > 0 && (
                <div className="px-4 py-2 border rounded-lg bg-amber-50 border-amber-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      {lowStockCount} Low Stock
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 bg-white border shadow-sm rounded-xl">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search products or brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 transition-all border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden transition-all duration-300 bg-white border shadow-sm rounded-xl hover:shadow-lg group"
            >
              {/* Product Image */}
              <div className="relative h-40 overflow-hidden ">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock <= product.lowStockThreshold
                        ? 'bg-red-100 text-red-800'
                        : product.stock <= product.lowStockThreshold * 2
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {product.stock} {product.unit}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="mb-3">
                  <div className="flex items-center mb-1 space-x-2">
                    {getCategoryIcon(product.category)}
                    <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="mb-1 font-semibold text-gray-900">{product.name}</h3>
                  {product.brand ? <p className="text-sm text-gray-600">{product.brand}</p> : null}
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Stock Level</span>
                    <span
                      className={`text-sm font-bold ${
                        product.stock <= product.lowStockThreshold
                          ? 'text-red-600'
                          : product.stock <= product.lowStockThreshold * 2
                            ? 'text-amber-600'
                            : 'text-green-600'
                      }`}
                    >
                      {product.stock} {product.unit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        product.stock <= product.lowStockThreshold
                          ? 'bg-red-500'
                          : product.stock <= product.lowStockThreshold * 2
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min((product.stock / (product.lowStockThreshold * 3)) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Use Product Button */}
                <button
                  onClick={() => handleUseProduct(product)}
                  disabled={product.stock === 0 || usageLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{product.stock === 0 ? 'Out of Stock' : 'Use Product'}</span>
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Usage Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Record Product Usage</h2>
                <button
                  onClick={closeModal}
                  className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Product Info */}
              <div className="flex items-center p-4 mb-6 space-x-4 rounded-lg bg-gray-50">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="object-cover w-16 h-16 rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedProduct.name}</h3>
                  {selectedProduct.brand ? (
                    <p className="text-sm text-gray-600">{selectedProduct.brand}</p>
                  ) : null}
                  <p className="text-sm font-medium text-green-600">
                    Available: {selectedProduct.stock} {selectedProduct.unit}
                  </p>
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="mb-6">
                <label className="block mb-3 text-sm font-medium text-gray-700">
                  Quantity to Use
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => adjustQuantity(-1)}
                    disabled={usageQuantity <= 1}
                    className="p-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct.stock}
                      value={usageQuantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        if (value >= 1 && value <= selectedProduct.stock) {
                          setUsageQuantity(value);
                        }
                      }}
                      className="w-full px-4 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => adjustQuantity(1)}
                    disabled={usageQuantity >= selectedProduct.stock}
                    className="p-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Remaining after use: {selectedProduct.stock - usageQuantity}{' '}
                  {selectedProduct.unit}
                </p>
              </div>

              {/* Staff Selection */}
              <div className="mb-6">
                <label className="block mb-3 text-sm font-medium text-gray-700">Staff Member</label>
                <div className="relative">
                  <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {(staffRows || []).map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.staff_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Usage Note */}
              <div className="mb-6">
                <label className="block mb-3 text-sm font-medium text-gray-700">
                  Usage Note (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <textarea
                    value={usageNote}
                    onChange={(e) => setUsageNote(e.target.value)}
                    placeholder="Add a note about this usage..."
                    rows="3"
                    className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUsage}
                  disabled={
                    !selectedStaffId ||
                    usageQuantity <= 0 ||
                    usageQuantity > selectedProduct.stock ||
                    usageLoading
                  }
                  className="flex-1 px-4 py-3 font-medium text-white transition-all rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>{usageLoading ? 'Saving...' : 'Confirm Usage'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed z-50 px-6 py-4 text-white bg-green-600 rounded-lg shadow-lg bottom-6 right-6 animate-slide-up">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">Product usage recorded successfully!</span>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {!!errorToast && (
        <div className="fixed z-50 px-6 py-4 text-white bg-red-600 rounded-lg shadow-lg bottom-6 right-6 animate-slide-up">
          <div className="flex items-center space-x-2">
            <X className="w-5 h-5" />
            <span className="font-medium">{errorToast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryProductUsage;
