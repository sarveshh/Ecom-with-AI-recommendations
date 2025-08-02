'use client';

import ProductCard from '@/components/ProductCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { IProduct } from '@/models/Product';
import { useEffect, useState } from 'react';

interface ApiResponse {
  success: boolean;
  data: IProduct[];
  count: number;
}

export default function Home() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [recommendations, setRecommendations] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data: ApiResponse = await response.json();
        
        if (data.success) {
          setProducts(data.data);
          
          // Fetch recommendations after products are loaded
          fetchRecommendations();
        } else {
          throw new Error('API returned error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true);
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'demo_user_' + Math.random().toString(36).substr(2, 9),
            purchaseHistory: [],
            numRecommendations: 4
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.recommendations) {
            // Fetch full product details for recommendations
            const recommendedProducts = await Promise.all(
              data.recommendations.map(async (productId: string) => {
                try {
                  const productResponse = await fetch(`/api/products/${productId}`);
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

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            AI-Powered E-Commerce Store
          </h1>
          <p className="mt-2 text-gray-600">
            Discover amazing products with personalized recommendations
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Newsletter Signup */}
        <NewsletterSignup variant="inline" />

        {/* AI Recommendations Section */}
        {recommendations.length > 0 && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100 mb-6">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900">
                  Real AI-Powered Recommendations
                </h2>
              </div>
              <p className="text-gray-600">
                Our machine learning system analyzes your behavior patterns and uses collaborative filtering 
                to suggest products you'll love.
              </p>
            </div>
            
            {loadingRecommendations ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((product, index) => (
                  <ProductCard 
                    key={`rec-${product._id}`} 
                    product={product} 
                    priority={index < 2}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Featured Products Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {recommendations.length > 0 ? 'All Products' : 'Featured Products'}
          </h2>
          
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">Error: {error}</p>
              <p className="text-red-600 text-sm mt-2">
                Make sure your MongoDB connection is properly configured.
              </p>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">
                No products found. Add some products to get started!
              </p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  priority={index < 4 && recommendations.length === 0} // Only prioritize if no recommendations shown
                />
              ))}
            </div>
          )}
        </section>

        {/* AI-Powered Recommendations Info Section - only show if no recommendations loaded */}
        {recommendations.length === 0 && !loadingRecommendations && (
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              AI-Powered Recommendations
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">
                  Advanced Machine Learning Engine
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Our AI uses real machine learning algorithms including collaborative filtering (Matrix Factorization), 
                content-based filtering (TF-IDF), and behavioral analysis to provide personalized recommendations.
              </p>
              <div className="bg-white rounded-md p-4 border border-gray-200">
                <p className="text-sm text-gray-500 italic">
                  🤖 ML recommendations will appear above once you interact with products. 
                  The system learns from your views, cart additions, and preferences to improve suggestions over time!
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
