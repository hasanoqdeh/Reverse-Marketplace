// User Management Component with Backend Integration

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useAdminAPI } from '../../lib/adminAPI';
import { usePermissions } from '../../lib/permissions';
import { GetUsersRequest, GetUsersResponse, SuspendUserRequest, BanUserRequest, BulkActionRequest } from '../../lib/adminAPI';
import { formatPhoneNumber } from '../../lib/auth';

interface UserManagementProps {
  initialFilters?: Partial<GetUsersRequest>;
}

export const UserManagement = ({ initialFilters = {} }: UserManagementProps) => {
  const { api, loading, error, executeRequest, clearError } = useAdminAPI();
  const { hasPermission, canAccessResource } = usePermissions();
  
  const [users, setUsers] = useState<GetUsersResponse['users']>([]);
  const [pagination, setPagination] = useState<GetUsersResponse['pagination']>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<GetUsersRequest>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState<string | null>(null);
  const [showBanModal, setShowBanModal] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    const result = await executeRequest(() => api.getUsers(filters));
    if (result) {
      setUsers(result.users);
      setPagination(result.pagination);
    }
  }, [api, executeRequest, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<GetUsersRequest>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.length >= 2 || term.length === 0) {
      handleFilterChange({ search: term });
    }
  }, [handleFilterChange]);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    handleFilterChange({ page: newPage });
  }, [handleFilterChange]);

  // Handle user selection
  const handleUserSelection = useCallback((userId: string, selected: boolean) => {
    setSelectedUsers(prev => {
      if (selected) {
        return [...prev, userId];
      } else {
        return prev.filter(id => id !== userId);
      }
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  }, [users]);

  // Handle user actions
  const handleSuspendUser = useCallback(async (userId: string, data: SuspendUserRequest) => {
    setLoadingAction(userId);
    const result = await executeRequest(() => api.suspendUser(userId, data));
    if (result) {
      setShowSuspendModal(null);
      fetchUsers(); // Refresh the list
    }
    setLoadingAction(null);
  }, [api, executeRequest, fetchUsers]);

  const handleBanUser = useCallback(async (userId: string, data: BanUserRequest) => {
    setLoadingAction(userId);
    const result = await executeRequest(() => api.banUser(userId, data));
    if (result) {
      setShowBanModal(null);
      fetchUsers(); // Refresh the list
    }
    setLoadingAction(null);
  }, [api, executeRequest, fetchUsers]);

  const handleVerifyUser = useCallback(async (userId: string) => {
    setLoadingAction(userId);
    const result = await executeRequest(() => api.verifyUser(userId));
    if (result) {
      fetchUsers(); // Refresh the list
    }
    setLoadingAction(null);
  }, [api, executeRequest, fetchUsers]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    setLoadingAction(userId);
    const result = await executeRequest(() => api.deleteUser(userId, true));
    if (result) {
      fetchUsers(); // Refresh the list
    }
    setLoadingAction(null);
  }, [api, executeRequest, fetchUsers]);

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action: BulkActionRequest['action'], actionData: any) => {
    if (selectedUsers.length === 0) return;

    setLoadingAction('bulk');
    const result = await executeRequest(() => api.bulkUserAction({
      userIds: selectedUsers,
      action,
      actionData
    }));
    
    if (result) {
      setSelectedUsers([]);
      setShowBulkActions(false);
      fetchUsers(); // Refresh the list
    }
    setLoadingAction(null);
  }, [api, executeRequest, selectedUsers, fetchUsers]);

  // Export functionality
  const handleExport = useCallback(async (format: 'csv' | 'excel' | 'json') => {
    try {
      const blob = await api.exportUsers(format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [api, filters]);

  // Format user status
  const formatStatus = useCallback((status: string, phoneVerified: boolean) => {
    if (status === 'BANNED') return { text: 'Banned', color: 'red' };
    if (status === 'SUSPENDED') return { text: 'Suspended', color: 'yellow' };
    if (status === 'PENDING') return { text: 'Pending', color: 'gray' };
    if (!phoneVerified) return { text: 'Unverified', color: 'orange' };
    return { text: 'Active', color: 'green' };
  }, []);

  if (!hasPermission('user:view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage and monitor all platform users</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by phone, name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={filters.role || 'ALL'}
              onChange={(e) => handleFilterChange({ role: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="BUYER">Buyer</option>
              <option value="MERCHANT">Merchant</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || 'ALL'}
              onChange={(e) => handleFilterChange({ status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange({ sortBy: sortBy as any, sortOrder: sortOrder as any });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="lastLoginAt-desc">Recent Login</option>
              <option value="phone-asc">Phone (A-Z)</option>
              <option value="phone-desc">Phone (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            {selectedUsers.length > 0 && (
              <button
                onClick={() => setShowBulkActions(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Bulk Actions ({selectedUsers.length})
              </button>
            )}
            {hasPermission('system:export') && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Showing {users.length} of {pagination.total} users
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

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
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
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const status = formatStatus(user.status, user.phoneVerified);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.profile?.city}, {user.profile?.country}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatPhoneNumber(user.phone)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'MERCHANT' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          status.color === 'green' ? 'bg-green-100 text-green-800' :
                          status.color === 'red' ? 'bg-red-100 text-red-800' :
                          status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          status.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                        </div>
                        {user.lastLoginAt && (
                          <div className="text-sm text-gray-500">
                            {new Date(user.lastLoginAt).toLocaleTimeString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowUserDetails(user.id)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            View
                          </button>
                          {hasPermission('user:edit') && (
                            <>
                              {!user.phoneVerified && (
                                <button
                                  onClick={() => handleVerifyUser(user.id)}
                                  disabled={loadingAction === user.id}
                                  className="text-green-600 hover:text-green-900 text-sm"
                                >
                                  {loadingAction === user.id ? '...' : 'Verify'}
                                </button>
                              )}
                              {user.status === 'ACTIVE' && hasPermission('user:suspend') && (
                                <button
                                  onClick={() => setShowSuspendModal(user.id)}
                                  className="text-yellow-600 hover:text-yellow-900 text-sm"
                                >
                                  Suspend
                                </button>
                              )}
                              {(user.status === 'ACTIVE' || user.status === 'SUSPENDED') && hasPermission('user:ban') && (
                                <button
                                  onClick={() => setShowBanModal(user.id)}
                                  className="text-red-600 hover:text-red-900 text-sm"
                                >
                                  Ban
                                </button>
                              )}
                              {hasPermission('user:delete') && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={loadingAction === user.id}
                                  className="text-red-600 hover:text-red-900 text-sm"
                                >
                                  {loadingAction === user.id ? '...' : 'Delete'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals would go here - Suspend, Ban, Bulk Actions, User Details */}
      {/* For brevity, I'll include just the suspend modal structure */}
      
      {showSuspendModal && (
        <SuspendModal
          userId={showSuspendModal}
          onSubmit={(data) => handleSuspendUser(showSuspendModal, data)}
          onClose={() => setShowSuspendModal(null)}
          loading={loadingAction === showSuspendModal}
        />
      )}

      {showBanModal && (
        <BanModal
          userId={showBanModal}
          onSubmit={(data) => handleBanUser(showBanModal, data)}
          onClose={() => setShowBanModal(null)}
          loading={loadingAction === showBanModal}
        />
      )}

      {showBulkActions && (
        <BulkActionsModal
          selectedUsers={selectedUsers}
          onSubmit={handleBulkAction}
          onClose={() => setShowBulkActions(false)}
          loading={loadingAction === 'bulk'}
        />
      )}

      {showUserDetails && (
        <UserDetailsModal
          userId={showUserDetails}
          onClose={() => setShowUserDetails(null)}
        />
      )}
    </div>
  );
};

// Modal components (simplified versions)
const SuspendModal = ({ userId, onSubmit, onClose, loading }: {
  userId: string;
  onSubmit: (data: SuspendUserRequest) => void;
  onClose: () => void;
  loading: boolean;
}) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<number | null>(24); // 24 hours default
  const [notifyUser, setNotifyUser] = useState(true);
  const [internalNote, setInternalNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      reason,
      duration: duration || undefined,
      notifyUser,
      internalNote: internalNote || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Suspend User</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
            <input
              type="number"
              value={duration || ''}
              onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : null)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Leave empty for indefinite suspension</p>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">Notify user via email/SMS</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Note (optional)</label>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? 'Suspending...' : 'Suspend User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BanModal = ({ userId, onSubmit, onClose, loading }: {
  userId: string;
  onSubmit: (data: BanUserRequest) => void;
  onClose: () => void;
  loading: boolean;
}) => {
  const [reason, setReason] = useState('');
  const [permanent, setPermanent] = useState(true);
  const [notifyUser, setNotifyUser] = useState(true);
  const [internalNote, setInternalNote] = useState('');
  const [deleteData, setDeleteData] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      reason,
      permanent,
      notifyUser,
      internalNote: internalNote || undefined,
      deleteData
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Ban User</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={permanent}
                onChange={(e) => setPermanent(e.target.checked)}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">Permanent ban</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={deleteData}
                onChange={(e) => setDeleteData(e.target.checked)}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">Delete user data (cannot be undone)</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">Notify user</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Note (optional)</label>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Banning...' : 'Ban User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BulkActionsModal = ({ selectedUsers, onSubmit, onClose, loading }: {
  selectedUsers: string[];
  onSubmit: (action: BulkActionRequest['action'], data: any) => void;
  onClose: () => void;
  loading: boolean;
}) => {
  const [action, setAction] = useState<BulkActionRequest['action']>('SUSPEND');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(24);
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [internalNote, setInternalNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actionData: any = { reason };
    
    if (action === 'SUSPEND') {
      actionData.duration = duration;
    }
    
    actionData.notifyUsers = notifyUsers;
    if (internalNote) actionData.internalNote = internalNote;
    
    onSubmit(action, actionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Bulk Actions ({selectedUsers.length} users)</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as BulkActionRequest['action'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SUSPEND">Suspend</option>
              <option value="BAN">Ban</option>
              <option value="VERIFY">Verify</option>
              <option value="SEND_NOTIFICATION">Send Notification</option>
            </select>
          </div>
          
          {action !== 'VERIFY' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required={action !== 'SEND_NOTIFICATION'}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {action === 'SUSPEND' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifyUsers}
                onChange={(e) => setNotifyUsers(e.target.checked)}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">Notify users</span>
            </label>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Note (optional)</label>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (action !== 'VERIFY' && !reason)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Execute ${action}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserDetailsModal = ({ userId, onClose }: {
  userId: string;
  onClose: () => void;
}) => {
  const { api, loading, executeRequest } = useAdminAPI();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const result = await executeRequest(() => api.getUserById(userId));
      if (result) {
        setUser(result.user);
      }
    };
    fetchUser();
  }, [api, executeRequest, userId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : user ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {user.profile?.firstName} {user.profile?.lastName}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {formatPhoneNumber(user.phone)}
                </div>
                <div>
                  <span className="font-medium">Role:</span> {user.role}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {user.status}
                </div>
                <div>
                  <span className="font-medium">Phone Verified:</span> {user.phoneVerified ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Failed Attempts:</span> {user.failedLoginAttempts}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location</h4>
              <div className="text-sm">
                <div><span className="font-medium">Address:</span> {user.profile?.address || 'N/A'}</div>
                <div><span className="font-medium">City:</span> {user.profile?.city || 'N/A'}</div>
                <div><span className="font-medium">Country:</span> {user.profile?.country || 'N/A'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Registered:</span> {new Date(user.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Last Login:</span> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-red-600">Failed to load user details</div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
