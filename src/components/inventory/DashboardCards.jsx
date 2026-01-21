import React from 'react';
import { Search, Filter, List, LayoutGrid, Plus, Warehouse } from 'lucide-react';

export const DashboardCards = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onAddProduct,
  onAddWarehouseStock
}) => {
  return (
    <>
      {/* Action Buttons */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            Add New Product
          </button>
          <button
            onClick={onAddWarehouseStock}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Warehouse size={18} />
            Add Warehouse Stock
          </button>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          {['all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
          </button>
          <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-white text-slate-400 border border-slate-200'
            }`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid'
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-white text-slate-400 border border-slate-200'
            }`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>
    </>
  );
};