'use client'

// Analytics Dashboard Component

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAPI } from '../../lib/adminAPI';
import { usePermissions } from '../../lib/permissions';
import { DashboardMetricsResponse } from '../../lib/adminAPI';

export const AnalyticsDashboard = () => {
  const { api, loading, error, executeRequest, clearError } = useAdminAPI();
  const { hasPermission } = usePermissions();
  
  const [metrics, setMetrics] = useState<DashboardMetricsResponse['metrics'] | null>(null);
  const [trends, setTrends] = useState<DashboardMetricsResponse['trends'] | null>(null);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    const result = await executeRequest(() => api.getDashboardMetrics());
    if (result) {
      setMetrics(result.metrics);
      setTrends(result.trends);
    }
  }, [api, executeRequest]);

  useEffect(() => {
    fetchAnalytics();
    
    // Set up auto-refresh every 60 seconds for analytics
    const interval = setInterval(fetchAnalytics, 60000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Format trend data for charts
  const formatTrendData = (trendData: any[]) => {
    return trendData.map(item => ({
      date: item.date,
      value: item.count
    }));
  };

  // Calculate growth percentage
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (!hasPermission('analytics:view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Detailed analytics and insights for platform performance</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        </div>
      )}

      {metrics && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* User Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.users.total}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="font-medium text-green-600">{metrics.users.active}</div>
                    <div className="text-gray-600">Active</div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-600">{metrics.users.newToday}</div>
                    <div className="text-gray-600">New Today</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Authentication</h3>
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.authentication.successfulLoginsToday}</div>
                  <div className="text-sm text-gray-600">Successful Logins Today</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="font-medium text-orange-600">{metrics.authentication.failedLoginsToday}</div>
                    <div className="text-gray-600">Failed</div>
                  </div>
                  <div>
                    <div className="font-medium text-purple-600">{metrics.authentication.otpSentToday}</div>
                    <div className="text-gray-600">OTP Sent</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.security.suspiciousActivities}</div>
                  <div className="text-sm text-gray-600">Suspicious Activities</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="font-medium text-red-600">{metrics.security.blockedIPs}</div>
                    <div className="text-gray-600">Blocked IPs</div>
                  </div>
                  <div>
                    <div className="font-medium text-orange-600">{metrics.security.lockedAccounts}</div>
                    <div className="text-gray-600">Locked Accounts</div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">System</h3>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.system.uptime}%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="font-medium text-green-600">{metrics.system.apiResponseTime}ms</div>
                    <div className="text-gray-600">API Response</div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-600">{metrics.system.databaseConnections}</div>
                    <div className="text-gray-600">DB Connections</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {trends && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* User Registrations Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Registrations</h3>
                <div className="h-64 flex items-center justify-center border border-gray-200 rounded">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-600">Chart visualization would go here</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {trends.userRegistrations.length} data points
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Registrations:</span>
                    <span className="font-medium">
                      {trends.userRegistrations.reduce((sum, item) => sum + item.count, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Login Activity Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Activity</h3>
                <div className="h-64 flex items-center justify-center border border-gray-200 rounded">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600">Chart visualization would go here</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {trends.loginActivity.length} data points
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Successful Logins:</span>
                    <span className="font-medium text-green-600">
                      {trends.loginActivity.reduce((sum, item) => sum + item.successful, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Logins:</span>
                    <span className="font-medium text-red-600">
                      {trends.loginActivity.reduce((sum, item) => sum + item.failed, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
              <div className="space-y-3">
                {Object.entries(metrics.users.byRole).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{role}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Status</h3>
              <div className="space-y-3">
                {Object.entries(metrics.users.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className={`font-medium ${
                    metrics.system.errorRate < 1 ? 'text-green-600' : 
                    metrics.system.errorRate < 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metrics.system.errorRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Sessions</span>
                  <span className="font-medium text-gray-900">{metrics.security.activeAdminSessions}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {loading && !metrics && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      )}
    </div>
  );
};
