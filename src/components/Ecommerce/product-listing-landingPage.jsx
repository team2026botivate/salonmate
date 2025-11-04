import { Suspense, useState, useEffect } from 'react';
import ProductSearchBar from './search-bar-ecommerce-component';
import ProductGrid from './proudct-grid-ecommerce-component';
import Pagination from './pagination-ecommerce';
import Header from './header-ecommerce-header';
import ProductFilter from './product-filter-ecommerce';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SidebarEcommerce from './sideBar-ecommerce';
import SidebarEcommmerce from './sideBar-ecommerce';

export default function ProductListing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // console.log(totalProducts, 'totalProducts from there ');
  const itemsPerPage = 8;

  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));

  // Ensure currentPage doesn't exceed totalPages if totalProducts changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.6, ease: 'easeInOut' }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <Header searchItem={searchTerm} setSearchItem={setSearchTerm} />

      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="flex gap-6">
          <main className="flex-1">
            <div className="mt-6 min-h-[70vh]">
              <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-[#5271FF]" />}>
                <ProductGrid
                  searchTerm={searchTerm}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onProductsLoaded={setTotalProducts}
                />
              </Suspense>

              

              <h1>hello from here</h1>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </main>
        </div>
      </div>
    </motion.div>
  );
}
