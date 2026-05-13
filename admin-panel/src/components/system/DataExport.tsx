'use client';

// Data Export Component

import React, { useState, useCallback } from 'react';
import { useAdminAPI } from '../../lib/adminAPI';
import { usePermissions } from '../../lib/permissions';
import { GetUsersRequest, AuditLogsRequest } from '../../lib/adminAPI';

export const DataExport = () => {
  const { api, loading, error, executeRequest, clearError } = useAdminAPI();
  const { hasPermission } = usePermissions();
  
  const [exportType, setExportType] = useState<'users' | 'audit' | 'analytics'>('users');
  const [format, setFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [filters, setFilters] = useState<GetUsersRequest & AuditLogsRequest>({
    page: 1,
    limit: 10000, // Export all records
    startDate: '',
    endDate: '',
    action: '',
    resource: '',
    severity: undefined,
    role: undefined,
    status: undefined
  });
  const [exporting, setExporting] = useState(false);

  // Handle export
  const handleExport = useCallback(async () => {
    setExporting(true);
    
    try {
      let blob;
      
      if (exportType === 'users') {
        blob = await api.exportUsers(format, filters);
      } else if (exportType === 'audit') {
        // Audit logs only support csv and json formats
        const auditFormat = format === 'excel' ? 'csv' : format;
        blob = await api.exportAuditLogs(auditFormat, filters);
      } else if (exportType === 'analytics') {
        // For analytics, we'd need to implement this endpoint
        console.log('Analytics export not yet implemented');
        return;
      }
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [api, exportType, format, filters]);

  if (!hasPermission('system:export')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access data export.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Export</h1>
        <p className="text-gray-600">Export system data in various formats</p>
      </div>

      {/* Export Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="users">User Data</option>
              <option value="audit">Audit Logs</option>
              <option value="analytics">Analytics Data</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="json">JSON</option>
            </select>
          </div>

          {/* Export Button */}
          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>

        {/* Filters based on export type */}
        <div className="border-t border-gray-200 pt-4">
          {exportType === 'users' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                <select
                  value={filters.role || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as 'BUYER' | 'MERCHANT' | 'ADMIN' | 'ALL' | undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="BUYER">Buyer</option>
                  <option value="MERCHANT">Merchant</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as 'PENDING' | 'ACTIVE' | 'BANNED' | 'SUSPENDED' | 'ALL' | undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="BANNED">Banned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date From</label>
                <input
                  type="date"
                  value={filters.registrationDateFrom || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, registrationDateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {exportType === 'audit' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                <select
                  value={filters.action || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                <select
                  value={filters.resource || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Resources</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={filters.severity || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
          )}

          {exportType === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export History</h2>
        <div className="text-center text-gray-500 py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600">No export history available</p>
          <p className="text-sm text-gray-500 mt-1">
            Your export history will appear here once you start exporting data
          </p>
        </div>
      </div>

      {/* Export Guidelines */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mt-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Export Guidelines</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Large exports may take several minutes to process</li>
                <li>CSV format is recommended for large datasets</li>
                <li>Excel format includes formatting and charts</li>
                <li>JSON format is best for programmatic use</li>
                <li>Exports are limited to 10,000 records per request</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
