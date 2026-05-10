'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  Activity,
  ShoppingCart,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { apiService, API_ENDPOINTS } from '@/services/api';
import { MarketplaceAnalytics } from '@/types';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<MarketplaceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiService.get<MarketplaceAnalytics>(API_ENDPOINTS.ANALYTICS.OVERVIEW);
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Marketplace Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Real-time marketplace metrics and performance indicators
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Users */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-admin-600 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics?.activeUsers.toLocaleString() || '0'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-green-600">+12%</span> from last month
            </div>
          </div>
        </div>

        {/* Active Requests */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-success-600 rounded-md p-3">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Requests</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics?.activeRequests.toLocaleString() || '0'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-green-600">+8%</span> from last week
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-warning-600 rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics?.conversionRate ? `${(analytics.conversionRate * 100).toFixed(1)}%` : '0%'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-green-600">+2.3%</span> improvement
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-600 rounded-md p-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${analytics?.totalRevenue ? analytics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-green-600">+18%</span> from last month
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Revenue chart will be displayed here</p>
              <p className="text-sm">Daily, Monthly, Yearly breakdown</p>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
          <div className="space-y-3">
            {analytics?.categoryTrends?.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-admin-600 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">
                    {category.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {category.count} requests
                  </p>
                  <p className="text-xs text-gray-500">
                    {category.growth > 0 ? '+' : ''}{category.growth.toFixed(1)}%
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Geographic Heatmap */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics?.geographicData?.map((location, index) => (
            <div key={location.location} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Eye className="h-4 w-4 text-gray-600 mr-2" />
                <h4 className="text-sm font-medium text-gray-900">{location.location}</h4>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requests:</span>
                  <span className="font-medium">{location.requestCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bids:</span>
                  <span className="font-medium">{location.bidCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Bid:</span>
                  <span className="font-medium">${location.averageBidPrice?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          )) || (
            <div className="col-span-full text-center text-gray-500 py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No geographic data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">All Systems Operational</p>
              <p className="text-xs text-green-600">No active issues</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">High Bid Volume</p>
              <p className="text-xs text-yellow-600">Monitoring for fraud</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Peak Hours Active</p>
              <p className="text-xs text-blue-600">9AM - 6PM local time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
