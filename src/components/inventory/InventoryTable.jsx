import React from 'react';
import { ArrowRightLeft, Store, Warehouse, IndianRupee, ShoppingCart, Package } from 'lucide-react';

// Stock Status Badge Component
const StockStatusBadge = ({ salon, min }) => {
  if (salon === 0)
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">Out of Stock</span>;
  if (salon <= min)
    return <span className="px-2 py-1 rounded-full whitespace-nowrap text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">Low on Floor</span>;
  return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">In Stock</span>;
};

// Stock Visualizer Component
const StockVisualizer = ({ salon, warehouse, min }) => {
  const isSalonLow = salon <= min;
  const isWarehouseEmpty = warehouse === 0;
  return (
    <div className="flex items-center gap-3 w-full max-w-xs">
      <div className={`flex-1 flex flex-col items-center p-2 rounded-lg border ${isSalonLow ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-1.5 text-xs uppercase font-semibold text-slate-500 mb-1">
          <Store size={12} /> Salon
        </div>
        <span className={`text-xl font-bold ${isSalonLow ? 'text-amber-600' : 'text-slate-700'}`}>
          {salon}
        </span>
        <span className="text-[10px] text-slate-400">Target: {min}+</span>
      </div>
      <div className="flex flex-col items-center text-slate-300">
        <div className="h-[1px] w-4 bg-slate-300"></div>
        {warehouse > 0 && <ArrowRightLeft size={14} className="text-blue-400" />}
        <div className="h-[1px] w-4 bg-slate-300"></div>
      </div>
      <div className={`flex-1 flex flex-col items-center p-2 rounded-lg border ${isWarehouseEmpty ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-1.5 text-xs uppercase font-semibold text-slate-500 mb-1">
          <Warehouse size={12} /> Warehouse
        </div>
        <span className={`text-xl font-bold ${isWarehouseEmpty ? 'text-red-500' : 'text-slate-600'}`}>
          {warehouse}
        </span>
      </div>
    </div>
  );
};

// List View Component
export const ProductListView = ({ products, onTransfer, onBuyStock }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 text-xs font-semibold uppercase text-slate-500 tracking-wider">Product Details</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase text-slate-500 tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase text-slate-500 tracking-wider text-center">Stock Distribution</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase text-slate-500 tracking-wider">Unit / Price</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-start gap-4">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm" />
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-[200px]">{item.description}</p>
                      {item.category && <span className="text-[10px] text-indigo-600 font-medium mt-1 block">{item.category}</span>}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <StockStatusBadge salon={item.stock.salon} min={item.stock.min_salon} />
                </td>
                <td className="py-4 px-6">
                  <StockVisualizer
                    salon={item.stock.salon}
                    warehouse={item.stock.warehouse}
                    min={item.stock.min_salon}
                  />
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm font-medium text-slate-700">{item.unit}</div>
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <IndianRupee size={12} />
                    {item.price.toFixed(2)}
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button
                      onClick={() => onBuyStock(item)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
                    >
                      Add Product
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Grid View Component
export const ProductGridView = ({ products, onTransfer, onBuyStock }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((item) => (
        <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="relative h-48 w-full bg-slate-100">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-t-xl" />
            <div className="absolute top-3 right-3">
              <StockStatusBadge salon={item.stock.salon} min={item.stock.min_salon} />
            </div>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-base line-clamp-1">{item.name}</h3>
                {item.category && <p className="text-xs text-indigo-600 font-medium">{item.category}</p>}
              </div>
              <span className="font-bold text-slate-900 flex items-center gap-1 ml-2">
                <IndianRupee size={14} />
                {item.price}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">{item.description}</p>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
              <div className="flex justify-between items-center mb-2 text-xs font-semibold text-slate-500 uppercase">
                <span>In Salon</span>
                <span>Warehouse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex-1 h-8 rounded flex items-center justify-center font-bold text-sm ${item.stock.salon <= item.stock.min_salon ? 'bg-amber-100 text-amber-700' : 'bg-white border border-slate-200 text-slate-700'}`}>
                  {item.stock.salon}
                </div>
                <ArrowRightLeft size={14} className="text-slate-300" />
                <div className={`flex-1 h-8 rounded flex items-center justify-center font-bold text-sm ${item.stock.warehouse === 0 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>
                  {item.stock.warehouse}
                </div>
              </div>
            </div>
            <button
              onClick={() => item.stock.salon <= item.stock.min_salon && item.stock.warehouse > 0 ? onTransfer(item) : onBuyStock(item)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {item.stock.salon <= item.stock.min_salon && item.stock.warehouse > 0 ? (
                <> <ArrowRightLeft size={16} /> Restock from Back </>
              ) : (
                <> <ShoppingCart size={16} /> Add Product </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Empty State Component
export const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <Package size={48} className="mx-auto text-slate-300 mb-4" />
      <p className="text-slate-500">No products found</p>
    </div>
  );
};