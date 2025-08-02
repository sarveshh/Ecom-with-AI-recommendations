import { encryptedStorage } from '@/lib/encryptedStorage';
import { IProduct } from '@/models/Product';
import { create } from 'zustand';

export interface CartItem {
  product: IProduct;
  quantity: number;
  addedAt: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  
  // Actions
  addItem: (product: IProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  loadCartFromStorage: () => void;
  
  // Getters
  getCartSummary: () => {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    itemCount: number;
  };
}

const CART_STORAGE_KEY = 'aiecom-shopping-cart';
const TAX_RATE = 0.08; // 8% tax
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5.99;

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,

  addItem: (product: IProduct, quantity = 1) => {
    const currentItems = get().items;
    const existingItemIndex = currentItems.findIndex(item => item.product._id === product._id);

    let newItems: CartItem[];

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      newItems = currentItems.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Add new item
      const newItem: CartItem = {
        product,
        quantity,
        addedAt: new Date().toISOString()
      };
      newItems = [...currentItems, newItem];
    }

    // Calculate totals
    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Update state
    set({
      items: newItems,
      totalItems,
      totalPrice
    });

    // Save to encrypted storage
    encryptedStorage.setItem(CART_STORAGE_KEY, newItems);

    // Track behavior for AI recommendations
    trackCartBehavior('add_to_cart', product, quantity);
  },

  removeItem: (productId: string) => {
    const currentItems = get().items;
    const newItems = currentItems.filter(item => item.product._id !== productId);

    // Calculate totals
    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Update state
    set({
      items: newItems,
      totalItems,
      totalPrice
    });

    // Save to encrypted storage
    encryptedStorage.setItem(CART_STORAGE_KEY, newItems);

    // Track behavior
    const removedItem = currentItems.find(item => item.product._id === productId);
    if (removedItem) {
      trackCartBehavior('remove_from_cart', removedItem.product, removedItem.quantity);
    }
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const currentItems = get().items;
    const newItems = currentItems.map(item =>
      item.product._id === productId
        ? { ...item, quantity }
        : item
    );

    // Calculate totals
    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Update state
    set({
      items: newItems,
      totalItems,
      totalPrice
    });

    // Save to encrypted storage
    encryptedStorage.setItem(CART_STORAGE_KEY, newItems);
  },

  clearCart: () => {
    set({
      items: [],
      totalItems: 0,
      totalPrice: 0
    });

    // Clear encrypted storage
    encryptedStorage.removeItem(CART_STORAGE_KEY);
  },

  toggleCart: () => {
    set(state => ({ isOpen: !state.isOpen }));
  },

  loadCartFromStorage: () => {
    try {
      const storedItems = encryptedStorage.getItem(CART_STORAGE_KEY) || [];
      
      // Validate stored items
      const validItems = storedItems.filter((item: any) => 
        item && 
        item.product && 
        item.product._id && 
        typeof item.quantity === 'number' && 
        item.quantity > 0
      );

      // Calculate totals
      const totalItems = validItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      const totalPrice = validItems.reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0);

      set({
        items: validItems,
        totalItems,
        totalPrice
      });
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      // If there's an error, start with empty cart
      set({
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
    }
  },

  getCartSummary: () => {
    const { totalPrice, totalItems } = get();
    
    const subtotal = totalPrice;
    const tax = subtotal * TAX_RATE;
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total,
      itemCount: totalItems
    };
  }
}));

// Helper function to track cart behavior for AI recommendations
const trackCartBehavior = async (action: string, product: IProduct, quantity: number) => {
  try {
    const userId = sessionStorage.getItem('userId') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('userId', userId);

    await fetch('/api/track-behavior', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action,
        productId: product._id,
        metadata: {
          category: product.category || 'unknown',
          price: product.price,
          brand: product.brand || 'unknown',
          quantity,
          cartValue: product.price * quantity
        }
      })
    });
  } catch (error) {
    console.warn('Error tracking cart behavior:', error);
  }
};
