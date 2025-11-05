import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';

/**
 * Reusable Payment Method Selection Modal
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal is closed
 * @param {function} onPaymentSelect - Callback when payment method is selected (cash/online)
 * @param {object} paymentDetails - Details to display (name, amount)
 * @param {boolean} isLoading - Loading state during payment processing
 */
const PaymentMethodModal = ({ 
  isOpen, 
  onClose, 
  onPaymentSelect, 
  paymentDetails = {}, 
  isLoading = false 
}) => {
  
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  const handlePaymentMethodSelect = (method) => {
    if (onPaymentSelect) {
      onPaymentSelect(method);
    }
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Select Payment Method
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Details */}
            {paymentDetails.name && (
              <div className="mb-6">
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center justify-center w-10 h-10 mr-3 text-white rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                      {(paymentDetails.name || '—').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {paymentDetails.name || 'Order Payment'}
                      </p>
                      <p className="text-sm text-gray-500">Payment Amount</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(paymentDetails.amount)}
                    </p>
                    {paymentDetails.itemCount && (
                      <p className="text-sm text-gray-500 mt-1">
                        {paymentDetails.itemCount} item{paymentDetails.itemCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Options */}
            <div className="mb-6">
              <p className="mb-4 text-sm text-gray-600">
                How would you like to pay?
              </p>
              <div className="space-y-3">
                {/* Cash Payment */}
                <button
                  onClick={() => handlePaymentMethodSelect('cash')}
                  disabled={isLoading}
                  className="flex items-center justify-between w-full p-4 transition-all duration-200 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-lg">
                      <span className="text-xl">💰</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Cash</p>
                      <p className="text-sm text-gray-500">Physical cash payment</p>
                    </div>
                  </div>
                  <div className="text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </button>

                {/* Online Payment */}
                <button
                  onClick={() => handlePaymentMethodSelect('online')}
                  disabled={isLoading}
                  className="flex items-center justify-between w-full p-4 transition-all duration-200 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-lg">
                      <span className="text-xl">💳</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Online</p>
                      <p className="text-sm text-gray-500">UPI, Bank Transfer, etc.</p>
                    </div>
                  </div>
                  <div className="text-blue-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </button>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentMethodModal;