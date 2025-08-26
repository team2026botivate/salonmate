import React, { useState } from 'react'

import {
    useGetSelectedExtraServiceDataForTransactionHistory
} from '@/hook/dbOperation'
import { formateCurrency } from '@/utils/formateCurrency.utils'
import { formatDateTime } from '@/utils/getDateAndtimeform'
import { motion } from 'framer-motion'
import {
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    CreditCard,
    LoaderCircle,
    Search,
    User,
    X,
    XCircle,
} from 'lucide-react'

const ShowHistory = ({
  setShowHistoryModal,
  historySearchTerm,
  setHistorySearchTerm,
  tableHeaders,
  filteredHistoryTransactions,
  handleEditClick,
}) => {
  // Helper to format date/time consistently
  const formatDateForDisplay = (value) => {
    if (!value) return '—'
    const d = new Date(value)
    if (isNaN(d)) return String(value)
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const { data, loading } =
    useGetSelectedExtraServiceDataForTransactionHistory()
  console.log(data)

  const [expandedRows, setExpandedRows] = useState(new Set())

  //todo i have to check here for one time
  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses =
      'px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1'
    switch (status) {
      case 'done':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return baseClasses
    }
  }

  const list = Array.isArray(data) ? data : []
  const query = (historySearchTerm || '').toString().toLowerCase()
  const filteredTransactions = list.filter((transaction) => {
    const name = String(transaction?.['Customer Name'] ?? '').toLowerCase()
    const txnId = String(transaction?.['transaction_id'] ?? '').toLowerCase()
    const services = String(transaction?.Services ?? '').toLowerCase()
    const matchesSearch = query
      ? name.includes(query) ||
        txnId.includes(query) ||
        services.includes(query)
      : true
    return matchesSearch
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 g-[rgba(0,0,0,0.6)] backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              Transaction History
            </h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowHistoryModal(false)}
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search all transactions..."
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none  w-full"
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Service Price
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Extra Services
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Transaction Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="15" className="px-4 py-8 text-center ">
                      <div className="w-full flex items-center justify-center">
                        <LoaderCircle className="animate-spin size-10" />
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="px-4 py-12 text-center">
                      <div className="bg-white rounded-xl p-8 text-center">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                          No transactions found
                        </h3>
                        <p className="text-gray-500">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <React.Fragment key={transaction.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDateTime(transaction.transactions_date) ||
                            'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                          {transaction.transaction_id || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(
                            transaction['Slot Date']
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                          {transaction['Booking ID']}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction['Customer Name']}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {transaction.Services}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {formateCurrency(transaction['Service Price'])}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            {transaction.payment_method || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 ">
                          {transaction['Staff Name'] || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {transaction.extra_Services?.length > 0 ? (
                            <button
                              onClick={() => toggleRowExpansion(transaction.id)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                {transaction.extra_Services.length} services
                              </span>
                              {expandedRows.has(transaction.id) ? (
                                <ChevronUp className="h-4 w-4   " />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formateCurrency(
                            transaction.transaction_final_amount
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(transaction.status)}>
                            {getStatusIcon(transaction.status)}
                            {transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {transaction.discount > 0 ? (
                            <span className="text-green-600 font-semibold">
                              {formateCurrency(transaction.discount)}
                            </span>
                          ) : (
                            <span className="text-gray-400">&#8377;0.00</span>
                          )}
                        </td>

                        {/* todo yaha pe agr transaction status dalna hai ho ji
                      backend se ayega */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            {transaction?.transactions_status ? (
                              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                paid
                              </div>
                            ) : (
                              <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                unpaid
                              </div>
                            )}
                          </span>
                        </td>
                      </tr>
                      {/* Expanded Row for Extra Services */}
                      {expandedRows.has(transaction.id) &&
                        transaction.extra_Services?.length > 0 && (
                          <tr className="bg-blue-50">
                            <td colSpan={15} className="px-4 py-4">
                              <div className="ml-8">
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                  {transaction.extra_Services.map(
                                    (service, index) => (
                                      <div
                                        key={index}
                                        className="bg-white rounded-lg p-3 border border-blue-200"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-gray-800">
                                            {service.service_name}
                                          </span>
                                          <span className="text-sm font-semibold text-green-600">
                                            {formateCurrency(
                                              service.base_price
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-pink-600 text-white rounded-md shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              onClick={() => setShowHistoryModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ShowHistory
