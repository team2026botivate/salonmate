import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

// --- SVG Icon Components ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" x2="7.5" y1="9.4" y2="9.4" />
    <path d="M3.8 15.3a2.4 2.4 0 0 0 1.9 1.5h12.6a2.4 2.4 0 0 0 1.9-1.5L21 10.6H3Z" />
    <path d="M3 10.6V6.1c0-1.2 1-2.1 2.2-2.1h13.6c1.2 0 2.2 1 2.2 2.1v4.5" />
    <path d="M7.5 4.5l3-3 3 3" />
    <path d="M12 16.8v6" />
    <path d="M8.5 22.8h7" />
  </svg>
);

// --- Payment Method Modal Component (portal'd) ---
const PaymentMethodModal = ({
  isOpen,
  onClose,
  onPaymentSelect,
  paymentDetails = {},
  isLoading = false
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
    // instead of immediately submitting, move to confirmation step
    if (isLoading) return;
    setSelectedMethod(method);
    setConfirmChecked(false);
  };

  const handleConfirm = () => {
    if (!selectedMethod) return;
    // require checkbox to be checked before confirming
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => {
            // clicking backdrop closes and clears selections
            setSelectedMethod(null);
            setConfirmChecked(false);
            onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md p-6 bg-white shadow-xl max-h-[95vh] overflow-auto no-scrollbar rounded-xl"
            // style={{ padding: '1rem', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Select Payment Method</h3>
              <button
                onClick={() => {
                  setSelectedMethod(null);
                  setConfirmChecked(false);
                  onClose();
                }}
                className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center mb-2">
                  <div className="flex items-center justify-center w-10 h-10 mr-3 text-white rounded-full bg-gradient-to-br from-blue-400 to-purple-500">🛒</div>
                  <div>
                    <p className="font-medium text-gray-900">Order Payment</p>
                    <p className="text-sm text-gray-500">Payment Amount</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentDetails.amount)}</p>
                  {paymentDetails.itemCount && (
                    <p className="text-sm text-gray-500 mt-1">{paymentDetails.itemCount} item{paymentDetails.itemCount !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment selection list */}
            <div className="mb-4">
              <p className="mb-4 text-sm text-gray-600">How would you like to pay?</p>

              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentMethodSelect('cash')}
                  disabled={isLoading}
                  className={`flex items-center justify-between w-full p-4 transition-all duration-200 border rounded-lg disabled:cursor-not-allowed disabled:opacity-50
                    ${selectedMethod === 'cash' ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'}`}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-lg"><span className="text-xl">💰</span></div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Cash</p>
                      <p className="text-sm text-gray-500">Physical cash payment</p>
                    </div>
                  </div>
                  <div className="text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
                </button>

                <button
                  onClick={() => handlePaymentMethodSelect('online')}
                  disabled={isLoading}
                  className={`flex items-center justify-between w-full p-4 transition-all duration-200 border rounded-lg disabled:cursor-not-allowed disabled:opacity-50
                    ${selectedMethod === 'online' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-lg"><span className="text-xl">💳</span></div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Online</p>
                      <p className="text-sm text-gray-500">UPI, Bank Transfer, etc.</p>
                    </div>
                  </div>
                  <div className="text-blue-600"><CheckCircle2 className="w-5 h-5" /></div>
                </button>
              </div>
            </div>

            {/* Confirmation step (visible when a method is selected) */}
            {selectedMethod && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-700 mb-2 font-bold">Confirm payment</p>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-xl text-sky-500">{selectedMethod === 'cash' ? 'Cash' : 'Online'} payment</p>
                    <p className="text-sm text-gray-500 font-medium">{selectedMethod === 'cash' ? 'Pay with cash to delivery' : 'Proceed with online payment (UPI/Bank/etc.)'}</p>
                  </div>
                  <p className="font-semibold text- text-gray-900">{formatCurrency(paymentDetails.amount)}</p>
                </div>

                <label className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600 font-bold">I confirm payment of <span className="font-medium text-gray-900">{formatCurrency(paymentDetails.amount)}</span></span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedMethod(null);
                      setConfirmChecked(false);
                    }}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-white rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Change method
                  </button>

                  <button
                    onClick={handleConfirm}
                    disabled={!confirmChecked || isLoading}
                    className={`flex-1 px-4 py-2 font-semibold rounded-lg transition-colors
                      ${(!confirmChecked || isLoading) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-500/80'}`}
                  >
                    {isLoading ? 'Processing...' : 'Confirm & Pay'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedMethod(null);
                  setConfirmChecked(false);
                  onClose();
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-rose-500 font-medium transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

// --- Initial Cart Data ---
const INITIAL_CART_ITEMS = [
  { id: 1, name: 'Classic Chronograph Watch', variant: 'Black • Standard', price: 299.99, originalPrice: 399.99, quantity: 1, image: 'https://placehold.co/100x100/f0f0f0/333?text=Watch+1' },
  { id: 2, name: 'Sport Diver Watch', variant: 'Blue • Standard', price: 199.99, originalPrice: null, quantity: 2, image: 'https://placehold.co/100x100/f0f0f0/333?text=Watch+2' },
  { id: 3, name: 'Sport Diver Watch', variant: 'Blue • Standard', price: 199.99, originalPrice: null, quantity: 2, image: 'https://placehold.co/100x100/f0f0f0/333?text=Watch+2' },
  { id: 4, name: 'Sport Diver Watch', variant: 'Blue • Standard', price: 199.99, originalPrice: null, quantity: 2, image: 'https://placehold.co/100x100/f0f0f0/333?text=Watch+2' },
  { id: 5, name: 'Sport Diver Watch', variant: 'Blue • Standard', price: 199.99, originalPrice: null, quantity: 2, image: 'https://placehold.co/100x100/f0f0f0/333?text=Watch+2' },
];

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleDecrease = () => {
    if (item.quantity > 1) onUpdateQuantity(item.id, item.quantity - 1);
    else onRemove(item.id);
  };
  const handleIncrease = () => onUpdateQuantity(item.id, item.quantity + 1);
  const itemTotalPrice = (item.price * item.quantity).toFixed(2);

  return (
    <div className="flex space-x-4">
      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg bg-gray-100 object-cover" onError={(e) => { e.target.src = 'https://placehold.co/100x100/f0f0f0/999?text=Image'; }} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-white truncate">{item.name}</h3>
            <p className="text-sm text-gray-400">{item.variant}</p>
          </div>
          <button onClick={() => onRemove(item.id)} className="text-gray-500 hover:text-white transition-colors flex-shrink-0 ml-2" aria-label="Remove item"><TrashIcon /></button>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center space-x-2">
            <button onClick={handleDecrease} className="w-6 h-6 flex items-center justify-center bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors" aria-label="Decrease quantity"><MinusIcon /></button>
            <span className="font-medium text-sm w-5 text-center">{item.quantity}</span>
            <button onClick={handleIncrease} className="w-6 h-6 flex items-center justify-center bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors" aria-label="Increase quantity"><PlusIcon /></button>
          </div>
          <div className="text-right">
            <p className="font-semibold text-white">₹{itemTotalPrice}</p>
            {item.originalPrice && <p className="text-sm text-gray-500 line-through">₹{(item.originalPrice * item.quantity).toFixed(2)}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ShoppingCartNav() {
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [_itemCount, setItemCount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [toast, setToast] = useState({ show: false, message: ' ', type: 'success' });
  const shippingCost = 0;

  useEffect(() => {
    let newSubtotal = 0;
    let newItemCount = 0;
    cartItems.forEach(item => { newSubtotal += item.price * item.quantity; newItemCount += item.quantity; });
    setSubtotal(newSubtotal);
    setTotal(newSubtotal + shippingCost);
    setItemCount(newItemCount);
  }, [cartItems]);

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) { handleRemoveItem(id); return; }
    setCartItems(currentItems => currentItems.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const handleRemoveItem = (id) => setCartItems(currentItems => currentItems.filter(item => item.id !== id));

  const handleCheckout = () => setShowPaymentModal(true);

  const handlePaymentSelect = async (paymentMethod) => {
    setIsProcessingPayment(true);
    try {
      // simulate payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowPaymentModal(false);
      showToast(`Payment of ₹${total.toFixed(2)} processed successfully via ${paymentMethod}!`, 'success');
      setTimeout(() => setCartItems([]), 1000);
    } catch (error) {
      console.error('Payment error:', error);
      showToast('Payment failed. Please try again.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Toast content rendered via portal to document.body and with high z-index to avoid stacking issues
  const toastContent = (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          key="cart-toast"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed z-[10000] right-4 bottom-4"
        >
          <div className={`flex items-center space-x-3 rounded-lg px-6 py-3 shadow-lg ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-gray-950 text-gray-100 font-sans py-4 flex justify-center items-start min-h-screen w-[368px] flex flex-col">
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl shadow-lg p-6 mt-[55px] ">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-white">Your Cart</h1>
          <span className="bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full  absolute top-[34px] right-[70px]">{cartItems.length} items</span>
        </div>
        <p className="text-gray-400 text-sm mb-6">Review your items before checkout.</p>

        <div className="space-y-6 max-h-[320px] overflow-y-auto pr-2 no-scrollbar">
          {cartItems.length > 0 ? cartItems.map(item => (
            <CartItem key={item.id} item={item} onUpdateQuantity={handleUpdateQuantity} onRemove={handleRemoveItem} />
          )) : (
            <p className="text-gray-200 font-bold text-center text-2xl py-4">Your cart is empty.</p>
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="mt-8 pt-3 border-t border-gray-700 space-y-1">
              <div className="flex justify-between text-sm">
                <p className="text-gray-400 font-bold">Subtotal</p>
                <p className="font-medium text-white">₹{subtotal.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-base font-bold text-white">
                <p>Total</p>
                <p>₹{total.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <button onClick={handleCheckout} className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors">
                <CreditCardIcon />
                <span>Checkout</span>
              </button>
            </div>
          </>
        )}
      </div>

      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSelect={handlePaymentSelect}
        paymentDetails={{ amount: total, itemCount: cartItems.length }}
        isLoading={isProcessingPayment}
      />

      {typeof document !== 'undefined' ? createPortal(toastContent, document.body) : null}
    </div>
  );
}
