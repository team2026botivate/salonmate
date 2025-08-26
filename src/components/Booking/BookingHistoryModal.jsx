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
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-indigo-800">Booking History</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
                <X size={24} />
              </button>
            </div>
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
                    {tableHeaders.map(header => (
                      <th
                        key={`history-${header.id}`}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider"
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-indigo-200">
                  {filteredHistoryAppointments.length > 0 ? (
                    filteredHistoryAppointments.map(appointment => (
                      <tr key={`history-row-${appointment._id}`} className="hover:bg-indigo-50">
                        {tableHeaders.map(header => {
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
                              <td key={`history-cell-${header.id}`} className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                                  {status || "—"}
                                </span>
                              </td>
                            );
                          }
                          return (
                            <td key={`history-cell-${header.id}`} className="px-6 py-4 whitespace-nowrap">
                              {appointment[`${header.id}_formatted`] || appointment[header.id] || "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={tableHeaders.length} className="px-6 py-4 text-center text-gray-500">
                        {historySearchTerm ? "No appointments matching your search" : "No appointments found"}
                      </td>
                    </tr>
                  )}
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
