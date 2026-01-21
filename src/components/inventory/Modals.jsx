import React, { useState, useMemo } from 'react';
import { X, Package, ArrowRightLeft, Warehouse, IndianRupee, ImagePlus, Calendar, Store, Plus, Search, ChevronDown } from 'lucide-react';

// Add Product Modal
export const AddProductModal = ({
    show,
    onClose,
    newProduct,
    setNewProduct,
    categories,
    products,
    imagePreview,
    setImagePreview,
    onSubmit,
    onImageUpload
}) => {
    const [searchText, setSearchText] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isNewProduct, setIsNewProduct] = useState(true);

    // Filter products based on search text - MOVE BEFORE EARLY RETURN
    const filteredProducts = useMemo(() => {
        if (!searchText.trim()) return products || [];
        return (products || []).filter(p =>
            p.name.toLowerCase().includes(searchText.toLowerCase()) ||
            p.unit.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText, products]);

    // Check if exact match exists - MOVE BEFORE EARLY RETURN
    const exactMatchExists = useMemo(() => {
        return (products || []).some(p =>
            p.name.toLowerCase() === searchText.toLowerCase()
        );
    }, [searchText, products]);

    // NOW the early return can be here
    if (!show) return null;

    // Handle selecting existing product
    const handleSelectProduct = (product) => {
        setSearchText(product.name);
        setSelectedProductId(product.id);
        setIsNewProduct(false);
        setShowDropdown(false);

        setNewProduct({
            product_name: product.name,
            description: product.description || "",
            category: product.category || "",
            unit: product.unit || "",
            cost_price: product.price || "",
            image: product.image || "",
            stock_quantity: 0,
            warehouse_quantity: 0,
            purchase_date: new Date().toISOString().split('T')[0],
            product_id: product.id // ✅ Store the existing product ID
        });
    };

    // Handle creating new product
    const handleCreateNewProduct = () => {
        setSelectedProductId(null);
        setIsNewProduct(true);
        setShowDropdown(false);

        setNewProduct({
            product_name: searchText,
            description: "",
            category: "",
            unit: "",
            cost_price: "",
            image: "",
            stock_quantity: 0,
            warehouse_quantity: 0,
            purchase_date: new Date().toISOString().split('T')[0],
            product_id: null // ✅ Clear product_id for new products
        });
    };

    // Handle clearing selection
    const handleClearSelection = () => {
        setSearchText("");
        setSelectedProductId(null);
        setIsNewProduct(true);
        setShowDropdown(false);
        setNewProduct({
            product_name: '',
            description: '',
            category: '',
            unit: '',
            cost_price: '',
            image: '',
            stock_quantity: 0,
            warehouse_quantity: 0,
            purchase_date: ''
        });
    };

    // Reset modal after submission
    const resetModal = () => {
        setSearchText("");
        setSelectedProductId(null);
        setIsNewProduct(true);
        setShowDropdown(false);
        setImagePreview(null);
    };

    // Handle form submission
    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Validate required fields
        if (!newProduct.product_name) {
            alert("Please enter product name");
            return;
        }
        if (isNewProduct && !newProduct.category) {
            alert("Please select category");
            return;
        }
        if (!newProduct.unit) {
            alert("Please enter unit");
            return;
        }
        if (!newProduct.cost_price) {
            alert("Please enter cost price");
            return;
        }
        if (!newProduct.purchase_date) {
            alert("Please select purchase date");
            return;
        }

        // Check for duplicate product (same name + unit)
        if (isNewProduct) {
            const duplicate = (products || []).find(p =>
                p.name.toLowerCase() === newProduct.product_name.toLowerCase() &&
                p.unit.toLowerCase() === newProduct.unit.toLowerCase()
            );

            if (duplicate) {
                alert(`Product "${newProduct.product_name}" with unit "${newProduct.unit}" already exists. Please select it from the dropdown.`);
                return;
            }
        }

        onSubmit(e);
        resetModal(); // ✅ Reset modal after successful submission
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 py-4 flex items-center justify-between rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Package className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {isNewProduct ? 'Add New Product' : 'Add Inventory'}
                            </h2>
                            <p className="text-indigo-100 text-sm">
                                {isNewProduct
                                    ? 'Create a new product and set initial inventory'
                                    : `Update inventory for ${newProduct.product_name}`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="text-white" size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">

                        {/* Product Selection Section */}
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-indigo-200">
                            <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <Search size={16} /> Select or Create Product
                            </h3>

                            {/* Hybrid Select Field */}
                            <div className="relative">
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={searchText}
                                            onChange={(e) => {
                                                setSearchText(e.target.value);
                                                setShowDropdown(true);
                                                setIsNewProduct(true);
                                                setSelectedProductId(null);
                                            }}
                                            onFocus={() => setShowDropdown(true)}
                                            placeholder="Search existing products or type new name..."
                                            className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                        />
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                    {selectedProductId && (
                                        <button
                                            type="button"
                                            onClick={handleClearSelection}
                                            className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors text-sm whitespace-nowrap"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-indigo-200 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
                                        {filteredProducts.length > 0 ? (
                                            <div>
                                                <div className="p-2 border-b border-slate-100">
                                                    {filteredProducts.map((product) => (
                                                        <button
                                                            key={product.id}
                                                            type="button"
                                                            onClick={() => handleSelectProduct(product)}
                                                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors mb-1 ${selectedProductId === product.id
                                                                    ? 'bg-indigo-100 border border-indigo-300'
                                                                    : 'hover:bg-indigo-50 border border-transparent'
                                                                }`}
                                                        >
                                                            <div className="font-semibold text-slate-800 text-sm">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                Unit: {product.unit} • Category: {product.category}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Create New Option */}
                                                {!exactMatchExists && searchText.trim() && (
                                                    <div className="border-t border-slate-200 p-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleCreateNewProduct}
                                                            className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-green-200"
                                                        >
                                                            <Plus size={16} /> Create New: <b>"{searchText}"</b>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : searchText.trim() ? (
                                            <div className="p-4 text-center">
                                                <p className="text-slate-500 text-sm mb-3">
                                                    No products found matching "{searchText}"
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={handleCreateNewProduct}
                                                    className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-green-200"
                                                >
                                                    <Plus size={16} /> Create as New Product
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-slate-500 text-sm">
                                                Type to search or create a new product
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selected Product Info */}
                            {!isNewProduct && selectedProductId && (
                                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-300 bg-green-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-green-200">
                                            <img
                                                src={newProduct.image}
                                                alt={newProduct.product_name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/48';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-800">
                                                {newProduct.product_name}
                                            </p>
                                            <p className="text-xs text-green-600 font-medium">
                                                ✓ Existing product selected - updating inventory only
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* New Product Info */}
                            {isNewProduct && searchText.trim() && (
                                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-300 bg-blue-50">
                                    <p className="text-sm font-semibold text-slate-800">
                                        Creating new product: <span className="text-indigo-600">"{searchText}"</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Fill in the details below to complete the product creation
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Image Upload Section */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Product Image URL:</label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        value={newProduct.image}
                                        onChange={(e) => {
                                            setNewProduct({ ...newProduct, image: e.target.value });
                                            setImagePreview(e.target.value);
                                        }}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Product Name <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    {/* Input */}
                                    <input
                                        type="text"
                                        value={newProduct.product_name}
                                        disabled={!isNewProduct}
                                        onChange={(e) =>
                                            setNewProduct({ ...newProduct, product_name: e.target.value })
                                        }
                                        placeholder="Search or add product..."
                                        className={`
        w-full px-4 py-2.5 pr-28 rounded-lg border
        focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        transition-all
        ${isNewProduct
                                                ? "bg-white border-slate-300"
                                                : "bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed"}
      `}
                                    />

                                    {/* Right Badge */}
                                    <div className="absolute inset-y-0 right-2 flex items-center">
                                        {isNewProduct ? (
                                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                                                New
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                                                Existing
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Helper Text */}
                                <p className="mt-1 text-xs text-slate-500">
                                    {isNewProduct
                                        ? "This will create a new product entry."
                                        : "This product already exists. Stock will be updated."}
                                </p>
                            </div>


                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    placeholder="Enter product description..."
                                    rows="3"
                                    disabled={!isNewProduct}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Category {isNewProduct && '*'}
                                </label>
                                <select
                                    required={isNewProduct}
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    disabled={!isNewProduct}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select category</option>
                                    {categories && categories.length > 0 ? (
                                        categories.map((cat, idx) => (
                                            <option key={idx} value={cat}>{cat}</option>
                                        ))
                                    ) : null}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Unit *</label>
                                <input
                                    type="text"
                                    required
                                    disabled={!isNewProduct}
                                    value={newProduct.unit}
                                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                    placeholder="e.g., 500ml Bottle, Piece"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                            <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <IndianRupee size={16} /> Pricing Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cost Price (per unit) *</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="number"
                                            required
                                            value={newProduct.cost_price}
                                            onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stock Information */}
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                            <h3 className="text-sm font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <Package size={16} /> {!isNewProduct ? 'Add Stock' : 'Initial Stock Information'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                        <Store size={14} /> Salon Stock *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={newProduct.stock_quantity}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                        <Warehouse size={14} /> Warehouse Stock *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={newProduct.warehouse_quantity}
                                        onChange={(e) => setNewProduct({ ...newProduct, warehouse_quantity: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                        <Calendar size={14} /> Purchase Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={newProduct.purchase_date}
                                        onChange={(e) => setNewProduct({ ...newProduct, purchase_date: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Plus size={18} />
                            {!isNewProduct ? 'Add Inventory' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Add Warehouse Stock Modal
export const AddWarehouseStockModal = ({
    show,
    onClose,
    warehouseStock,
    setWarehouseStock,
    products,
    onSubmit
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Warehouse className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Add Warehouse Stock</h2>
                            <p className="text-blue-100 text-sm">
                                Restock existing product in warehouse
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="text-white" size={20} />
                    </button>
                </div>

                {/* SCROLLABLE BODY */}
                <form
                    onSubmit={onSubmit}
                    className="flex-1 overflow-y-auto p-6 space-y-5"
                >
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Select Product *
                        </label>
                        <select
                            required
                            value={warehouseStock.product_id}
                            onChange={(e) =>
                                setWarehouseStock({ ...warehouseStock, product_id: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose a product...</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} - Current: {product.stock.warehouse} units
                                </option>
                            ))}
                        </select>
                    </div>

                    {warehouseStock.product_id && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border">
                                    <img
                                        src={
                                            products.find(
                                                p => p.id === parseInt(warehouseStock.product_id)
                                            )?.image
                                        }
                                        alt="Product"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 text-sm">
                                        {
                                            products.find(
                                                p => p.id === parseInt(warehouseStock.product_id)
                                            )?.name
                                        }
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Current Warehouse Stock:
                                        <span className="font-bold text-blue-600 ml-1">
                                            {
                                                products.find(
                                                    p => p.id === parseInt(warehouseStock.product_id)
                                                )?.stock.warehouse
                                            }
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={warehouseStock.quantity}
                                onChange={(e) =>
                                    setWarehouseStock({
                                        ...warehouseStock,
                                        quantity: e.target.value
                                    })
                                }
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Cost Price *
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={warehouseStock.cost_price}
                                    onChange={(e) =>
                                        setWarehouseStock({
                                            ...warehouseStock,
                                            cost_price: e.target.value
                                        })
                                    }
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Notes</label>
                        <textarea
                            rows="3"
                            value={warehouseStock.notes}
                            onChange={(e) =>
                                setWarehouseStock({
                                    ...warehouseStock,
                                    notes: e.target.value
                                })
                            }
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </form>

                {/* FOOTER */}
                <div className="border-t px-6 py-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 border rounded-lg hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Stock
                    </button>
                </div>

            </div>
        </div>
    );
};

// Buy Stock Modal

export const BuyStockModal = ({
    show,
    onClose,
    selectedProduct,
    buyStockForm,
    setBuyStockForm,
    onSubmit
}) => {
    if (!show || !selectedProduct) return null;

    const warehouseStock = selectedProduct.stock.warehouse || 0;
    const salonStock = selectedProduct.stock.salon || 0;
    const transferQty = Number(buyStockForm.quantity || 0);

    const remainingWarehouse = Math.max(
        warehouseStock - transferQty,
        0
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">

                {/* Header */}
                <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-lg font-bold text-white">Move Stock to Salon</h2>
                        <p className="text-indigo-100 text-sm">
                            Transfer stock from warehouse
                        </p>
                    </div>
                    <button onClick={onClose}>
                        <X className="text-white" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Product Info */}
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                        <img
                            src={selectedProduct.image}
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                            <h3 className="font-semibold text-slate-800">
                                {selectedProduct.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {selectedProduct.description}
                            </p>
                        </div>
                    </div>

                    {/* Stock Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg text-center">
                            <Warehouse className="mx-auto text-slate-500 mb-1" />
                            <p className="text-xs text-slate-500">Warehouse Stock</p>
                            <p className="text-xl font-bold text-slate-800">
                                {warehouseStock}
                            </p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg text-center">
                            <Store className="mx-auto text-slate-500 mb-1" />
                            <p className="text-xs text-slate-500">Salon Stock</p>
                            <p className="text-xl font-bold text-green-600">
                                {salonStock}
                            </p>
                        </div>
                    </div>

                    {/* Transfer Section */}
                    {warehouseStock > 0 ? (
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Quantity to Transfer
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={warehouseStock}
                                value={buyStockForm.quantity}
                                onChange={(e) =>
                                    setBuyStockForm({
                                        ...buyStockForm,
                                        quantity: e.target.value
                                    })
                                }
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />

                            <p className="text-xs text-slate-500 mt-1">
                                Remaining in warehouse after transfer:
                                <span className="font-bold text-red-600 ml-1">
                                    {remainingWarehouse}
                                </span>
                            </p>
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <p className="text-red-600 font-semibold">
                                🚫 No stock available in warehouse
                            </p>
                            <p className="text-sm text-red-500 mt-1">
                                Please purchase stock first before transferring to salon.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-4 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg text-slate-600"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={transferQty <= 0 || transferQty > warehouseStock}
                        onClick={onSubmit}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <ArrowRightLeft size={16} />
                        Transfer Stock
                    </button>
                </div>
            </div>
        </div>
    );
};
