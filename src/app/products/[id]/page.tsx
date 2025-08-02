'use client';

import ProductCard from '@/components/ProductCard';
import { IProduct } from '@/models/Product';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';

interface ApiResponse {
  success: boolean;
  data: IProduct;
}

interface RecommendationsResponse {
  success: boolean;
  recommendations: string[];
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [recommendations, setRecommendations] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const { addItem } = useCartStore();

  // Track user behavior
  const trackBehavior = async (action: string, metadata: any = {}) => {
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
          productId: productId,
          metadata: {
            category: product?.category || 'unknown',
            price: product?.price || 0,
            brand: product?.brand || 'unknown',
            ...metadata
          }
        })
      });
    } catch (error) {
      console.warn('Error tracking behavior:', error);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data: ApiResponse = await response.json();
        
        if (data.success) {
          setProduct(data.data);
          
          // Track product view
          setTimeout(() => {
            trackBehavior('view', { timeSpent: 2000 });
          }, 2000);
          
          // Fetch recommendations after product is loaded
          fetchRecommendations();
        } else {
          throw new Error('Product not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true);
        const userId = sessionStorage.getItem('userId') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('userId', userId);

        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            purchaseHistory: [productId], // Include current product in history for content-based recommendations
            numRecommendations: 4
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.recommendations) {
            // Fetch full product details for recommendations
            const recommendedProducts = await Promise.all(
              data.recommendations.map(async (recommendedProductId: string) => {
                try {
                  // Don't recommend the current product
                  if (recommendedProductId === productId) return null;
                  
                  const productResponse = await fetch(`/api/products/${recommendedProductId}`);
                  if (productResponse.ok) {
                    const productData = await productResponse.json();
                    return productData.success ? productData.data : null;
                  }
                  return null;
                } catch {
                  return null;
                }
              })
            );
            
            const validRecommendations = recommendedProducts.filter(Boolean);
            setRecommendations(validRecommendations);
          }
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link 
            href="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Products
          </Link>
        </nav>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="relative h-96 lg:h-[500px]">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                  <span className="text-gray-400 text-lg">No Image Available</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              <div className="text-4xl font-bold text-blue-600 mb-6">
                {formatPrice(product.price)}
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="space-y-4">
                <button 
                  className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-md font-medium text-lg transition-all duration-200 ${
                    isAddingToCart 
                      ? 'bg-green-600 text-white cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                  }`}
                  onClick={async () => {
                    if (isAddingToCart) return;
                    
                    setIsAddingToCart(true);
                    
                    try {
                      // Add to cart using Zustand store
                      addItem(product, 1);
                      
                      // Track add to cart behavior
                      await trackBehavior('add_to_cart', {
                        action: 'add_to_cart',
                        quantity: 1,
                        value: product.price
                      });
                      
                      console.log('Added to cart:', product.name);
                    } catch (error) {
                      console.error('Error adding to cart:', error);
                    } finally {
                      setTimeout(() => {
                        setIsAddingToCart(false);
                      }, 1500);
                    }
                  }}
                  disabled={isAddingToCart}
                >
                  <FaShoppingCart size={20} />
                  {isAddingToCart ? 'Added to Cart!' : 'Add to Cart'}
                </button>
                
                <button 
                  className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-md font-medium text-lg transition-all duration-200 ${
                    isAddingToWishlist 
                      ? 'bg-pink-600 text-white cursor-not-allowed' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:scale-105'
                  }`}
                  onClick={async () => {
                    if (isAddingToWishlist) return;
                    
                    setIsAddingToWishlist(true);
                    
                    try {
                      // Track wishlist behavior
                      await trackBehavior('add_to_wishlist', {
                        action: 'add_to_wishlist'
                      });
                      
                      console.log('Added to wishlist:', product.name);
                      // TODO: Implement actual wishlist functionality
                    } catch (error) {
                      console.error('Error adding to wishlist:', error);
                    } finally {
                      setTimeout(() => {
                        setIsAddingToWishlist(false);
                      }, 1500);
                    }
                  }}
                  disabled={isAddingToWishlist}
                >
                  <FaHeart size={18} />
                  {isAddingToWishlist ? 'Added to Wishlist!' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Product Meta */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Product ID:</span> {product._id}
                  </div>
                  <div>
                    <span className="font-medium">Added:</span> {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Powered Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🤖 You Might Also Like
          </h2>
          
          {loadingRecommendations ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Finding perfect recommendations for you...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((recommendedProduct) => (
                <ProductCard 
                  key={recommendedProduct._id} 
                  product={recommendedProduct} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600">
                🔍 No recommendations available yet. Browse more products to get personalized AI recommendations!
              </p>
              <Link 
                href="/" 
                className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
