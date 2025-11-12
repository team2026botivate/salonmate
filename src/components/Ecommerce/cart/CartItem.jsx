import React, { useState } from 'react';
import { TrashIcon, MinusIcon, PlusIcon } from './icons';


const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [showFullName, setShowFullName] = useState(false);

  const handleDecrease = () => {
    if (item.quantity > 1) onUpdateQuantity(item.id, item.quantity - 1);
    else onRemove(item.id);
  };
  const handleIncrease = () => onUpdateQuantity(item.id, item.quantity + 1);

  const itemTotalPrice = (item.product_id.price * item.quantity).toFixed(2);

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
            <h3 className="leading-snug font-semibold text-white">{displayName}</h3>
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

export default CartItem;