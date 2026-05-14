'use client'

// System Configuration Component

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAPI } from '../../lib/adminAPI';
import { usePermissions } from '../../lib/permissions';

export const SystemConfiguration = () => {
  const { api, loading, error, executeRequest, clearError } = useAdminAPI();
  const { hasPermission } = usePermissions();
  
  const [config, setConfig] = useState<Record<string, any>>({});
  const [originalConfig, setOriginalConfig] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch system configuration
  const fetchConfig = useCallback(async () => {
    const result = await executeRequest(() => api.getSystemConfiguration());
    if (result) {
      setConfig(result.config);
      setOriginalConfig(result.config);
    }
  }, [api, executeRequest]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Handle configuration change
  const handleConfigChange = useCallback((key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Save configuration
  const handleSave = useCallback(async () => {
    setSaving(true);
    const result = await executeRequest(() => api.updateSystemConfiguration(config));
    if (result) {
      setOriginalConfig(config);
      setHasChanges(false);
    }
    setSaving(false);
  }, [api, executeRequest, config]);

  // Reset configuration
  const handleReset = useCallback(() => {
    setConfig(originalConfig);
    setHasChanges(false);
  }, [originalConfig]);

  if (!hasPermission('system:config')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access system configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Configuration</h1>
        <p className="text-gray-600">Manage system settings and configuration</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Reset
        </button>
        <button
          onClick={fetchConfig}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Refresh
        </button>
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

      {/* Configuration Sections */}
      <div className="space-y-6">
        {/* Authentication Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTP Expiry Time (minutes)
              </label>
              <input
                type="number"
                value={config.otpExpiryMinutes || 5}
                onChange={(e) => handleConfigChange('otpExpiryMinutes', parseInt(e.target.value))}
                min="1"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={config.maxLoginAttempts || 5}
                onChange={(e) => handleConfigChange('maxLoginAttempts', parseInt(e.target.value))}
                min="3"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Lockout Duration (minutes)
              </label>
              <input
                type="number"
                value={config.accountLockoutMinutes || 30}
                onChange={(e) => handleConfigChange('accountLockoutMinutes', parseInt(e.target.value))}
                min="5"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                value={config.sessionTimeoutHours || 24}
                onChange={(e) => handleConfigChange('sessionTimeoutHours', parseInt(e.target.value))}
                min="1"
                max="168"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate Limit Requests per Minute
              </label>
              <input
                type="number"
                value={config.rateLimitPerMinute || 60}
                onChange={(e) => handleConfigChange('rateLimitPerMinute', parseInt(e.target.value))}
                min="10"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Min Length
              </label>
              <input
                type="number"
                value={config.passwordMinLength || 8}
                onChange={(e) => handleConfigChange('passwordMinLength', parseInt(e.target.value))}
                min="6"
                max="32"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enableTwoFactorAuth || false}
                  onChange={(e) => handleConfigChange('enableTwoFactorAuth', e.target.checked)}
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Enable Two-Factor Authentication</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enableIPWhitelist || false}
                  onChange={(e) => handleConfigChange('enableIPWhitelist', e.target.checked)}
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Enable IP Whitelist</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={config.adminEmail || ''}
                onChange={(e) => handleConfigChange('adminEmail', e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Server
              </label>
              <input
                type="text"
                value={config.smtpServer || ''}
                onChange={(e) => handleConfigChange('smtpServer', e.target.value)}
                placeholder="smtp.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Port
              </label>
              <input
                type="number"
                value={config.smtpPort || 587}
                onChange={(e) => handleConfigChange('smtpPort', parseInt(e.target.value))}
                min="25"
                max="65535"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Username
              </label>
              <input
                type="text"
                value={config.smtpUsername || ''}
                onChange={(e) => handleConfigChange('smtpUsername', e.target.value)}
                placeholder="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enableSecurityAlerts || false}
                  onChange={(e) => handleConfigChange('enableSecurityAlerts', e.target.checked)}
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Enable Security Alert Emails</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enableSystemAlerts || false}
                  onChange={(e) => handleConfigChange('enableSystemAlerts', e.target.checked)}
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Enable System Alert Emails</span>
              </label>
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Connection Pool Size
              </label>
              <input
                type="number"
                value={config.dbPoolSize || 10}
                onChange={(e) => handleConfigChange('dbPoolSize', parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Query Timeout (seconds)
              </label>
              <input
                type="number"
                value={config.dbQueryTimeout || 30}
                onChange={(e) => handleConfigChange('dbQueryTimeout', parseInt(e.target.value))}
                min="5"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enableQueryLogging || false}
                  onChange={(e) => handleConfigChange('enableQueryLogging', e.target.checked)}
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Enable Query Logging</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
