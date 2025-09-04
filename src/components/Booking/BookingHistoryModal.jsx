import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

const BookingHistoryModal = ({
  show,
  onClose,
  tableHeaders,
  filteredHistoryAppointments,
  historySearchTerm,
  setHistorySearchTerm,
  loading,
  error,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-indigo-800">Booking History</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
                <X size={24} />
              </button>
            </div>
            {loading && (
              <div className="py-10 text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
                <p className="text-indigo-600">Loading history...</p>
              </div>
            )}
            {!loading && error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-800 mb-4">
                Failed to load appointment history. {String(error)}
              </div>
            )}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" size={18} />
                <input
                  type="text"
                  placeholder="Search all appointments..."
                  className="pl-10 pr-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
                  value={historySearchTerm}
                  onChange={e => setHistorySearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-indigo-200">
                <thead className="bg-indigo-50">
                  <tr>
                    {tableHeaders?.map((header, headerIdx) => (
                      <th
                        key={`history-${header.id || header.label || 'col'}-${headerIdx}`}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider"
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-indigo-200">
                  {!loading && Array.isArray(filteredHistoryAppointments) && filteredHistoryAppointments.length > 0 ? (
                    filteredHistoryAppointments.map((appointment, rowIdx) => (
                      <tr key={`history-row-${appointment._id || appointment.id || rowIdx}`} className="hover:bg-indigo-50">
                        {tableHeaders?.map((header, headerIdx) => {
                          if (header.label.toLowerCase().includes("status")) {
                            const status = appointment[header.id] || "";
                            const statusClass = status.toLowerCase().includes("confirm")
                              ? "bg-green-100 text-green-800"
                              : status.toLowerCase().includes("pend")
                              ? "bg-yellow-100 text-yellow-800"
                              : status.toLowerCase().includes("cancel")
                              ? "bg-red-100 text-red-800"
                              : status.toLowerCase().includes("complete")
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800";
                            return (
                              <td key={`history-cell-${header.id || header.label || 'col'}-${rowIdx}-${headerIdx}`} className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                                  {status || "—"}
                                </span>
                              </td>
                            );
                          }
                          const rawValue = appointment[`${header.id}_formatted`] ?? appointment[header.id];
                          let displayValue = rawValue;
                          if (rawValue === null || typeof rawValue === 'undefined' || rawValue === '') {
                            displayValue = '—';
                          } else if (Array.isArray(rawValue)) {
                            // Join arrays into a readable string
                            displayValue = rawValue
                              .map((item) => {
                                if (item && typeof item === 'object') {
                                  if ('service_name' in item || 'base_price' in item) {
                                    const name = item.service_name || item.name || 'Service';
                                    const price = item.base_price || item.price || '';
                                    return price ? `${name} - ${price}` : `${name}`;
                                  }
                                  return JSON.stringify(item);
                                }
                                return String(item);
                              })
                              .join(', ');
                          } else if (typeof rawValue === 'object') {
                            // Format objects safely
                            if ('service_name' in rawValue || 'base_price' in rawValue) {
                              const name = rawValue.service_name || rawValue.name || 'Service';
                              const price = rawValue.base_price || rawValue.price || '';
                              displayValue = price ? `${name} - ${price}` : `${name}`;
                            } else {
                              displayValue = JSON.stringify(rawValue);
                            }
                          }
                          return (
                            <td key={`history-cell-${header.id || header.label || 'col'}-${rowIdx}-${headerIdx}`} className="px-6 py-4 whitespace-nowrap">
                              {displayValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : !loading ? (
                    <tr>
                      <td colSpan={(tableHeaders?.length || 1)} className="px-6 py-4 text-center text-gray-500">
                        {historySearchTerm ? "No appointments matching your search" : "No appointments found"}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default BookingHistoryModal;
