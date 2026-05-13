'use client'

// Admin Dashboard with Backend Integration

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAPI } from '../../lib/adminAPI';
import { usePermissions } from '../../lib/permissions';
import { DashboardMetricsResponse, SecurityAlertsResponse } from '../../lib/adminAPI';

export const AdminDashboard = () => {
  const { api, loading, error, executeRequest } = useAdminAPI();
  const { hasPermission, adminLevel, menuItems } = usePermissions();
  
  const [metrics, setMetrics] = useState<DashboardMetricsResponse['metrics'] | null>(null);
  const [trends, setTrends] = useState<DashboardMetricsResponse['trends'] | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlertsResponse['alerts']>([]);
  const [alertSummary, setAlertSummary] = useState<SecurityAlertsResponse['summary'] | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    const [metricsResult, alertsResult] = await Promise.all([
      executeRequest(() => api.getDashboardMetrics()),
      executeRequest(() => api.getSecurityAlerts())
    ]);

    if (metricsResult) {
      setMetrics(metricsResult.metrics);
      setTrends(metricsResult.trends);
    }

    if (alertsResult) {
      setSecurityAlerts(alertsResult.alerts.slice(0, 5)); // Show only top 5 alerts
      setAlertSummary(alertsResult.summary);
    }
  }, [api, executeRequest]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Handle alert resolution
  const handleResolveAlert = useCallback(async (alertId: string, resolution: string) => {
    const result = await executeRequest(() => api.resolveSecurityAlert(alertId, resolution));
    if (result) {
      fetchDashboardData(); // Refresh data
    }
  }, [api, executeRequest, fetchDashboardData]);


  if (!hasPermission('dashboard:view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the dashboard.</p>
          <p className="text-xs text-gray-500 mt-2">Admin Level: {adminLevel || 'null'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {adminLevel === 'SUPER_ADMIN' ? 'Super Admin' : adminLevel || 'Admin'}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="text-red-500 hover:text-red-700">
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* User Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <div className="p-2 bg-blue-100 rounded-full">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.users.total.toLocaleString()}</div>
            <div className="text-sm text-gray-600">
              +{metrics.users.newToday} today, +{metrics.users.newThisWeek} this week
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
              <div className="p-2 bg-green-100 rounded-full">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.users.active.toLocaleString()}</div>
            <div className="text-sm text-gray-600">
              {((metrics.users.active / metrics.users.total) * 100).toFixed(1)}% of total users
            </div>
          </div>

          {/* Authentication Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Login Success Rate</h3>
              <div className="p-2 bg-purple-100 rounded-full">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.authentication.loginAttemptsToday > 0 
                ? ((metrics.authentication.successfulLoginsToday / metrics.authentication.loginAttemptsToday) * 100).toFixed(1)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">
              {metrics.authentication.successfulLoginsToday} of {metrics.authentication.loginAttemptsToday} attempts
            </div>
          </div>

          {/* Security Alerts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Security Alerts</h3>
              <div className="p-2 bg-red-100 rounded-full">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{alertSummary?.total || 0}</div>
            <div className="text-sm text-gray-600">
              {alertSummary?.bySeverity?.HIGH || 0} high, {alertSummary?.bySeverity?.MEDIUM || 0} medium
            </div>
          </div>
        </div>
      )}

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Registration Chart */}
        {trends && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Registrations (Last 7 Days)</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {trends.userRegistrations.slice(-7).map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${Math.max((data.count / Math.max(...trends.userRegistrations.map(d => d.count))) * 100, 5)}%` 
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-2">
                    {new Date(data.date).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div className="text-xs font-medium">{data.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Login Activity Chart */}
        {trends && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Activity (Last 7 Days)</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {trends.loginActivity.slice(-7).map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="flex space-x-1 w-full">
                    <div 
                      className="bg-green-500 rounded-t"
                      style={{ 
                        height: `${Math.max((data.successful / Math.max(...trends.loginActivity.map(d => d.successful + d.failed))) * 100, 5)}%` 
                      }}
                    />
                    <div 
                      className="bg-red-500 rounded-t"
                      style={{ 
                        height: `${Math.max((data.failed / Math.max(...trends.loginActivity.map(d => d.successful + d.failed))) * 100, 5)}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    {new Date(data.date).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div className="text-xs font-medium">{data.successful + data.failed}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Successful</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Failed</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Distribution */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Users by Role */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
            <div className="space-y-3">
              {Object.entries(metrics.users.byRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      role === 'ADMIN' ? 'bg-purple-500' :
                      role === 'MERCHANT' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm text-gray-700">{role}</span>
                  </div>
                  <div className="text-sm font-medium">{count.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Users by Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Status</h3>
            <div className="space-y-3">
              {Object.entries(metrics.users.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      status === 'ACTIVE' ? 'bg-green-500' :
                      status === 'PENDING' ? 'bg-yellow-500' :
                      status === 'SUSPENDED' ? 'bg-orange-500' :
                      status === 'BANNED' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm text-gray-700">{status}</span>
                  </div>
                  <div className="text-sm font-medium">{count.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Uptime</span>
                <span className="text-sm font-medium">{metrics.system.uptime.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">API Response Time</span>
                <span className="text-sm font-medium">{metrics.system.apiResponseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">DB Connections</span>
                <span className="text-sm font-medium">{metrics.system.databaseConnections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Error Rate</span>
                <span className="text-sm font-medium">{(metrics.system.errorRate * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Security Alerts */}
      {hasPermission('security:view') && securityAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Security Alerts</h3>
            <button
              onClick={() => window.location.href = '/admin/security'}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="border-l-4 border-gray-200 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        alert.severity === 'CRITICAL' ? 'bg-red-500' :
                        alert.severity === 'HIGH' ? 'bg-orange-500' :
                        alert.severity === 'MEDIUM' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {alert.occurredAt && new Date(alert.occurredAt).toLocaleString()}
                      {alert.ipAddress && ` • IP: ${alert.ipAddress}`}
                    </div>
                  </div>
                  {hasPermission('security:manage') && alert.status === 'NEW' && (
                    <button
                      onClick={() => handleResolveAlert(alert.id, 'Resolved from dashboard')}
                      className="ml-4 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hasPermission('user:view') && (
            <button
              onClick={() => window.location.href = '/admin/users'}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-medium text-gray-900">Manage Users</span>
              </div>
              <p className="text-sm text-gray-600">View and manage user accounts</p>
            </button>
          )}

          {hasPermission('security:view') && (
            <button
              onClick={() => window.location.href = '/admin/security'}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium text-gray-900">Security Center</span>
              </div>
              <p className="text-sm text-gray-600">Monitor security alerts and logs</p>
            </button>
          )}

          {hasPermission('audit:view') && (
            <button
              onClick={() => window.location.href = '/admin/audit'}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium text-gray-900">Audit Logs</span>
              </div>
              <p className="text-sm text-gray-600">View system audit trail</p>
            </button>
          )}

          {hasPermission('analytics:view') && (
            <button
              onClick={() => window.location.href = '/admin/analytics'}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium text-gray-900">Analytics</span>
              </div>
              <p className="text-sm text-gray-600">View detailed analytics</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
