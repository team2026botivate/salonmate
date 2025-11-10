import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFetchCart } from '@/hook/ecommerce-store-hook';
import supabase from '@/dataBase/connectdb';

// --- SVG Icon Components ---
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-trash-2"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const MinusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CreditCardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const PackageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
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

    console.log(method,"mehod")
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
          className="bg-opacity-50 fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4"
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
            className="no-scrollbar max-h-[95vh] w-full max-w-md overflow-auto rounded-xl bg-white p-6 shadow-xl"
            // style={{ padding: '1rem', maxHeight: '92vh', overflowY: 'auto' }}
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
                  {/* <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    🛒
                  </div> */}
                  <div>
                    <p className="font-medium text-gray-900">Order Payment</p>
                    <p className="text-sm text-gray-500">Payment Amount</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(paymentDetails.amount)}
                  </p>
                  {paymentDetails.itemCount && (
                    <p className="mt-1 text-sm text-gray-500">
                      {paymentDetails.itemCount} item{paymentDetails.itemCount !== 1 ? 's' : ''}
                    </p>
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

            {/* Confirmation step (visible when a method is selected) */}
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

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [showFullName, setShowFullName] = useState(false);

  const handleDecrease = () => {
    if (item.quantity > 1) onUpdateQuantity(item.id, item.quantity - 1);
    else onRemove(item.id);
  };
  const handleIncrease = () => onUpdateQuantity(item.id, item.quantity + 1);

  const itemTotalPrice = (item.product_id.price * item.quantity).toFixed(2);

  // Check if name is too long (more than 50 char)
  const isLongName = item.product_id.name.length > 50;
  const displayName =
    !showFullName && isLongName ? item.product_id.name.slice(0, 50) + '...' : item.product_id.name;

  return (
    <div className="flex space-x-4 rounded-lg bg-gray-800 p-4">
      <img
        src={item.product_id.image_url}
        alt={item.name}
        className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100 object-cover"
        onError={(e) => {
          e.target.src = 'https://placehold.co/100x100/f0f0f0/999?text=Image';
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="leading-snug font-semibold text-white">{item.product_id.name}</h3>
            {isLongName && (
              <button
                onClick={() => setShowFullName(!showFullName)}
                className="mt-1 text-xs text-blue-400 transition-colors hover:text-blue-300"
              >
                {showFullName ? 'Show less' : 'Show More'}
              </button>
            )}
            <p className="mt-1 text-sm text-gray-400">{item.variant}</p>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="flex-shrink-0 text-gray-400 transition-colors hover:text-rose-400"
            aria-label="Remove item"
          >
            <TrashIcon />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* minus button */}
            <button
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              className="disabled: flex h-7 w-7 cursor-not-allowed items-center justify-center rounded bg-gray-700 text-gray-300 transition-colors hover:bg-gray-600"
              aria-label="Decrease quantity"
            >
              <MinusIcon />
            </button>

            <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>

            <button
              onClick={handleIncrease}
              className="flex h-7 w-7 items-center justify-center rounded bg-gray-700 text-gray-300 transition-colors hover:bg-gray-600"
              aria-label="Increase quantity"
            >
              <PlusIcon />
            </button>
          </div>
          <div className="text-right">
            <p className="font-semibold text-white">₹{itemTotalPrice}</p>
            {item.product_id.price && (
              <p className="text-sm text-gray-500 line-through">
                ₹{(item.product_id.price * item.quantity).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// import {useFetchCart} from '@/hook/ecommerce-store-hook.jsx';

export default function ShoppingCartNav() {
  // const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [_itemCount, setItemCount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [toast, setToast] = useState({ show: false, message: ' ', type: 'success' });

  const { fetchCart, cartItems, loading, error, setCartItems } = useFetchCart();

  useEffect(() => {
    fetchCart(); // Now this will actually call the function
  }, []);

  // useEffect(() => {

  //   if (!user?.profile?.store_id) return;

  //   // Subscribe to cart changes
  //   const channel = supabase
  //   .channel('cart-changes')
  //   .on(
  //     'postgres_changes',
  //     {
  //       event: '*',
  //       schema: 'public',
  //       table: 'saloon_e_commerce_cart_items',
  //       filter: `store_id=eq.${user.profile.store_id}`
  //     },
  //     (payload) => {
  //       console.log('cart updated: ', payload);
  //       fetchCart();
  //     }
  //   )
  //   .subscribe();

  //   // Cleanup on unmount
  //   return () => {
  //     supabase.removeChannel (channel);
  //   };
  // }, [user?.profile .store_id, fetchcart]);

  const shippingCost = 0;

  console.log('cartItems', cartItems);

  useEffect(() => {
    let newSubtotal = 0;
    let newItemCount = 0;

    cartItems.forEach((item) => {
      const price = Number(item.product_id?.price ?? item.price ?? 0);
      const qty = Number(item.quantity ?? 0);
      newSubtotal += price * qty;
      newItemCount += qty;
    });
    setSubtotal(newSubtotal);
    setTotal(newSubtotal + shippingCost);
    setItemCount(newItemCount);
  }, [cartItems]);

  useEffect(() => {
    const channel = supabase
      .channel('cart-uptades')
      .on(
        'postgres_changes',
        {
          event: '*', // listen to all events ( Insert, update, delete)
          schema: 'public',
          table: 'saloon_e_commerce_cart_items',
        },
        (payload) => {
          console.log('Cart changed: ', payload);
          fetchCart(); //re-fetch updated cart data
        }
      )
      .subscribe();

    // cleanup when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCart]);

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveItem = async (id) => {
    try {
      //Delete from Supabase
      const { error } = await supabase.from('saloon_e_commerce_cart_items').delete().eq('id', id);

      if (error) throw error;

      // Update Local state
      setCartItems((currentItems) => currentItems.filter((item) => item.id !== id));

      showToast('Item removed from cart', 'sucess');
    } catch (error) {
      console.error('Error removing item: ', error);
      showToast('Failed to remove item', 'error');
    }
  };
  const handleCheckout = () => setShowPaymentModal(true);

  const handlePaymentSelect = async (paymentMethod) => {
    setIsProcessingPayment(true);
    try {
      t
     
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
          className="fixed right-4 bottom-4 z-[10000]"
        >
          <div
            className={`flex items-center space-x-3 rounded-lg px-6 py-3 shadow-lg ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex min-h-screen w-full flex-col items-start justify-center bg-gray-950 py-4 font-sans text-gray-100">
      <div className="absolute right-0 mt-[55px] mr-[10px] w-full max-w-sm rounded-2xl bg-gray-900 p-1 shadow-lg">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="pt-1 pl-[9px] text-2xl font-bold text-white">Your Cart</h1>
        </div>
        <p className="mb-6 pl-[9px] text-sm text-gray-400">Review your items before checkout.</p>

        <div className="no-scrollbar h-96 space-y-5 overflow-y-auto  pr-2">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))
          ) : (
            <p className=" flex h-full w-full flex-col justify-center py-4 text-center text-2xl font-bold   text-gray-200">
              Your cart is empty.
            </p>
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="mt-8 space-y-1 border-t border-gray-700 px-2 pt-3">
              <div className="flex justify-between text-sm">
                <p className="font-bold text-gray-400">Subtotal</p>
                <p className="font-medium text-white">₹{subtotal.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-gray-700 px-2 pt-4">
              <div className="flex justify-between text-base font-bold text-white">
                <p>Total</p>
                <p>₹{total.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3 px-2">
              <button
                onClick={handleCheckout}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-white py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-200"
              >
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
