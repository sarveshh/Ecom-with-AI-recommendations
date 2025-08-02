import { IProduct } from '@/models/Product';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';

interface ProductCardProps {
  product: IProduct;
  priority?: boolean; // Add priority prop for above-the-fold images
}

const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const viewStartTime = useRef<number>(0);
  const { addItem } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Track user behavior
  const trackBehavior = async (action: string, metadata: any = {}) => {
    try {
      // Generate a session-based user ID (in real app, this would come from auth)
      const userId = sessionStorage.getItem('userId') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('userId', userId);

      const response = await fetch('/api/track-behavior', {
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
            ...metadata
          }
        })
      });

      if (!response.ok) {
        console.warn('Failed to track behavior:', response.statusText);
      }
    } catch (error) {
      console.warn('Error tracking behavior:', error);
    }
  };

  // Track product view using Intersection Observer
  useEffect(() => {
    if (!cardRef.current || hasTrackedView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView) {
            viewStartTime.current = Date.now();
            setHasTrackedView(true);
            
            // Track view after product is visible for 1 second
            setTimeout(() => {
              const timeSpent = Date.now() - viewStartTime.current;
              trackBehavior('view', { timeSpent });
            }, 1000);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of card is visible
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasTrackedView, product._id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Prevent event bubbling
    
    setIsAdding(true);
    
    try {
      // Add to cart using Zustand store
      addItem(product, 1);
      
      // Track cart action for AI recommendations
      await trackBehavior('add_to_cart', {
        action: 'add_to_cart',
        quantity: 1,
        value: product.price
      });
      
      console.log('Added to cart:', product.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      // Reset button state
      setTimeout(() => {
        setIsAdding(false);
      }, 1500);
    }
  };

  return (
    <div ref={cardRef} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative h-48 w-full">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
            
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isAdding 
                  ? 'bg-green-600 text-white cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
              }`}
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              <FaShoppingCart size={14} />
              {isAdding ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
