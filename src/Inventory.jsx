import React, { useState, useEffect } from 'react';
import { useInventoryMutations } from './hook/dbOperation';
import { InventoryHeader } from './components/inventory/InventoryHeader';
import { DashboardCards } from './components/inventory/DashboardCards';
import { ProductListView, ProductGridView, EmptyState } from './components/inventory/InventoryTable';
import { AddProductModal, AddWarehouseStockModal, BuyStockModal } from './components/inventory/Modals';
import {
  useProducts,
  useWarehouse,
  useStockPurchase
} from './hook/dbOperation';
import { useAuth } from './Context/AuthContext';

const Inventory = () => {
  const { user } = useAuth();
  const storeId = user?.profile?.store_id;
  const { addProduct } = useProducts();
  const { addWarehouseStock, getWarehouseData } = useWarehouse();
  const { buyStock } = useStockPurchase();
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockSalon: 0,
    lowStockWarehouse: 0,
    totalValue: 0
  });

  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddWarehouseStockModal, setShowAddWarehouseStockModal] = useState(false);
  const [showBuyStockModal, setShowBuyStockModal] = useState(false);
  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState(null);

  // Form states
  const [newProduct, setNewProduct] = useState({
    product_name: '',
    category: '',
    unit: '',
    price: '',
    description: '',
    stock_quantity: 0,
    warehouse_quantity: 0,
    cost_price: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  const [warehouseStock, setWarehouseStock] = useState({
    product_id: '',
    quantity: '',
    notes: ''
  });

  const [buyStockForm, setBuyStockForm] = useState({
    quantity: '',
    purchase_date: new Date().toISOString().split('T')[0],
    add_to: 'salon',
    notes: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Refetch function
  const refetch = async () => {
    setLoading(true);
    const res = await getWarehouseData(storeId);
    if (res.success) {
      const mapped = (res.data || []).map((row) => ({
        id: row.product_id,
        name: row.product_name,
        category: row.category || '',
        description: row.description || 'No description available',
        image: row.image || 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&q=80&w=200&h=200',
        unit: row.unit || 'Unit',
        sku: `SKU-${row.product_id}`,
        price: Number(row.cost_price) || 0,
        stock: {
          salon: Number(row.stock_quantity) || 0,
          warehouse: Number(row.warehouse_quantity) || 0,
          min_salon: 5
        }
      }));

      setProducts(mapped);
      const uniqueCategories = [...new Set(mapped.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
      calculateStats(mapped);
      setError(null);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  // Replace the useEffect that fetches warehouse data (around line 100-110):
  useEffect(() => {
    const load = async () => {
      if (!storeId) {
        console.log("No storeId available");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const res = await getWarehouseData(storeId);

        if (res.success) {
          // Map the view data to UI format
          const mappedData = (res.data || []).map((item) => ({
            id: item.product_id,
            name: item.product_name,
            category: item.category || 'Uncategorized',
            unit: item.unit || 'Unit',
            description: item.description || '',
            price: Number(item.cost_price) || 0,
            purchase_date: item.purchase_date,
            stock: {
              salon: Number(item.stock_quantity) || 0,
              warehouse: Number(item.warehouse_quantity) || 0,
              min_salon: 5
            }
          }));

          setProducts(mappedData);
          calculateStats(mappedData);
        } else {
          setError(res.error || 'Failed to fetch warehouse data');
          console.error('Error:', res.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [storeId]);

  // Fetch warehouse data on mount
  useEffect(() => {
    if (storeId) {
      refetch();
    }
  }, [storeId]);

  const calculateStats = (productList) => {
    const lowStockSalon = productList.filter(p => p.stock.salon <= p.stock.min_salon).length;
    const lowStockWarehouse = productList.filter(p => p.stock.warehouse === 0).length;
    const totalValue = productList.reduce((sum, p) => sum + (p.price * p.stock.salon), 0);

    setStats({
      totalProducts: productList.length,
      lowStockSalon,
      lowStockWarehouse,
      totalValue
    });
  };

  const filteredProducts = products.filter(p =>
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTransfer = async (product) => {
    const transferAmount = Math.min(5, product.stock.warehouse);
    if (transferAmount > 0) {
      try {
        await updateProduct({
          product_id: product.id,
          new_salon_stock: product.stock.salon + transferAmount,
          new_warehouse_stock: product.stock.warehouse - transferAmount
        });
        await refetch();
      } catch (err) {
        console.error('Error transferring stock:', err);
        alert('Failed to transfer stock. Please try again.');
      }
    }
  };

  const handleBuyStock = (product) => {
    setSelectedProductForPurchase(product);
    setBuyStockForm({
      quantity: '',
      purchase_date: new Date().toISOString().split('T')[0],
      add_to: 'salon',
      notes: ''
    });
    setShowBuyStockModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // Determine if this is a new product or existing product
      const isNewProduct = !newProduct.product_id;
      
      const result = await addProduct(newProduct, storeId, isNewProduct);
      if (!result.success) {
        throw new Error(result.error || "Failed to add product");
      }
      await refetch();
      setShowAddProductModal(false);
      resetNewProductForm();
    } catch (err) { 
      console.error('Add product error:', err);
      alert(`Failed to add product: ${err.message}`);
    }
  };

  const handleAddWarehouseStock = async (e) => {
    e.preventDefault();

    try {
      const result = await addWarehouseStock({
        product_id: warehouseStock.product_id,
        quantity: Number(warehouseStock.quantity)
      }, storeId);

      if (!result.success) {
        throw new Error(result.error || "Failed to add warehouse stock");
      }

      await refetch();
      setShowAddWarehouseStockModal(false);
      resetWarehouseStockForm();
    } catch (err) {
      console.error('Warehouse stock error:', err);
      alert(`Failed to add warehouse stock: ${err.message}`);
    }
  };
  const handleBuyStockSubmit = async (e) => {
    e.preventDefault();

    const quantity = Number(buyStockForm.quantity);
    if (quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (buyStockForm.add_to === 'salon' && quantity > selectedProductForPurchase.stock.warehouse) {
      alert(`Only ${selectedProductForPurchase.stock.warehouse} units available in warehouse`);
      return;
    }

    try {
      const result = await buyStock({
        product_id: selectedProductForPurchase.id,
        product_name: selectedProductForPurchase.name, // <-- Add this line
        quantity: quantity,
        add_to: buyStockForm.add_to,
        purchase_date: buyStockForm.purchase_date
      }, storeId);

      if (!result.success) {
        throw new Error(result.error || "Failed to transfer stock");
      }

      await refetch();
      setShowBuyStockModal(false);
    } catch (err) {
      console.error('Buy stock error:', err);
      alert(`Failed to transfer stock: ${err.message}`);
    }
  };

  const resetNewProductForm = () => {
    setNewProduct({
      product_name: '',
      category: '',
      unit: '',
      price: '',
      description: '',
      stock_quantity: '',
      warehouse_quantity: '',
      cost_price: '',
      purchase_date: new Date().toISOString().split('T')[0]
    });
    setImagePreview(null);
  };

  const resetWarehouseStockForm = () => {
    setWarehouseStock({
      product_id: '',
      quantity: '',
      notes: ''
    });
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-1">
      <InventoryHeader stats={stats} />

      <main className="max-w-7xl mx-auto sm:px-6 lg:px-4 py-8">
        <DashboardCards
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddProduct={() => setShowAddProductModal(true)}
          onAddWarehouseStock={() => setShowAddWarehouseStockModal(true)}
        />

        {/* Loading/Error States */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">Loading inventory...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            Error loading inventory: {String(error)}
          </div>
        )}

        {/* Content Area */}
        {!loading && filteredProducts.length > 0 && (
          viewMode === 'list' ? (
            <ProductListView
              products={filteredProducts}
              onTransfer={handleTransfer}
              onBuyStock={handleBuyStock}
            />
          ) : (
            <ProductGridView
              products={filteredProducts}
              onTransfer={handleTransfer}
              onBuyStock={handleBuyStock}
            />
          )
        )}

        {!loading && filteredProducts.length === 0 && <EmptyState />}
      </main>

      {/* Modals */}
      <AddProductModal
        show={showAddProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          resetNewProductForm();
        }}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
        products={products}   // ✅ PASS PRODUCTS
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        onSubmit={handleAddProduct}
      />

      <AddWarehouseStockModal
        show={showAddWarehouseStockModal}
        onClose={() => {
          setShowAddWarehouseStockModal(false);
          resetWarehouseStockForm();
        }}
        warehouseStock={warehouseStock}
        setWarehouseStock={setWarehouseStock}
        products={products}
        onSubmit={handleAddWarehouseStock}
      />

      <BuyStockModal
        show={showBuyStockModal}
        onClose={() => {
          setShowBuyStockModal(false);
          setSelectedProductForPurchase(null);
        }}
        selectedProduct={selectedProductForPurchase}
        buyStockForm={buyStockForm}
        setBuyStockForm={setBuyStockForm}
        onSubmit={handleBuyStockSubmit}
      />
    </div>
  );
};

export default Inventory;