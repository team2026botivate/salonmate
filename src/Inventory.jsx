import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Sparkles } from 'lucide-react';
import { calculateInventoryStats, calculateStockStatus } from './utils/inventory';
import DashboardCards from './components/inventory/DashboardCards';
import AddProductForm from './components/inventory/AddProductForm';
import InventoryTable from './components/inventory/InventoryTable';
import EditModal from './components/inventory/EditModal';
import { useGetInventoryData, useInventoryMutations } from './hook/dbOperation';
import InventoryProductUsage from './components/inventory/inventory.product.usage';
function App() {
  const { data, loading, error, refetch } = useGetInventoryData();
  const { addProduct, updateProduct } = useInventoryMutations();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Map DB rows -> UI shape whenever data changes
  useEffect(() => {
    if (!data) return;
    const mapped = (data || []).map((row) => ({
      id: row.product_id,
      name: row.product_name,
      stockQuantity: row.stock_quantity,
      purchaseDate: row.purchase_date, // ISO date string (YYYY-MM-DD)
      costPrice: Number(row.cost_price),
      stockStatus: row.stock_status || calculateStockStatus(Number(row.stock_quantity) || 0),
    }));
    setProducts(mapped);
  }, [data]);

  const handleAddProduct = (newProduct) => {
    // Ensure stockStatus aligns with quantity
    const payload = {
      ...newProduct,
      stockStatus: calculateStockStatus(Number(newProduct.stockQuantity) || 0),
    };
    (async () => {
      const saved = await addProduct(payload);
      if (saved) {
        await refetch();
      }
    })();
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = (updatedProduct) => {
    const payload = {
      ...updatedProduct,
      stockStatus: calculateStockStatus(Number(updatedProduct.stockQuantity) || 0),
    };
    (async () => {
      const saved = await updateProduct(payload);
      if (saved) {
        await refetch();
      }
    })();
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const stats = calculateInventoryStats(products);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container px-4 py-8 mx-auto">
        {loading && <div className="mb-4 text-sm text-gray-600">Loading inventory...</div>}
        {error && <div className="mb-4 text-sm text-red-600">{String(error)}</div>}
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Salon Dashboard</h1>
              <p className="flex items-center gap-2 text-gray-600">
                <Sparkles className="w-4 h-4" />
                Inventory Management System
              </p>
            </div>
          </div>
        </motion.header>

        {/* Dashboard Cards */}
        <DashboardCards stats={stats} />

        {/* Inventory Product Usage */}

      
        <InventoryProductUsage allData={products} />

        {/* Add Product Form */}
        <AddProductForm onAddProduct={handleAddProduct} />

        {/* Inventory Table */}
        <InventoryTable products={products} onEditProduct={handleEditProduct} />

        {/* Edit Modal */}
        <EditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          product={editingProduct}
          onSave={handleSaveProduct}
        />
      </div>
    </div>
  );
}

export default App;
