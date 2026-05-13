'use client'

// Admin Management Component

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAPI } from '../../lib/adminAPI';
import { usePermissions } from '../../lib/permissions';
import { GetAdminsResponse, UpdatePermissionsRequest } from '../../lib/adminAPI';
import { formatPhoneNumber } from '../../lib/auth';

export const AdminManagement = () => {
  const { api, loading, error, executeRequest, clearError } = useAdminAPI();
  const { hasPermission, adminLevel } = usePermissions();
  
  const [admins, setAdmins] = useState<GetAdminsResponse['admins']>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [adminPermissions, setAdminPermissions] = useState<any>(null);
  const [newAdminData, setNewAdminData] = useState({
    phone: '',
    adminLevel: 'SUPPORT',
    department: ''
  });

  // Fetch admins
  const fetchAdmins = useCallback(async () => {
    const result = await executeRequest(() => api.getAdmins());
    if (result) {
      setAdmins(result.admins);
    }
  }, [api, executeRequest]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Handle add admin
  const handleAddAdmin = useCallback(async () => {
    const result = await executeRequest(() => api.addAdminToWhitelist({
      phone: newAdminData.phone,
      adminLevel: newAdminData.adminLevel,
      department: newAdminData.department
    }));
    
    if (result) {
      setShowAddModal(false);
      setNewAdminData({ phone: '', adminLevel: 'SUPPORT', department: '' });
      fetchAdmins();
    }
  }, [api, executeRequest, newAdminData, fetchAdmins]);

  // Handle remove admin
  const handleRemoveAdmin = useCallback(async (adminId: string) => {
    const result = await executeRequest(() => api.removeAdminFromWhitelist(adminId));
    if (result) {
      setShowRemoveModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
    }
  }, [api, executeRequest, fetchAdmins]);

  // Handle update permissions
  const handleUpdatePermissions = useCallback(async (adminId: string, permissions: UpdatePermissionsRequest) => {
    const result = await executeRequest(() => api.updateAdminPermissions(adminId, permissions));
    if (result) {
      setShowPermissionsModal(false);
      setSelectedAdmin(null);
      setAdminPermissions(null);
      fetchAdmins();
    }
  }, [api, executeRequest, fetchAdmins]);

  // Get admin level color
  const getAdminLevelColor = (level: string) => {
    switch (level) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'SUPPORT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasPermission('admin:view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access admin management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
        <p className="text-gray-600">Manage admin accounts and permissions</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6">
        {hasPermission('admin:add') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Admin
          </button>
        )}
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

      {/* Admins Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading admins...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {admin.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {admin.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatPhoneNumber(admin.phone)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAdminLevelColor(admin.adminLevel)}`}>
                        {admin.adminLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {admin.department || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        admin.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : 'Never'}
                      </div>
                      {admin.lastLoginAt && (
                        <div className="text-sm text-gray-500">
                          {new Date(admin.lastLoginAt).toLocaleTimeString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {hasPermission('admin:edit') && (
                          <button
                            onClick={() => {
                              setSelectedAdmin(admin.id);
                              setAdminPermissions({
                                permissions: admin.permissions
                              });
                              setShowPermissionsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Permissions
                          </button>
                        )}
                        {hasPermission('admin:remove') && admin.adminLevel !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => {
                              setSelectedAdmin(admin.id);
                              setShowRemoveModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Admin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newAdminData.phone}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  placeholder="+962 7X XXX XXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Level</label>
                <select
                  value={newAdminData.adminLevel}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, adminLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SUPPORT">Support</option>
                  <option value="ADMIN">Admin</option>
                  {adminLevel === 'SUPER_ADMIN' && (
                    <option value="SUPER_ADMIN">Super Admin</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department (Optional)</label>
                <input
                  type="text"
                  value={newAdminData.department}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., IT, Security, Support"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewAdminData({ phone: '', adminLevel: 'SUPPORT', department: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdmin}
                disabled={!newAdminData.phone.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && adminPermissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Manage Permissions</h3>
            <div className="space-y-4">
              {Object.entries(adminPermissions.permissions).map(([resource, actions]: [string, any]) => (
                <div key={resource} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">{resource} Permissions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Array.isArray(actions) ? actions.map((action: string) => (
                      <label key={action} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700 capitalize">{action}</span>
                      </label>
                    )) : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedAdmin(null);
                  setAdminPermissions(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdatePermissions(selectedAdmin!, adminPermissions)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Admin Modal */}
      {showRemoveModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Remove Admin</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove this admin? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setSelectedAdmin(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveAdmin(selectedAdmin)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
