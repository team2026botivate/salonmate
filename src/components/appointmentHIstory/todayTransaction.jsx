import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Edit,
  LoaderCircle,
  User,
  XCircle,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { formateCurrency } from '../../utils/formateCurrency.utils'
import TransactionsPanel from './transactionWrapper'
import { useGetSelectedExtraServiceDataForTransaction } from '../../hook/dbOperation'
import { formatDateTime } from '../../utils/getDateAndtimeform'
import { cn } from '../../utils/cn'

const TodayTransaction = ({ searchItem, filterDate }) => {
  const { data, loading } = useGetSelectedExtraServiceDataForTransaction()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [transactionPanelData, setTransactionPanelData] = useState({
    id: '',
    service_price: '',
    service_name: '',
    extra_services: '',
  })

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
  const query = (searchItem || '').toString().toLowerCase()
  const filteredTransactions = list.filter((transaction) => {
    const name = String(transaction?.['Customer Name'] ?? '').toLowerCase()
    const txnId = String(transaction?.['transaction_id'] ?? '').toLowerCase()
    const services = String(transaction?.Services ?? '').toLowerCase()
    const matchesSearch = query
      ? name.includes(query) ||
        txnId.includes(query) ||
        services.includes(query)
      : true
    const matchesDate = filterDate ? transaction?.date === filterDate : true
    return matchesDate && matchesSearch
  })

  return (
    <div className=" rounded-xl bg-gradient-to-b to-blue-50 shadow-md p-5 relative ">
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-red-500">
          <TransactionsPanel
            setIsEditModalOpen={setIsEditModalOpen}
            transactionFromData={transactionPanelData}
          />
        </div>
      )}
      <div className="max-w-7xl mx-auto ">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                Today's Transactions
              </h1>
              <p className="text-gray-600 mt-2">
                {new Date().toLocaleDateString()} - Transaction History
              </p>
            </div>
          </div>

          {/* Filters */}
        </div>

        {/* Table */}
        <div className="bg-white  overflow-hidden rounded-md">
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
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
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
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <button
                            disabled={transaction?.transactions_status}
                              onClick={() => {
                                setTransactionPanelData((prev) => ({
                                  ...prev,
                                  id: transaction?.id,
                                  service_price: transaction['Service Price'],
                                  service_name: transaction?.Services,
                                  extra_services: transaction?.extra_Services,
                                }))
                                setIsEditModalOpen(true)
                              }}
                              className={cn(
                                'p-1 hover:bg-red-50 rounded transition-colors hover:cursor-pointer',
                                transaction?.transactions_status
                                  ? 'text-gray-500 hover:cursor-not-allowed'
                                  : 'text-red-600 hover:text-red-800'
                              )}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
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
        </div>
      </div>
    </div>
  )
}

export default TodayTransaction
