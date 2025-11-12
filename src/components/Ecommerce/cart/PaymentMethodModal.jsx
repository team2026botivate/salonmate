// File: src/components/PaymentMethodModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';

/**
 * Reusable Payment Method Selection Modal
 * props:
 *  - isOpen
 *  - onClose
 *  - onPaymentSelect
 *  - paymentDetails = { amount, itemCount }
 *  - isLoading
 */
const PaymentMethodModal = ({
  isOpen,
  onClose,
  onPaymentSelect,
  paymentDetails = {},
  isLoading = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  useEffect(() => {
    // Reset steps when modal closed/opened
    if (!isOpen) {
      setSelectedMethod(null);
      setConfirmChecked(false);
    }
  }, [isOpen]);

  const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  const handlePaymentMethodSelect = (method) => {
    if (isLoading) return;
    setSelectedMethod(method);
    setConfirmChecked(false);
  };

  const handleConfirm = () => {
    if (!selectedMethod) return;
    if (!confirmChecked) return;
    if (onPaymentSelect) onPaymentSelect(selectedMethod);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setSelectedMethod(null);
        setConfirmChecked(false);
        onClose();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-opacity-50 fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4"
          onClick={() => {
            setSelectedMethod(null);
            setConfirmChecked(false);
            onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="no-scrollbar max-h-[95vh] w-full max-w-md overflow-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Select Payment Method</h3>
              <button
                onClick={() => {
                  setSelectedMethod(null);
                  setConfirmChecked(false);
                  onClose();
                }}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center">
                  <div>
                    <p className="font-medium text-gray-900">Order Payment</p>
                    <p className="text-sm text-gray-500">Payment Amount</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(paymentDetails.amount)}
                  </p>
                  {paymentDetails.itemCount != null && (
                    <p className="mt-1 text-sm text-gray-500">
                      {paymentDetails.itemCount} item{paymentDetails.itemCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-4 text-sm text-gray-600">How would you like to pay?</p>

              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentMethodSelect('cash')}
                  disabled={isLoading}
                  className={`flex w-full items-center justify-between rounded-lg border p-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${selectedMethod === 'cash' ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'}`}
                >
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <span className="text-xl">💰</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Cash</p>
                      <p className="text-sm text-gray-500">Physical cash payment</p>
                    </div>
                  </div>
                  <div className="text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </button>

                <button
                  onClick={() => handlePaymentMethodSelect('online')}
                  disabled={isLoading}
                  className={`flex w-full items-center justify-between rounded-lg border p-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${selectedMethod === 'online' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <span className="text-xl">💳</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Online</p>
                      <p className="text-sm text-gray-500">UPI, Bank Transfer, etc.</p>
                    </div>
                  </div>
                  <div className="text-blue-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </button>
              </div>
            </div>

            {selectedMethod && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="mb-2 text-sm font-bold text-gray-700">Confirm payment</p>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-sky-500">
                      {selectedMethod === 'cash' ? 'Cash' : 'Online'} payment
                    </p>
                    <p className="text-sm font-medium text-gray-500">
                      {selectedMethod === 'cash'
                        ? 'Pay with cash to delivery'
                        : 'Proceed with online payment (UPI/Bank/etc.)'}
                    </p>
                  </div>
                  <p className="text- font-semibold text-gray-900">
                    {formatCurrency(paymentDetails.amount)}
                  </p>
                </div>

                <label className="mb-3 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm font-bold text-gray-600">
                    I confirm payment of{' '}
                    <span className="font-medium text-gray-900">
                      {formatCurrency(paymentDetails.amount)}
                    </span>
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedMethod(null);
                      setConfirmChecked(false);
                    }}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                  >
                    Change method
                  </button>

                  <button
                    onClick={handleConfirm}
                    disabled={!confirmChecked || isLoading}
                    className={`flex-1 rounded-lg px-4 py-2 font-semibold transition-colors ${!confirmChecked || isLoading ? 'cursor-not-allowed bg-gray-200 text-gray-500' : 'bg-green-500 text-white hover:bg-green-500/80'}`}
                  >
                    {isLoading ? 'Processing...' : 'Confirm & Pay'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setSelectedMethod(null);
                  setConfirmChecked(false);
                  onClose();
                }}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 font-medium text-rose-500 transition-colors hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // server-side rendering safe: only portal if document exists
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default PaymentMethodModal;
