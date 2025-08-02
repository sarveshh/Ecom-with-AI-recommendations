'use client';

import { useState } from 'react';
import { FaEnvelope, FaUser, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface NewsletterSignupProps {
  variant?: 'inline' | 'popup' | 'sidebar';
  onSuccess?: () => void;
}

export default function NewsletterSignup({ variant = 'inline', onSuccess }: NewsletterSignupProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    newsletter: true,
    promotions: true,
    productUpdates: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.startsWith('pref_')) {
        const prefName = name.replace('pref_', '');
        setPreferences(prev => ({ ...prev, [prefName]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: variant,
          preferences
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setFormData({ email: '', firstName: '', lastName: '' });
        onSuccess?.();
        
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(result.message || 'Subscription failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`text-center ${variant === 'popup' ? 'p-6' : 'p-4'}`}>
        <div className="flex justify-center mb-4">
          <FaCheckCircle color="#10B981" size={48} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Thank you for subscribing!
        </h3>
        <p className="text-gray-600">
          Check your email for a confirmation message.
        </p>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6 mb-8">
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Stay Updated
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Get the latest products and exclusive offers delivered to your inbox.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <FaTimesCircle color="#DC2626" size={16} />
              <span className="text-red-800 text-sm ml-2">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md font-medium text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Joining...' : 'Join'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`${variant === 'popup' ? 'p-6' : 'p-4'}`}>
      <div className="flex justify-center mb-4">
        <FaEnvelope color="#2563EB" size={32} />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
        Join Our Newsletter
      </h3>
      <p className="text-gray-600 text-center mb-6">
        Get exclusive deals, product updates, and more!
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <FaTimesCircle color="#DC2626" size={16} />
          <span className="text-red-800 text-sm ml-2">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Email preferences:</p>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="pref_newsletter"
                checked={preferences.newsletter}
                onChange={handleChange}
                className="mr-2 rounded"
              />
              <span className="text-sm text-gray-600">Weekly newsletter</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="pref_promotions"
                checked={preferences.promotions}
                onChange={handleChange}
                className="mr-2 rounded"
              />
              <span className="text-sm text-gray-600">Special promotions</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="pref_productUpdates"
                checked={preferences.productUpdates}
                onChange={handleChange}
                className="mr-2 rounded"
              />
              <span className="text-sm text-gray-600">Product updates</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        By subscribing, you agree to receive marketing emails. You can unsubscribe at any time.
      </p>
    </div>
  );
}
