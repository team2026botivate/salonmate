import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFetchCart } from '@/hook/ecommerce-store-hook';
import supabase from '@/dataBase/connectdb';
import { CreditCardIcon } from './cart/Icons';
import CartItem from './cart/CartItem';
import PaymentMethodModal from './cart/PaymentMethodModal';
import ToastPortal from './cart/ToastPortal';

export default function ShoppingCartNav() {
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
      // Simulate payment processing or add your actual payment logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay

      showToast(`Payment confirmed via ${paymentMethod}!`, 'success');
      setShowPaymentModal(false);

      // Add your additional logic here (e.g., create order, clear cart, etc.)
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

  return (
    <div className="flex min-h-screen w-full flex-col items-start justify-center bg-gray-950 py-4 font-sans text-gray-100">
      <div className="absolute right-0 mt-[55px] mr-[10px] w-full max-w-sm rounded-2xl bg-gray-900 p-1 shadow-lg">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="pt-1 pl-[9px] text-2xl font-bold text-white">Your Cart</h1>
        </div>
        <p className="mb-6 pl-[9px] text-sm text-gray-400">Review your items before checkout.</p>

        <div className="no-scrollbar h-96 space-y-5 overflow-y-auto pr-2">
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
            <p className="flex h-full w-full flex-col justify-center py-4 text-center text-2xl font-bold text-gray-200">
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

      <ToastPortal toast={toast} />
    </div>
  );
}
