import {
  AlertCircle,
  ArrowDownToLine,
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
import { pdf } from '@react-pdf/renderer'
import { InvoicePDF } from '../inVoice/invoicePdf'
import supabase from '@/dataBase/connectdb'

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

  const handleTransaction = async (transaction) => {
    
    if (!transaction?.transaction_id || !transaction?.transactions_date) {
    
      console.warn('Invoice not available: missing transaction_id or transactions_date')
      return
    }
    

    const { data,error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', transaction?.store_id)
      .single()
      .select()
    try {
      // Map transaction data to InvoicePDF props
      const salonInfo = {
        name: data?.name,
        address: data?.shop_address,
        phone: data?.shop_number,
      }

      const customerInfo = {
        name: transaction?.['Customer Name'] || 'Customer',
        phone:
          transaction?.['Mobile Number'] ||
          transaction?.phone ||
          transaction?.['Phone'] ||
          '',
        date:
          transaction?.transactions_date ||
          transaction?.['Slot Date'] ||
          new Date().toISOString(),
      }

      // Base service row
      const baseServicePrice = Number(
        transaction?.['Service Price'] ?? transaction?.service_price ?? 0
      )
      const services = [
        {
          name: String(transaction?.Services || 'Service'),
          qty: 1,
          price: isNaN(baseServicePrice) ? 0 : baseServicePrice,
        },
      ]

      // Extra services rows
      const mappedExtras = Array.isArray(transaction?.extra_Services)
        ? transaction.extra_Services.map((s) => ({
            name: s?.service_name || s?.name || 'Extra Service',
            qty: 1,
            price: Number(s?.base_price ?? s?.price ?? 0) || 0,
          }))
        : []

      const extrasSubtotal = mappedExtras.reduce(
        (sum, s) => sum + (Number(s.price) || 0),
        0
      )
      // If final amount equals base service price (and no tax/discount), assume extras weren't charged
      const finalAmount = Number(transaction?.transaction_final_amount)
      const discount = Number(transaction?.discount ?? 0) || 0
      const tax = Number(transaction?.tax ?? 0) || 0

      const includeExtras = !(
        !isNaN(finalAmount) &&
        Math.abs(finalAmount - (services[0]?.price || 0)) < 0.01 &&
        discount === 0 &&
        tax === 0
      )

      // Always pass extra services so they are visible in the PDF
      const extraServices = mappedExtras
      // But only add extras to subtotal if they were charged
      const subtotal =
        (services[0]?.price || 0) + (includeExtras ? extrasSubtotal : 0)

      // In this dataset, discount appears to be an absolute amount
      const computedTotal = Math.max(0, subtotal - discount + tax)
      const total = Number(transaction?.transaction_final_amount)
      const summary = {
        subtotal,
        discount,
        tax,
        total: isNaN(total) ? computedTotal : total,
      }

      const invoiceNumber =
        String(transaction?.transaction_id || '').trim() || `INV-${Date.now()}`

      const blob = await pdf(
        <InvoicePDF
          salonInfo={salonInfo}
          customerInfo={customerInfo}
          services={services}
          extraServices={extraServices}
          summary={summary}
          invoiceNumber={invoiceNumber}
        />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      // Use a more descriptive filename
      const safeName = (customerInfo.name || 'customer').replace(
        /[^a-z0-9\-_. ]/gi,
        '_'
      )
      link.download = `${invoiceNumber}-${safeName}.pdf`
      link.click()

      URL.revokeObjectURL(url) // cleanup
    } catch (err) {
      console.error('Failed to generate invoice PDF:', err)
      alert('Failed to generate invoice. Please try again.')
    }
  }

  return (
    <div className="relative rounded-xl bg-gradient-to-b to-blue-50 p-5 shadow-md">
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-red-500">
          <TransactionsPanel
            setIsEditModalOpen={setIsEditModalOpen}
            transactionFromData={transactionPanelData}
          />
        </div>
      )}
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                <Calendar className="h-8 w-8 text-blue-600" />
                Today's Transactions
              </h1>
              <p className="mt-2 text-gray-600">
                {new Date().toLocaleDateString()} - Transaction History
              </p>
            </div>
          </div>

          {/* Filters */}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-md bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Transaction ID
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Booking ID
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Service
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Service Price
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Staff
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Extra Services
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Discount
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Transaction Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Actions
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="15" className="px-4 py-8 text-center">
                      <div className="flex w-full items-center justify-center">
                        <LoaderCircle className="size-10 animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="px-4 py-12 text-center">
                      <div className="rounded-xl bg-white p-8 text-center">
                        <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                        <h3 className="mb-2 text-xl font-semibold text-gray-600">
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
                      <tr className="transition-colors hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                          {formatDateTime(transaction.transactions_date) ||
                            'N/A'}
                        </td>
                        <td className="px-4 py-4 font-mono text-sm whitespace-nowrap text-gray-600">
                          {transaction.transaction_id || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                          {new Date(
                            transaction['Slot Date']
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 font-mono text-sm whitespace-nowrap text-gray-600">
                          {transaction['Booking ID']}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                          {transaction['Customer Name']}
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                          {transaction.Services}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold whitespace-nowrap text-green-600">
                          {formateCurrency(transaction['Service Price'])}
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
                            {transaction.payment_method || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                          {transaction['Staff Name'] || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                          {transaction.extra_Services?.length > 0 ? (
                            <button
                              onClick={() => toggleRowExpansion(transaction.id)}
                              className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-800"
                            >
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                {transaction.extra_Services.length} services
                              </span>
                              {expandedRows.has(transaction.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold whitespace-nowrap text-gray-900">
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
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                          {transaction.discount > 0 ? (
                            <span className="font-semibold text-green-600">
                              {formateCurrency(transaction.discount)}
                            </span>
                          ) : (
                            <span className="text-gray-400">&#8377;0.00</span>
                          )}
                        </td>

                        {/* todo yaha pe agr transaction status dalna hai ho ji
                      backend se ayega */}
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-700">
                          <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
                            {transaction?.transactions_status ? (
                              <div className="flex items-center gap-2 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                paid
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                                <XCircle className="h-4 w-4 text-red-600" />
                                unpaid
                              </div>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
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
                                'rounded p-1 transition-colors hover:cursor-pointer hover:bg-red-50',
                                transaction?.transactions_status
                                  ? 'text-gray-500 hover:cursor-not-allowed'
                                  : 'text-red-600 hover:text-red-800'
                              )}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="flex items-center justify-center px-4 py-4 whitespace-nowrap">
                          <button
                            disabled={!transaction?.transaction_id || !transaction?.transactions_date}
                            onClick={() => handleTransaction(transaction)}
                            className={cn(
                              'rounded p-2 transition-colors',
                              !transaction?.transaction_id || !transaction?.transactions_date
                                ? 'cursor-not-allowed text-gray-400'
                                : 'hover:cursor-pointer hover:bg-green-50 hover:text-green-600'
                            )}
                            title={
                              !transaction?.transaction_id || !transaction?.transactions_date
                                ? 'Invoice will be available after payment is recorded'
                                : 'Download invoice'
                            }
                          >
                            <ArrowDownToLine className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                      {/* Expanded Row for Extra Services */}
                      {expandedRows.has(transaction.id) &&
                        transaction.extra_Services?.length > 0 && (
                          <tr className="bg-blue-50">
                            <td colSpan={15} className="px-4 py-4">
                              <div className="ml-8">
                                <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
                                  {transaction.extra_Services.map(
                                    (service, index) => (
                                      <div
                                        key={index}
                                        className="rounded-lg border border-blue-200 bg-white p-3"
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
