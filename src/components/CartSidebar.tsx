'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { FaCreditCard, FaMinus, FaPlus, FaShoppingCart, FaTimes, FaTrash } from 'react-icons/fa';

export default function CartSidebar() {
  const { 
    items, 
    isOpen, 
    totalItems, 
    toggleCart, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getCartSummary,
    loadCartFromStorage 
  } = useCartStore();

  // Load cart from storage on component mount
  useEffect(() => {
    loadCartFromStorage();
  }, [loadCartFromStorage]);

  const summary = getCartSummary();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={toggleCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FaShoppingCart color="#2563eb" />
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              {totalItems > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                  {totalItems}
                </span>
              )}
            </div>
            <button
              onClick={toggleCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes color="#6b7280" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="flex justify-center mb-4">
                  <FaShoppingCart size={48} color="#d1d5db" />
                </div>
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm mt-2">Add some products to get started!</p>
                <Link 
                  href="/"
                  onClick={toggleCart}
                  className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-blue-600 font-semibold">
                        {formatPrice(item.product.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <FaMinus size={12} color="#6b7280" />
                        </button>
                        
                        <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <FaPlus size={12} color="#6b7280" />
                        </button>

                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors ml-2"
                          title="Remove item"
                        >
                          <FaTrash size={12} color="#dc2626" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <button
                  onClick={clearCart}
                  className="w-full text-red-600 hover:text-red-700 text-sm font-medium py-2 border border-red-200 hover:border-red-300 rounded-md transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Footer with Summary and Checkout */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Order Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({summary.itemCount} items)</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(summary.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {summary.shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      formatPrice(summary.shipping)
                    )}
                  </span>
                </div>
                {summary.subtotal < 50 && summary.shipping > 0 && (
                  <div className="text-xs text-gray-600">
                    Add {formatPrice(50 - summary.subtotal)} more for free shipping!
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(summary.total)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2">
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
                  onClick={() => {
                    // TODO: Implement checkout
                    alert('Checkout coming soon! 🚀');
                  }}
                >
                  <FaCreditCard />
                  Checkout - {formatPrice(summary.total)}
                </button>
                
                <Link 
                  href="/"
                  onClick={toggleCart}
                  className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-md font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
