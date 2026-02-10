'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  History,
  Plus,
  Save,
  Search,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartParent from './components/appointmentHIstory/chartParent'
import DailyEntryHeader from './components/appointmentHIstory/headerAppointmentHistory'
import ShowHistory from './components/appointmentHIstory/showHistory'
import TodayTransaction from './components/appointmentHIstory/todayTransaction'
import { useAuth } from './Context/AuthContext'; // Import useAuth hook

const DailyEntry = ({ hideHistoryButton = false }) => {
  // Get user data from AuthContext
  const { user } = useAuth()

  const [date, setDate] = useState()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tableHeaders, setTableHeaders] = useState([])
  const [transactions, setTransactions] = useState([])
  const [allTransactions, setAllTransactions] = useState([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historySearchTerm, setHistorySearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalRevenue: 0,
    services: 0,
    cardPayments: 0,
    averageSale: 0,
  })

  const [showDiscountForm, setShowDiscountForm] = useState(false)
  const [promoCards, setPromoCards] = useState([])
  const [selectedPromo, setSelectedPromo] = useState(null)
  const [loadingPromos, setLoadingPromos] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)

  // Add state for edit functionality
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serviceOptions, setServiceOptions] = useState([])
  const [extraServices, setExtraServices] = useState([])
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  })

  const [selectedExtraServices, setSelectedExtraServices] = useState([])
  const handleAddDiscountClick = () => {
    setShowDiscountForm(true)
    fetchPromoCards()
  }
  const handleSelectPromo = (promo) => {
    setSelectedPromo(promo)
    const totalAmountHeader = tableHeaders.find(
      (h) =>
        h.label.toLowerCase().includes('total') &&
        h.label.toLowerCase().includes('amount')
    )

    if (totalAmountHeader && editingTransaction[totalAmountHeader.id]) {
      const totalAmount =
        parseFloat(editingTransaction[totalAmountHeader.id]) || 0
      const discountPercentage = promo.discount || 0

      const discount = (totalAmount * discountPercentage) / 100
      setDiscountAmount(discount.toFixed(2))

      const newTotal = (totalAmount - discount).toFixed(2)

      const updatedTransaction = {
        ...editingTransaction,
        [totalAmountHeader.id]: newTotal,
        _appliedDiscount: {
          code: promo.code,
          percentage: discountPercentage,
          amount: discount.toFixed(2),
        },
      }

      setEditingTransaction(updatedTransaction)
    }
  }

  const handleCloseDiscountForm = () => {
    setShowDiscountForm(false)
    setSelectedPromo(null)
  }
  const handleRemoveDiscount = () => {
    const totalAmountHeader = tableHeaders.find(
      (h) =>
        h.label.toLowerCase().includes('total') &&
        h.label.toLowerCase().includes('amount')
    )

    const servicePriceHeader = tableHeaders.find(
      (h) =>
        h.label.toLowerCase().includes('service price') &&
        !h.label.toLowerCase().includes('extra')
    )

    const extraServicePriceHeader = tableHeaders.find((h) =>
      h.label.toLowerCase().includes('extra service price')
    )

    if (totalAmountHeader) {
      const servicePrice =
        parseFloat(editingTransaction[servicePriceHeader?.id] || 0) || 0
      const extraServicePrice =
        parseFloat(editingTransaction[extraServicePriceHeader?.id] || 0) || 0
      const newTotal = (servicePrice + extraServicePrice).toFixed(2)

      const updatedTransaction = {
        ...editingTransaction,
        [totalAmountHeader.id]: newTotal,
      }

      delete updatedTransaction._appliedDiscount

      setEditingTransaction(updatedTransaction)
      setSelectedPromo(null)
      setDiscountAmount(0)
    }
  }

  const renderFormField = (header) => {
    const headerLabel = header.label.toLowerCase()

    if (
      headerLabel.includes('timestamp') ||
      headerLabel.includes('time stamp')
    ) {
      const displayValue =
        editingTransaction[`${header.id}_display`] ||
        editingTransaction[header.id] ||
        ''

      return (
        <input
          type="text"
          id={`edit-${header.id}`}
          name={header.id}
          value={displayValue}
          onChange={handleEditInputChange}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
        />
      )
    }

    if (header.type === 'date' || headerLabel.includes('date')) {
      let dateValue = editingTransaction[header.id] || ''

      return (
        <input
          type="date"
          id={`edit-${header.id}`}
          name={header.id}
          value={dateValue}
          onChange={handleEditInputChange}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 "
        />
      )
    }

    if (
      headerLabel.includes('extra service') &&
      !headerLabel.includes('price')
    ) {
      return (
        <div className="relative mt-1 ">
          <div className="block w-full overflow-hidden border border-gray-300 rounded-md shadow-sm focus-within:border-pink-500 focus-within:ring-pink-500">
            {/* Selected services display */}
            <div className="p-2 min-h-[40px] bg-white">
              {selectedExtraServices.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedExtraServices.map((serviceName) => (
                    <span
                      key={serviceName}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-pink-800 bg-pink-100 rounded-md"
                    >
                      {serviceName}
                      <button
                        type="button"
                        className="ml-1 text-pink-600 hover:text-pink-900"
                        onClick={() =>
                          handleExtraServiceCheckboxChange({
                            name: serviceName,
                          })
                        }
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-400">
                  Select extra services
                </span>
              )}
            </div>

            {/* Dropdown with checkboxes */}
            <div className="overflow-y-auto border-t border-gray-200 max-h-60 bg-gray-50">
              {extraServices.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center px-3 py-2 hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    id={`service-${index}`}
                    checked={selectedExtraServices.includes(service.name)}
                    onChange={() => handleExtraServiceCheckboxChange(service)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label
                    htmlFor={`service-${index}`}
                    className="flex justify-between w-full ml-3"
                  >
                    <span className="text-sm text-gray-700">
                      {service.name}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{parseFloat(service.price).toFixed(2)}
                    </span>
                  </label>
                </div>
              ))}
              {extraServices.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No extra services available
                </div>
              )}
            </div>
          </div>

          <input
            type="hidden"
            id={`edit-${header.id}`}
            name={header.id}
            value={selectedExtraServices.join(', ')}
          />
        </div>
      )
    }

    if (
      headerLabel.includes('extra service') &&
      headerLabel.includes('price')
    ) {
      return (
        <input
          type="number"
          id={`edit-${header.id}`}
          name={header.id}
          value={editingTransaction[header.id] || ''}
          onChange={handleEditInputChange}
          min={0}
          step="0.01"
          readOnly={true} // Make read-only since it's calculated automatically
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm bg-gray-50 focus:border-pink-500 focus:ring-pink-500"
        />
      )
    }

    if (headerLabel.includes('total') && headerLabel.includes('amount')) {
      return (
        <input
          type="number"
          id={`edit-${header.id}`}
          name={header.id}
          value={editingTransaction[header.id] || ''}
          onChange={handleEditInputChange}
          min={0}
          step="0.01"
          readOnly={true} // Make read-only since it's calculated automatically
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm bg-gray-50 focus:border-pink-500 focus:ring-pink-500"
        />
      )
    }

    if (headerLabel === 'status' || headerLabel.includes('status')) {
      return (
        <select
          id={`edit-${header.id}`}
          name={header.id}
          value={editingTransaction[header.id] || ''}
          onChange={handleEditInputChange}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
        >
          <option value="">Select Status</option>
          <option value="Completed">Completed</option>
          <option value="Cancel">Cancel</option>
        </select>
      )
    }

    if (
      headerLabel.includes('amount') ||
      headerLabel.includes('price') ||
      headerLabel.includes('revenue')
    ) {
      return (
        <input
          type="number"
          id={`edit-${header.id}`}
          name={header.id}
          value={editingTransaction[header.id] || ''}
          onChange={handleEditInputChange}
          min={0}
          step="0.01"
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
        />
      )
    }

    if (headerLabel.includes('payment') || headerLabel.includes('method')) {
      return (
        <select
          id={`edit-${header.id}`}
          name={header.id}
          value={editingTransaction[header.id] || ''}
          onChange={handleEditInputChange}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
        >
          <option value="">Select Payment Method</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="UPI">UPI</option>
          <option value="Online">Online</option>
        </select>
      )
    }

    return (
      <input
        type="text"
        id={`edit-${header.id}`}
        name={header.id}
        value={editingTransaction[header.id] || ''}
        onChange={handleEditInputChange}
        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
      />
    )
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    console.log(`Field changed: ${name} with value: ${value}`)

    const updatedTransaction = {
      ...editingTransaction,
      [name]: value,
    }

    const currentHeader = tableHeaders.find((h) => h.id === name)

    if (
      currentHeader &&
      currentHeader.label.toLowerCase().includes('service price') &&
      !currentHeader.label.toLowerCase().includes('extra')
    ) {
      console.log('Service price field detected, recalculating total')

      // Find the total amount and extra service price fields
      const totalAmountHeader = tableHeaders.find(
        (h) =>
          h.label.toLowerCase().includes('total') &&
          h.label.toLowerCase().includes('amount')
      )

      const extraServicePriceHeader = tableHeaders.find(
        (h) =>
          h.label.toLowerCase().includes('extra service') &&
          h.label.toLowerCase().includes('price')
      )

      // Calculate new total
      if (totalAmountHeader && extraServicePriceHeader) {
        const servicePrice = parseFloat(value) || 0
        const extraServicePrice = parseFloat(
          updatedTransaction[extraServicePriceHeader.id] || 0
        )
        const newTotal = servicePrice + extraServicePrice

        updatedTransaction[totalAmountHeader.id] = newTotal.toFixed(2)
      }
    }

    setEditingTransaction(updatedTransaction)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const rowIndex = editingTransaction._rowIndex

      if (!rowIndex) {
        throw new Error(
          'Could not determine the row index for updating this transaction'
        )
      }

      const submissionData = JSON.parse(JSON.stringify(editingTransaction))

      tableHeaders.forEach((header) => {
        delete submissionData[`${header.id}_original`]
        delete submissionData[`${header.id}_display`]
      })

      delete submissionData._appliedDiscount

      const rowData = tableHeaders.map((header) => {
        let value = submissionData[header.id] || ''
        if (user?.role === 'staff') {
          const allowedFields = [
            'date',
            'booking id',
            'customer name',
            'service',
            'service price',
            'extra service',
            'extra service price',
            'totalamount',
            'status',
          ]

          const headerLabel = header.label.toLowerCase()
          const isAllowed = allowedFields.some((field) =>
            headerLabel.includes(field)
          )

          if (!isAllowed) {
            const originalTransaction = transactions.find(
              (t) => t._id === editingTransaction._id
            )
            if (
              originalTransaction &&
              originalTransaction[header.id] !== undefined
            ) {
              value = originalTransaction[header.id]
            }
          }
        }

        if (
          (header.type === 'date' ||
            header.label.toLowerCase().includes('date')) &&
          value
        ) {
          if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = value
              .split('-')
              .map((part) => parseInt(part, 10))
            // Convert to DD/MM/YYYY format
            value = `${day.toString().padStart(2, '0')}/${month
              .toString()
              .padStart(2, '0')}/${year}`
          }
        }

        if (
          header.label.toLowerCase().includes('timestamp') ||
          (header.id === 'col0' &&
            (header.label.toLowerCase().includes('date') ||
              header.type === 'date'))
        ) {
          if (value) {
            if (value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
              // Already in the correct format
            }
            else if (value.startsWith('Date(') && value.endsWith(')')) {
              const match = /Date\((\d+),(\d+),(\d+)\)/.exec(value)
              if (match) {
                const year = parseInt(match[1], 10)
                const month = parseInt(match[2], 10) + 1
                const day = parseInt(match[3], 10)

                value = `${day.toString().padStart(2, '0')}/${month
                  .toString()
                  .padStart(2, '0')}/${year}`
              }
            }
            else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [year, month, day] = value
                .split('-')
                .map((part) => parseInt(part, 10))
              value = `${day.toString().padStart(2, '0')}/${month
                .toString()
                .padStart(2, '0')}/${year}`
            }
          }
        }

        return value
      })

      console.log('Submitting data with preserved date formats:', rowData)





      const uiTransaction = { ...editingTransaction }

      tableHeaders.forEach((header) => {
        if (
          header.type === 'date' ||
          header.label.toLowerCase().includes('date')
        ) {
          if (uiTransaction[header.id]) {
            // If it's a YYYY-MM-DD format from a date input
            if (uiTransaction[header.id].match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [year, month, day] = uiTransaction[header.id]
                .split('-')
                .map((part) => parseInt(part, 10))
              // Convert to DD/MM/YYYY format for display
              uiTransaction[`${header.id}_formatted`] = `${day
                .toString()
                .padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
              uiTransaction[header.id] = `${day
                .toString()
                .padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
            }
          }
        }
      })

      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction._id === editingTransaction._id
            ? uiTransaction
            : transaction
        )
      )

      setAllTransactions((prev) =>
        prev.map((transaction) =>
          transaction._id === editingTransaction._id
            ? uiTransaction
            : transaction
        )
      )

      const amountField = tableHeaders.find(
        (h) =>
          h.label &&
          (h.label.toLowerCase().includes('amount') ||
            h.label.toLowerCase().includes('price') ||
            h.label.toLowerCase().includes('revenue'))
      )?.id

      if (amountField) {
        let totalAmount = 0
        let cardPayments = 0

        const paymentMethodField = tableHeaders.find(
          (h) =>
            h.label &&
            (h.label.toLowerCase().includes('payment') ||
              h.label.toLowerCase().includes('method'))
        )?.id

        const updatedTransactions = transactions.map((transaction) =>
          transaction._id === editingTransaction._id
            ? uiTransaction
            : transaction
        )

        updatedTransactions.forEach((row) => {
          if (row[amountField] && !isNaN(parseFloat(row[amountField]))) {
            const amount = parseFloat(row[amountField])
            totalAmount += amount

            if (paymentMethodField) {
              const paymentMethod =
                row[paymentMethodField]?.toString().toLowerCase() || ''
              if (
                paymentMethod.includes('card') ||
                paymentMethod.includes('credit') ||
                paymentMethod.includes('debit')
              ) {
                cardPayments += amount
              }
            }
          }
        })

        setStats({
          totalRevenue: totalAmount,
          services: updatedTransactions.length,
          cardPayments: cardPayments,
          averageSale:
            updatedTransactions.length > 0
              ? totalAmount / updatedTransactions.length
              : 0,
        })
      }

      setShowEditForm(false)
      setSelectedExtraServices([])

      setNotification({
        show: true,
        message: 'Transaction updated successfully!',
        type: 'success',
      })
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' })
      }, 3000)
    } catch (error) {
      console.error('Error updating transaction:', error)

      setNotification({
        show: true,
        message: `Failed to update transaction: ${error.message}`,
        type: 'error',
      })
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' })
      }, 5000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleHistoryClick = () => {
    setHistorySearchTerm('')
    setShowHistoryModal(true)
  }

  const filteredHistoryTransactions = historySearchTerm
    ? allTransactions.filter((transaction) =>
      Object.values(transaction).some(
        (value) =>
          value &&
          value
            .toString()
            .toLowerCase()
            .includes(historySearchTerm.toLowerCase())
      )
    )
    : allTransactions

  const formatDateForDisplay = (dateValue) => {
    if (!dateValue) return '—'

    if (
      typeof dateValue === 'string' &&
      dateValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    ) {
      return dateValue
    }

    // For Google Sheets date format: Date(year,month,day)
    if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
      const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateValue)
      if (match) {
        const year = parseInt(match[1], 10)
        const month = parseInt(match[2], 10) + 1
        const day = parseInt(match[3], 10)

        return `${day}/${month}/${year}`
      }
    }
    try {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()

        return `${day}/${month}/${year}`
      }
    } catch (e) {
      console.log('Date parsing error:', e)
    }

    return dateValue
  }

  return (
    <div className="space-y-6">
      {/* Header - Updated with search bar and style matching Inventory */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Daily Transaction</h2>
        <div className="flex flex-col gap-3 mt-4 md:mt-0 sm:flex-row">
          <div className="relative">
            <Search
              className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
              size={18}
            />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <Calendar
                className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                size={18}
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Only show history button if not hidden */}
            {!hideHistoryButton && (
              <button
                className="flex items-center px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 hover:cursor-pointer"
                onClick={handleHistoryClick}
              >
                <History size={18} className="mr-2" />
                View History
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <DailyEntryHeader />

      {/* Transactions Table - Modified to match Booking component style */}
      <TodayTransaction searchItem={searchTerm} filterDate={date} />

      {/* Chart Section - Only display if not hidden */}
      {!hideHistoryButton && <ChartParent />}

      <AnimatePresence>
        {showHistoryModal && (
          <ShowHistory
            setShowHistoryModal={setShowHistoryModal}
            historySearchTerm={historySearchTerm}
            setHistorySearchTerm={setHistorySearchTerm}
            tableHeaders={tableHeaders}
            filteredHistoryTransactions={filteredHistoryTransactions}
          />
        )}
      </AnimatePresence>

      {/* Notification popup - Enhanced with animation and icon */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            key="notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center ${notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="mr-3 text-green-600" size={20} />
            ) : (
              <AlertCircle className="mr-3 text-red-600" size={20} />
            )}
            <p
              className={`font-medium ${notification.type === 'success'
                  ? 'text-green-800'
                  : 'text-red-800'
                }`}
            >
              {notification.message}
            </p>
            <button
              onClick={() =>
                setNotification({ show: false, message: '', type: '' })
              }
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Form Modal - Updated with multi-select dropdown for extra services */}
      <AnimatePresence>
        {showEditForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-pink-600">
                    Edit Transaction
                  </h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowEditForm(false)}
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Check if user is staff, only show specific fields */}
                    {tableHeaders.map((header) => {
                      // For staff users, only show specific fields
                      if (user?.role === 'staff') {
                        // Check if header label matches any of the allowed fields for staff
                        // Added "total amount" to the list
                        const allowedFields = [
                          'date',
                          'booking id',
                          'customer name',
                          'service',
                          'service price',
                          'extra service',
                          'extra service price',
                          'totalamount',
                          'status',
                        ]

                        const headerLabel = header.label.toLowerCase()
                        const isAllowed = allowedFields.some((field) =>
                          headerLabel.includes(field)
                        )

                        if (!isAllowed) {
                          return null // Don't render this field for staff
                        }
                      }

                      // Render field normally for admins or allowed fields for staff
                      return (
                        <div key={`edit-${header.id}`}>
                          <label
                            htmlFor={`edit-${header.id}`}
                            className="block text-sm font-medium text-pink-700"
                          >
                            {header.label}
                          </label>
                          {renderFormField(header)}
                        </div>
                      )
                    })}
                  </div>

                  {/* Discount Button and Mini Form */}
                  {!hideHistoryButton && (
                    <div className="col-span-full">
                      <div className="flex items-center justify-between pt-2 mt-2 mb-2 border-t border-gray-200">
                        <h4 className="font-medium text-gray-700 text-md">
                          Apply Discount
                        </h4>

                        {editingTransaction._appliedDiscount ? (
                          <div className="flex items-center">
                            <span className="mr-4 text-green-600">
                              {editingTransaction._appliedDiscount.code}{' '}
                              discount applied:
                              {editingTransaction._appliedDiscount.percentage}%
                              (₹{editingTransaction._appliedDiscount.amount})
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveDiscount}
                              className="px-3 py-1 text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleAddDiscountClick}
                            className="flex items-center px-3 py-1 text-pink-700 bg-pink-100 rounded-md hover:bg-pink-200"
                          >
                            <Plus size={16} className="mr-1" />
                            Add Discount
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end pt-4 space-x-3 border-t border-pink-100">
                    <button
                      type="button"
                      className="px-4 py-2 text-pink-700 bg-white border border-pink-300 rounded-md shadow-sm hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      onClick={() => setShowEditForm(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 text-white transition-all duration-300 bg-pink-600 rounded-md shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="mr-2" />
                          Update Transaction
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discount Form Modal - Place this outside of Edit Form Modal but inside the main component return */}
      {showDiscountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-[60]">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Apply Promo Discount
              </h3>
              <button
                onClick={handleCloseDiscountForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {loadingPromos ? (
              <div className="py-6 text-center">
                <div className="inline-block w-6 h-6 mb-2 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading promo cards...</p>
              </div>
            ) : promoCards.length === 0 ? (
              <div className="py-6 text-center rounded-md bg-gray-50">
                <p className="text-gray-500">No promo cards available</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-60">
                {promoCards.map((promo) => (
                  <div
                    key={promo.id}
                    onClick={() => handleSelectPromo(promo)}
                    className={`p-3 border rounded-md cursor-pointer transition-all ${selectedPromo?.id === promo.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-800">
                        {promo.code}
                      </h4>
                      <span className="font-bold text-pink-600">
                        {promo.discount}% off
                      </span>
                    </div>
                    {promo.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {promo.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedPromo && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-500">Discount amount:</span>
                  <span className="font-medium">₹{discountAmount}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDiscountForm}
                  className="w-full px-4 py-2 mt-2 text-white bg-pink-600 rounded-md hover:bg-pink-700"
                >
                  Apply Discount
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


export default DailyEntry
