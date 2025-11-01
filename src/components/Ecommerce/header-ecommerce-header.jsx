import { MapPin, ChevronDown, Search, ShoppingCart, User, Menu, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEcommerceStore } from '@/zustand/ecommerce-store-zustand';

export default function Header({ searchItem, setSearchItem }) {
  const navigate = useNavigate();
  const { cartLength } = useEcommerceStore();
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      {/* Top Bar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          {/* Logo and Location */}
          <div className="flex items-center gap-2">
            <div onClick={() => navigate(-1)} className="hover:cursor-pointer">
              <ArrowLeft />
            </div>
            <div className="flex items-center">
              <div className="">
                <img className="size-15" src="./3.png" alt="" />
              </div>
              <h1 className="text-xl font-bold">Saloon Mate</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mx-8 max-w-2xl flex-1">
            <div className="relative">
              <input
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                type="text"
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-[#3F5BDB] focus:outline-none"
              />
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <button className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md bg-[#5271FF] px-6 py-1.5 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-[#3F5BDB]">
                Search
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="relative rounded-lg p-2 transition-colors hover:bg-gray-100">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {cartLength}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
