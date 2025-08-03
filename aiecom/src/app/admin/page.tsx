'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaBox, FaChartLine, FaCog, FaEnvelope, FaShoppingCart, FaUsers } from 'react-icons/fa';

interface ProductForm {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
}

export default function AdminPage() {
  const [form, setForm] = useState<ProductForm>({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.price) {
      setMessage({ type: 'error', text: 'Name and price are required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          description: form.description,
          imageUrl: form.imageUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Product created successfully!' });
        setForm({
          name: '',
          price: '',
          description: '',
          imageUrl: '',
        });
      } else {
        throw new Error(data.error || 'Failed to create product');
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <Link 
              href="/" 
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Back to Store
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Analytics */}
          <Link href="/admin/analytics" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <FaChartLine color="#2563EB" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="text-gray-600">View sales & user data</p>
              </div>
            </div>
          </Link>

          {/* Products */}
          <div 
            onClick={() => setShowProductForm(!showProductForm)}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <FaBox color="#059669" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                <p className="text-gray-600">Manage inventory</p>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <FaShoppingCart color="#7C3AED" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
                <p className="text-gray-600">View & process orders</p>
              </div>
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                <FaUsers color="#D97706" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
                <p className="text-gray-600">Manage users</p>
              </div>
            </div>
          </div>

          {/* Email Marketing */}
          <Link href="/admin/email" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                <FaEnvelope color="#DC2626" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Email Marketing</h3>
                <p className="text-gray-600">Campaigns & newsletters</p>
              </div>
            </div>
          </Link>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                <FaCog color="#6B7280" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <p className="text-gray-600">System configuration</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database Connection</span>
              <span className="flex items-center text-green-600 font-medium">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ML Recommendation Engine</span>
              <span className="flex items-center text-green-600 font-medium">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Gateway</span>
              <span className="flex items-center text-green-600 font-medium">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Product Form (conditional) */}
        {showProductForm && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
            
            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              {form.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={form.imageUrl} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-md border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-md font-medium text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (confirm('This will add sample products to your database. Continue?')) {
                  // You can implement a call to your seed API here
                  alert('Sample products feature coming soon!');
                }
              }}
              className="w-full text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md p-4 transition-colors"
            >
              <div className="font-medium text-blue-900">Add Sample Products</div>
              <div className="text-sm text-blue-600">Populate your store with demo products</div>
            </button>
            
            <Link
              href="/api/products"
              target="_blank"
              className="block w-full text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-md p-4 transition-colors"
            >
              <div className="font-medium text-green-900">View Products API</div>
              <div className="text-sm text-green-600">Check the products API endpoint</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
