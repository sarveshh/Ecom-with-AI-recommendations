'use client';

import { useCartStore } from '@/store/cartStore';
import { useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';

export default function CartButton() {
  const { totalItems, toggleCart, loadCartFromStorage } = useCartStore();

  // Load cart from storage on component mount
  useEffect(() => {
    loadCartFromStorage();
  }, [loadCartFromStorage]);

  return (
    <button
      onClick={toggleCart}
      className="relative p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105"
      title="View Cart"
    >
      <FaShoppingCart size={20} />
      
      {/* Cart Item Count Badge */}
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
}
