import React from 'react';
import { motion } from 'framer-motion';
import { Scissors, Sparkles, Package, TrendingDown, AlertCircle, IndianRupee } from 'lucide-react';

export const InventoryHeader = ({ stats }) => {
  return (
    <>
      {/* Title Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4"
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 px-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Products</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalProducts}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Package size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock (Salon)</p>
            <h3 className="text-2xl font-bold text-amber-600">{stats.lowStockSalon}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock (WH)</p>
            <h3 className="text-2xl font-bold text-red-600">{stats.lowStockWarehouse}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>
    </>
  );
};