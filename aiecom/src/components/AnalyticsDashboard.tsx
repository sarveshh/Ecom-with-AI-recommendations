'use client';

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import {
    FaCalendarAlt,
    FaDollarSign,
    FaDownload,
    FaEye,
    FaShoppingCart,
    FaUsers
} from 'react-icons/fa';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface AnalyticsOverview {
  totalUsers: number;
  totalSessions: number;
  totalPageViews: number;
  totalAddToCarts: number;
  totalRevenue: number;
  conversionRate: string;
  averageSessionValue: string;
}

interface DailyData {
  _id: string;
  events: Array<{
    event: string;
    count: number;
    value: number;
  }>;
}

interface TopProduct {
  productId: string;
  views: number;
  uniqueUsers: number;
}

interface FunnelData {
  event: string;
  count: number;
  uniqueUsers: number;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  dailyData: DailyData[];
  topProducts: TopProduct[];
  funnelData: FunnelData[];
  dateRange: {
    start: string;
    end: string;
  };
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        throw new Error(result.message || 'Failed to load analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Process daily data for charts
  const processedDailyData = data?.dailyData.map(day => {
    const dayData: any = { date: format(new Date(day._id), 'MMM dd') };
    
    day.events.forEach(event => {
      dayData[event.event] = event.count;
      if (event.event === 'purchase') {
        dayData.revenue = event.value;
      }
    });
    
    return dayData;
  }) || [];

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Analytics Data</h1>
          <p className="text-gray-600">No analytics data available for the selected period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">
              Data from {format(new Date(data.dateRange.start), 'MMM dd, yyyy')} to {format(new Date(data.dateRange.end), 'MMM dd, yyyy')}
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <FaCalendarAlt color="#6B7280" />
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            
            {/* Export Button */}
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
              <FaDownload size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <FaUsers color="#2563EB" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <FaEye color="#059669" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.totalPageViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                <FaShoppingCart color="#D97706" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Add to Cart</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.totalAddToCarts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <FaDollarSign color="#7C3AED" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.overview.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversion Rate</h3>
            <p className="text-3xl font-bold text-green-600">{data.overview.conversionRate}%</p>
            <p className="text-sm text-gray-600 mt-1">Cart to purchase conversion</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg. Session Value</h3>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(parseFloat(data.overview.averageSessionValue))}</p>
            <p className="text-sm text-gray-600 mt-1">Revenue per session</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sessions</h3>
            <p className="text-3xl font-bold text-purple-600">{data.overview.totalSessions.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">Total user sessions</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Activity Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedDailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="view" stroke="#3B82F6" strokeWidth={2} name="Views" />
                <Line type="monotone" dataKey="add_to_cart" stroke="#10B981" strokeWidth={2} name="Add to Cart" />
                <Line type="monotone" dataKey="purchase" stroke="#F59E0B" strokeWidth={2} name="Purchases" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processedDailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row: Top Products & Event Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Views</h3>
            <div className="space-y-4">
              {data.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Product {product.productId.slice(-6)}</p>
                      <p className="text-sm text-gray-600">{product.uniqueUsers} unique viewers</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{product.views}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Event Funnel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Journey Funnel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.funnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="event" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" name="Total Events" />
                <Bar dataKey="uniqueUsers" fill="#10B981" name="Unique Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
