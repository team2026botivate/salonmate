import {
  AlertCircle,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  Receipt,
  Smartphone,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { generateTransactionId } from '../../utils/generateTransactionId'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const TransactionFunctionality = ({
  appointmentId,
  baseService,
  onSubmit,
  loadingForSubmit,
  setIsEditModalOpen,
  extraServices,
}) => {
  const [selectedExtras, setSelectedExtras] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')
  const [discountError, setDiscountError] = useState('')

  // Initialize selectedExtras with extraServices when component mounts or extraServices changes
  useEffect(() => {
    if (extraServices && extraServices.length > 0) {
      setSelectedExtras(extraServices)
    }
  }, [extraServices])

  // Calculations
  const subtotal =
    baseService?.price +
    selectedExtras.reduce((sum, extra) => sum + extra?.base_price, 0)
  const discountAmount = Math.min((subtotal * discountPercent) / 100, subtotal)
  const totalDue = Math.max(0, subtotal - discountAmount)

  // Validation
  const isFormValid = () => {
    if (!paymentMethod) return false
    if (paymentMethod !== 'cash' && !transactionId.trim()) return false
    if (discountError) return false
    return true
  }

  // Handlers
  const handleExtraServiceToggle = (extra) => {
    const isSelected = selectedExtras.some(
      (selected) => selected?.service_name === extra?.service_name
    )

    if (isSelected) {
      setSelectedExtras(
        selectedExtras.filter(
          (selected) => selected?.service_name !== extra?.service_name
        )
      )
    } else {
      setSelectedExtras([...selectedExtras, extra])
    }
  }

  const handleDiscountChange = (value) => {
    const numValue = parseFloat(value) || 0

    if (numValue < 0) {
      setDiscountPercent(0)
      setDiscountError('Discount cannot be negative')
    } else if (numValue > 100) {
      setDiscountPercent(100)
      setDiscountError('Discount cannot exceed 100%')
    } else {
      setDiscountPercent(numValue)
      setDiscountError('')
    }
  }

  const handleSubmit = () => {
    if (!isFormValid()) return

    const payload = {
      appointmentId: appointmentId,
      transactionId: generateTransactionId(),
      transactionStatus: 'paid',
      totalDue,
      payment: {
        method: paymentMethod,
        ...(paymentMethod !== 'cash' && {
          transactionId: transactionId.trim(),
        }),
      },

      ...(notes.trim() && { notes: notes.trim() }),
    }

    onSubmit(payload)
  }

  // Filter available extras based on search
  const filteredExtras = (extraServices ?? []).filter((extra) =>
    extra?.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: Banknote },
    { id: 'online', name: 'Online', icon: Smartphone },
    { id: 'credit_card', name: 'Credit Card', icon: CreditCard },
    { id: 'debit_card', name: 'Debit Card', icon: CreditCard },
  ]

  return (
    <div className="h-screen w-full  bg-gradient-to-br from-blue-50 to-indigo-50 p-6  relative">
      <X
        onClick={() => setIsEditModalOpen(false)}
        className="absolute top-8 right-5 hover:text-red-600 md:right-10 cursor-pointer"
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-5 ">
          <div className="flex items-center  md:justify-center justify-start mb-4 ">
            <Receipt className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Transaction / Billing
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Extra Services */}
          <div className="lg:col-span-2 max-h-[calc(100vh-200px)] overflow-auto rounded-2xl ">
            <div className="bg-white  shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Extra Services
              </h2>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  <span className="ml-3 text-gray-600">
                    Loading extra services...
                  </span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              {/* Extra Services List */}
              {!loading && !error && (
                <div className="space-y-3">
                  {filteredExtras.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {(extraServices?.length ?? 0) === 0
                        ? 'No extra services available'
                        : 'No services match your search'}
                    </div>
                  ) : (
                    filteredExtras.map((extra) => {
                      const isSelected = selectedExtras.some(
                        (selected) =>
                          selected?.service_name === extra?.service_name
                      )
                      return (
                        <label
                          key={
                            extra.service_name ||
                            `${extra.service_name}-${extra.base_price}`
                          }
                          className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleExtraServiceToggle(extra)}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>

                          <div className="ml-4 flex-1 flex items-center justify-between">
                            <span
                              className={`font-medium ${
                                isSelected ? 'text-blue-900' : 'text-gray-800'
                              }`}
                            >
                              {extra.service_name}
                            </span>
                            <span
                              className={`font-semibold ${
                                isSelected ? 'text-blue-700' : 'text-gray-600'
                              }`}
                            >
                              {formatCurrency(extra.base_price)}
                            </span>
                          </div>
                        </label>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-2 h-[calc(100vh-100px)] flex flex-col">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
              <div className="flex-1 overflow-auto pr-2 -mr-2 thickScrollBar">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Billing Summary
                </h3>

                {/* Base Service */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Base Service
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">
                      {baseService?.name}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(baseService?.price)}
                    </span>
                  </div>
                </div>

                {/* Selected Extras */}
                {selectedExtras.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">
                      Selected Extras
                    </h4>
                    <div className="space-y-2">
                      {selectedExtras.map((extra, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-800">
                            {extra.service_name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">
                              {formatCurrency(extra.base_price)}
                            </span>
                            <button
                              onClick={() => handleExtraServiceToggle(extra)}
                              className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Discount */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={discountPercent}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        discountError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {discountError && (
                      <p className="text-red-500 text-xs">{discountError}</p>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-orange-600">
                        <span>Discount Amount</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">
                        Total Due
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totalDue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon
                      const isSelected = paymentMethod === method.id

                      return (
                        <label
                          key={method.id}
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={isSelected}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="sr-only"
                          />
                          <IconComponent
                            className={`h-4 w-4 mr-2 ${
                              isSelected ? 'text-blue-600' : 'text-gray-500'
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              isSelected ? 'text-blue-900' : 'text-gray-700'
                            }`}
                          >
                            {method.name}
                          </span>
                        </label>
                      )
                    })}
                  </div>

                  {/* Transaction ID for non-cash payments */}
                  {paymentMethod && paymentMethod !== 'cash' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction ID *
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter transaction ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Submit Button - Sticky at bottom */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    isFormValid()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loadingForSubmit ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionFunctionality
