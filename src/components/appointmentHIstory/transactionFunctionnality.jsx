import {
  AlertCircle,
  Ban,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  Receipt,
  Smartphone,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { generateTransactionId } from '../../utils/generateTransactionId';
import { useGetPromoCardData } from '@/hook/dbOperation';
import { cn } from '@/utils/cn';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const TransactionFunctionality = ({
  appointmentId,
  baseService,
  onSubmit,
  loadingForSubmit,
  setIsEditModalOpen,
  extraServices,
}) => {
  
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [discountError, setDiscountError] = useState('');
  const { data: promoCardData, loading: promoCardLoading } = useGetPromoCardData();

  // Initialize selectedExtras with extraServices when component mounts or extraServices changes
  useEffect(() => {
    if (extraServices && extraServices.length > 0) {
      setSelectedExtras(extraServices);
    }
  }, [extraServices]);

  // Calculations
  const subtotal =
    baseService?.price + selectedExtras.reduce((sum, extra) => sum + extra?.base_price, 0);
  const discountAmount = Math.min((subtotal * discountPercent) / 100, subtotal);
  // GST calculations (18% on taxable amount = subtotal - discount)
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const GST_PERCENT = 18;
  const gstAmount = +(taxableAmount * (GST_PERCENT / 100)).toFixed(2);
  const totalDue = Math.max(0, taxableAmount + gstAmount);

  // Validation
  const isFormValid = () => {
    if (!paymentMethod) return false;
    if (paymentMethod !== 'cash' && !transactionId.trim()) return false;
    if (discountError) return false;
    return true;
  };

  // Handlers
  const handleExtraServiceToggle = (extra) => {
    const isSelected = selectedExtras.some(
      (selected) => selected?.service_name === extra?.service_name
    );

    if (isSelected) {
      setSelectedExtras(
        selectedExtras.filter((selected) => selected?.service_name !== extra?.service_name)
      );
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleDiscountChange = (value) => {
    const numValue = parseFloat(value) || 0;

    if (numValue < 0) {
      setDiscountPercent(0);
      setDiscountError('Discount cannot be negative');
    } else if (numValue > 100) {
      setDiscountPercent(100);
      setDiscountError('Discount cannot exceed 100%');
    } else {
      setDiscountPercent(numValue);
      setDiscountError('');
    }
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;

    const payload = {
      appointmentId: appointmentId,
      transactionId: generateTransactionId(),
      transactionStatus: 'paid',
      totalDue,
      gst_amount: gstAmount,
      payment: {
        method: paymentMethod,
        ...(paymentMethod !== 'cash' && {
          transactionId: transactionId.trim(),
        }),
      },

      ...(notes.trim() && { notes: notes.trim() }),
    };

    onSubmit(payload);
  };

  // Filter available extras based on search
  const filteredExtras = (extraServices ?? []).filter((extra) =>
    extra?.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: Banknote, isAvtive: true },
    { id: 'online', name: 'Online', icon: Smartphone, isAvtive: false },
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: CreditCard,
      isAvtive: false,
    },
    { id: 'debit_card', name: 'Debit Card', icon: CreditCard, isAvtive: false },
  ];

  return (
    <div className="relative w-full h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <X
        onClick={() => setIsEditModalOpen(false)}
        className="absolute cursor-pointer top-8 right-5 hover:text-red-600 md:right-10"
      />
      <div className="h-full mx-auto overflow-y-auto hideScrollBar max-w-7xl md:py-10">
        {/* Header */}
        <div className="mb-5 text-center">
          <div className="flex items-center justify-start mb-4 md:justify-center">
            <Receipt className="w-8 h-8 mr-3 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Transaction / Billing</h1>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Left Column - Extra Services */}
          <div className="col-span-4 max-h-[calc(100vh-200px)] overflow-auto rounded-2xl md:col-span-2 lg:col-span-2">
            <div className="p-6 bg-white shadow-lg">
              <h2 className="mb-6 text-xl font-semibold text-gray-800">Extra Services</h2>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Loading extra services...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertCircle className="w-6 h-6 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              {/* Extra Services List */}
              {!loading && !error && (
                <div className="space-y-3">
                  {filteredExtras.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      {(extraServices?.length ?? 0) === 0
                        ? 'No extra services available'
                        : 'No services match your search'}
                    </div>
                  ) : (
                    filteredExtras.map((extra) => {
                      const isSelected = selectedExtras.some(
                        (selected) => selected?.service_name === extra?.service_name
                      );
                      return (
                        <label
                          key={extra.service_name || `${extra.service_name}-${extra.base_price}`}
                          className={`flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
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
                              className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>

                          <div className="flex items-center justify-between flex-1 ml-4">
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
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="col-span-4 flex h-[calc(100vh-100px)] flex-col md:col-span-2 lg:col-span-2">
            <div className="flex flex-col h-full p-6 bg-white shadow-lg rounded-2xl">
              <div className="flex-1 pr-2 -mr-2 overflow-auto hideScrollBar thickScrollBar">
                <h3 className="mb-6 text-xl font-semibold text-gray-800">Billing Summary</h3>

                {/* Base Service */}
                <div className="p-4 mb-6 rounded-xl bg-gray-50">
                  <h4 className="mb-2 text-sm font-medium text-gray-600">Base Service</h4>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{baseService?.name}</span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(baseService?.price)}
                    </span>
                  </div>
                </div>

                {/* Selected Extras */}
                {selectedExtras.length > 0 && (
                  <div className="mb-6">
                    <h4 className="mb-3 text-sm font-medium text-gray-600">Selected Extras</h4>
                    <div className="space-y-2">
                      {selectedExtras.map((extra, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-blue-50"
                        >
                          <span className="text-sm text-gray-800">{extra.service_name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">
                              {formatCurrency(extra.base_price)}
                            </span>
                            <button
                              onClick={() => handleExtraServiceToggle(extra)}
                              className="p-1 text-red-500 transition-colors rounded hover:bg-red-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>

                  {/* Discount */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                    <select
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={discountPercent}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        discountError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    >
                      {promoCardLoading ? (
                        <option value="">Loading...</option>
                      ) : (
                        <>
                          <option value="">Select Discount</option>
                          {promoCardData.map((promoCard) => (
                            <option key={promoCard.id} value={promoCard.discount}>
                              {`${promoCard.code}_${promoCard.discount}%`}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    {discountError && <p className="text-xs text-green-500">{discountError}</p>}
                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-green-600">
                        <span>Discount Amount</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Taxable Amount */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Taxable Amount</span>
                    <span className="font-medium">{formatCurrency(taxableAmount)}</span>
                  </div>

                  {/* GST 18% */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium">{formatCurrency(gstAmount)}</span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-800">Total Due</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totalDue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Payment Method</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      const isSelected = paymentMethod === method.id && method.isAvtive;

                      return (
                        <label
                          key={method.id}
                          className={cn(
                            'relative flex cursor-pointer items-center rounded-lg border-2 p-3 transition-all',
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300',
                            method?.isAvtive ? '' : 'bg-gray-300 hover:cursor-not-allowed'
                          )}
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
                            className={`mr-2 h-4 w-4 ${
                              isSelected ? 'text-blue-600' : 'text-gray-500'
                            }`}
                          />
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isSelected ? 'text-blue-900' : 'text-gray-700',
                              !method?.isAvtive && 'text-gray-400'
                            )}
                          >
                            {method.name}
                          </span>
                          {!method?.isAvtive ? (
                            <Ban className="absolute w-4 h-4 text-red-500 -translate-x-1/2 -translate-y-1/2 top-1/2 right-1/2" />
                          ) : null}
                        </label>
                      );
                    })}
                  </div>

                  {/* Transaction ID for non-cash payments */}
                  {paymentMethod && paymentMethod !== 'cash' && (
                    <div className="mt-3">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Transaction ID *
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter transaction ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submit Button - Sticky at bottom */}
              <div className="border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  className={`w-full rounded-xl px-6 py-3 font-semibold transition-all duration-200 ${
                    isFormValid()
                      ? 'transform bg-blue-600 text-white shadow-lg hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500'
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
  );
};

export default TransactionFunctionality;
