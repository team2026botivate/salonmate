import React, { useState, useEffect } from 'react';

// --- SVG Icon Components ---
// Using inline SVGs for all icons as requested.

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

const ArrowRightIcon = () => (
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
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
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

// --- Initial Cart Data ---
const INITIAL_CART_ITEMS = [
  {
    id: 1,
    name: 'Classic Chronograph Watch',
    variant: 'Black • Standard',
    price: 299.99,
    originalPrice: 399.99,
    quantity: 1,
    image: 'https://placehold.co/100x100/f0f0f0/333?text=Watch+1',
  },
  {
    id: 2,
    name: 'Sport Diver Watch',
    variant: 'Blue • Standard',
    price: 199.99, // Price per item
    originalPrice: null,
    quantity: 2,
    image: 'https://placehold.co/100x100/f0f0f0/333?text=Watch+2',
  },
   {
    id: 3,
    name: 'Sport Diver Watch',
    variant: 'Blue • Standard',
    price: 199.99, // Price per item
    originalPrice: null,
    quantity: 2,
    image: 'https://placehold.co/100x100/f0f0f0/333?text=Watch+2',
  },
   {
    id: 4,
    name: 'Sport Diver Watch',
    variant: 'Blue • Standard',
    price: 199.99, // Price per item
    originalPrice: null,
    quantity: 2,
    image: 'https://placehold.co/100x100/f0f0f0/333?text=Watch+2',
  },
   {
    id: 5,
    name: 'Sport Diver Watch',
    variant: 'Blue • Standard',
    price: 199.99, // Price per item
    originalPrice: null,
    quantity: 2,
    image: 'https://placehold.co/100x100/f0f0f0/333?text=Watch+2',
  },
  
];

/**
 * CartItem Component
 * Renders a single item in the shopping cart.
 */
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    } else {
      onRemove(item.id); // Or just disable button, depends on UX choice
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };
  
  // Calculate total price for this item based on quantity
  const itemTotalPrice = (item.price * item.quantity).toFixed(2);

  return (
    <div className="flex space-x-4">
      {/* Item Image */}
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 rounded-lg bg-gray-100 object-cover"
        onError={(e) => {
          e.target.src = 'https://placehold.co/100x100/f0f0f0/999?text=Image';
        }}
      />
      
      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-white truncate">{item.name}</h3>
            <p className="text-sm text-gray-400">{item.variant}</p>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0 ml-2"
            aria-label="Remove item"
          >
            <TrashIcon />
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          {/* Quantity Selector */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDecrease}
              className="w-6 h-6 flex items-center justify-center bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              aria-label="Decrease quantity"
            >
              <MinusIcon />
            </button>
            <span className="font-medium text-sm w-5 text-center">{item.quantity}</span>
            <button
              onClick={handleIncrease}
              className="w-6 h-6 flex items-center justify-center bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              aria-label="Increase quantity"
            >
              <PlusIcon />
            </button>
          </div>
          
          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-white">₹{itemTotalPrice}</p>
            {item.originalPrice && (
              <p className="text-sm text-gray-500 line-through">
                ₹{(item.originalPrice * item.quantity).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main App Component
 * Renders the entire shopping cart UI.
 */
export default function ShoppingCartNav() {
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);

  // --- State Calculation ---
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [_itemCount, setItemCount] = useState(0);
  
  const shippingCost = 0; // "Free"

  // Recalculate totals whenever cartItems changes
  useEffect(() => {
    let newSubtotal = 0;
    let newItemCount = 0;
    
    cartItems.forEach(item => {
      newSubtotal += item.price * item.quantity;
      newItemCount += item.quantity;
    });
    
    setSubtotal(newSubtotal);
    setTotal(newSubtotal + shippingCost);
    setItemCount(newItemCount); // Note: The badge in the UI says "3 items", which is cartItems.length. 
                                // I'll use cartItems.length to match the UI, but itemCount is also available.
  }, [cartItems]);

  // --- Event Handlers ---

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems(currentItems =>
      currentItems.filter(item => item.id !== id)
    );
  };

  return (
    // Outer container to center the cart
    <div className="bg-gray-950 text-gray-100 font-sans py-4 flex justify-center items-start min-h-screen w-[368px] flex flex-col">
      
      {/* Cart Container */}
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl shadow-lg p-6 mt-[55px] ">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-white">Your Cart</h1>
          <span className="bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full  absolute top-[34px] right-[70px]">
            {cartItems.length} items
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-6">Review your items before checkout.</p>
        
        {/* Item List */}
        <div className="space-y-6 max-h-[320px] overflow-y-auto pr-2 no-scrollbar">
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))
          ) : (
            <p className="text-gray-200 font-bold text-center text-2xl py-4">Your cart is empty.</p>
          )}
        </div>
        
        {/* Summary Section */}
        {cartItems.length > 0 && (
          <>
            <div className="mt-8 pt-3 border-t border-gray-700 space-y-1">
              <div className="flex justify-between text-sm">
                <p className="text-gray-400 font-bold">Subtotal</p>
                <p className="font-medium text-white">₹{subtotal.toFixed(2)}</p>
              </div>
            </div>
            
            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-base font-bold text-white">
                <p>Total</p>
                <p>₹{total.toFixed(2)}</p>
              </div>
            </div>

            
            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors">
                <CreditCardIcon />
                <span>Checkout</span>
              </button>

           
            </div>
          </>
        )}
      </div>
    </div>
  );
}
