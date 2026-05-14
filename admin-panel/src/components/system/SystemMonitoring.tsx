'use client'

// System Monitoring Component

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAPI } from '../../lib/adminAPI';
import { usePermissions } from '../../lib/permissions';

export const SystemMonitoring = () => {
  const { api, loading, error, executeRequest, clearError } = useAdminAPI();
  const { hasPermission } = usePermissions();
  
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch system health
  const fetchSystemHealth = useCallback(async () => {
    const result = await executeRequest(() => api.healthCheck());
    if (result) {
      setSystemHealth(result);
    }
  }, [api, executeRequest]);

  useEffect(() => {
    fetchSystemHealth();
    
    // Set up auto-refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 30000);
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    }
  }, [fetchSystemHealth, autoRefresh]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': case 'ok': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!hasPermission('system:monitor')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access system monitoring.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Monitoring</h1>
        <p className="text-gray-600">Real-time system health and performance monitoring</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={fetchSystemHealth}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded border-gray-300 mr-2"
          />
          <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
        </label>
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

      {systemHealth && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall System Status</h2>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full font-medium ${getStatusColor(systemHealth.status)}`}>
                {systemHealth.status?.toUpperCase() || 'UNKNOWN'}
              </div>
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemHealth.services && Object.entries(systemHealth.services).map(([service, status]: [string, any]) => (
                <div key={service} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 capitalize">{service}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status.status)}`}>
                      {status.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {status.uptime && (
                      <div>Uptime: {status.uptime}</div>
                    )}
                    {status.responseTime && (
                      <div>Response: {status.responseTime}ms</div>
                    )}
                    {status.memory && (
                      <div>Memory: {status.memory}</div>
                    )}
                    {status.error && (
                      <div className="text-red-600">Error: {status.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">CPU Usage</h3>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {systemHealth.performance?.cpu || 'N/A'}%
              </div>
              <div className="text-sm text-gray-600">Current Usage</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Memory Usage</h3>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {systemHealth.performance?.memory || 'N/A'}%
              </div>
              <div className="text-sm text-gray-600">Current Usage</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Disk Usage</h3>
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {systemHealth.performance?.disk || 'N/A'}%
              </div>
              <div className="text-sm text-gray-600">Current Usage</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Network I/O</h3>
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {systemHealth.performance?.network || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">MB/s</div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent System Events</h2>
            <div className="space-y-3">
              {systemHealth.events?.slice(0, 5).map((event: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(event.severity)}`}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">{event.description}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  No recent events
                </div>
              )}
            </div>
          </div>

          {/* Logs Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Logs</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
              {systemHealth.logs?.slice(0, 10).map((log: string, index: number) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              )) || (
                <div className="text-gray-400">
                  No logs available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !systemHealth && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading system health...</p>
          </div>
        </div>
      )}
    </div>
  );
};
