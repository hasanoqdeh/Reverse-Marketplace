'use client'

// Security Alerts Management Component

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAPI } from '../../lib/adminAPI';
import { usePermissions } from '../../lib/permissions';
import { SecurityAlertsResponse } from '../../lib/adminAPI';
import { formatPhoneNumber } from '../../lib/auth';

export const SecurityAlertsManagement = () => {
  const { api, loading, error, executeRequest, clearError } = useAdminAPI();
  const { hasPermission } = usePermissions();
  
  const [alerts, setAlerts] = useState<SecurityAlertsResponse['alerts']>([]);
  const [summary, setSummary] = useState<SecurityAlertsResponse['summary'] | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    severity: 'ALL',
    status: 'ALL',
    page: 1,
    limit: 20
  });
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [showResolveModal, setShowResolveModal] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  // Fetch security alerts
  const fetchAlerts = useCallback(async () => {
    const result = await executeRequest(() => api.getSecurityAlerts());
    if (result) {
      setAlerts(result.alerts);
      setSummary(result.summary);
      setPagination({
        page: 1,
        limit: 20,
        total: result.alerts.length,
        totalPages: Math.ceil(result.alerts.length / 20)
      });
    }
  }, [api, executeRequest]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Handle alert resolution
  const handleResolveAlert = useCallback(async (alertId: string, resolutionText: string) => {
    const result = await executeRequest(() => api.resolveSecurityAlert(alertId, resolutionText));
    if (result) {
      setShowResolveModal(null);
      setResolution('');
      fetchAlerts(); // Refresh the list
    }
  }, [api, executeRequest, fetchAlerts]);

  // Handle alert selection
  const handleAlertSelection = useCallback((alertId: string, selected: boolean) => {
    setSelectedAlerts(prev => {
      if (selected) {
        return [...prev, alertId];
      } else {
        return prev.filter(id => id !== alertId);
      }
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedAlerts(alerts.map(alert => alert.id));
    } else {
      setSelectedAlerts([]);
    }
  }, [alerts]);

  // Format severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-red-100 text-red-800';
      case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'FALSE_POSITIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasPermission('security:view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access security alerts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Alerts</h1>
        <p className="text-gray-600">Monitor and manage security incidents</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            <div className="text-sm text-gray-600">Total Alerts</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-600">{summary.bySeverity.CRITICAL || 0}</div>
            <div className="text-sm text-red-600">Critical</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{summary.byStatus.INVESTIGATING || 0}</div>
            <div className="text-sm text-yellow-600">Investigating</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{summary.byStatus.RESOLVED || 0}</div>
            <div className="text-sm text-green-600">Resolved</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FALSE_POSITIVE">False Positive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchAlerts}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
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

      {/* Alerts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.length === alerts.length && alerts.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occurred At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    Loading security alerts...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No security alerts found
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.includes(alert.id)}
                        onChange={(e) => handleAlertSelection(alert.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {alert.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {alert.title}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {alert.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {alert.userId ? (
                          <>
                            <div>{alert.phone ? formatPhoneNumber(alert.phone) : 'N/A'}</div>
                            <div className="text-xs text-gray-500">ID: {alert.userId}</div>
                          </>
                        ) : (
                          'System'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {alert.ipAddress || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(alert.occurredAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(alert.occurredAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {alert.status === 'NEW' && hasPermission('security:manage') && (
                          <button
                            onClick={() => setShowResolveModal(alert.id)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => {/* TODO: Show details modal */}}
                          className="text-gray-600 hover:text-gray-900 text-sm"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Alert Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Resolve Security Alert</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                required
                rows={4}
                placeholder="Describe how this alert was resolved..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowResolveModal(null);
                  setResolution('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveAlert(showResolveModal, resolution)}
                disabled={!resolution.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Resolve Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
