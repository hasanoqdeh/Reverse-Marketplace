'use client'
// Session Management Component

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAPI } from '../../lib/adminAPI';
import { usePermissions } from '../../lib/permissions';
import { formatPhoneNumber } from '../../lib/auth';

interface UserSession {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  loginAt: string;
  lastActivity: string;
  isActive: boolean;
  location?: {
    country: string;
    city: string;
  };
}

export const SessionManagement = () => {
  const { api, loading, error, executeRequest, clearError } = useAdminAPI();
  const { hasPermission } = usePermissions();
  
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL',
    searchTerm: ''
  });

  // Fetch all sessions (or implement this API call)
  const fetchAllSessions = useCallback(async () => {
    // This would need to be implemented in the backend
    // For now, we'll show a placeholder
    console.log('Fetching all sessions...');
  }, []);

  // Fetch user sessions
  const fetchUserSessions = useCallback(async (userId: string) => {
    const result = await executeRequest(() => api.getUserSessions(userId));
    if (result) {
      setUserSessions(result.sessions.map(session => ({
        ...session,
        userName: session.userPhone ? formatPhoneNumber(session.userPhone) : 'Unknown',
        isActive: session.lastActivity ? 
          new Date(session.lastActivity).getTime() > Date.now() - 30 * 60 * 1000 : false
      })));
    }
  }, [api, executeRequest]);

  // Terminate session
  const handleTerminateSession = useCallback(async (userId: string, sessionId: string) => {
    const result = await executeRequest(() => api.terminateUserSession(userId, sessionId));
    if (result) {
      if (selectedUserId === userId) {
        fetchUserSessions(userId);
      }
    }
  }, [api, executeRequest, selectedUserId, fetchUserSessions]);

  // Terminate all user sessions
  const handleTerminateAllSessions = useCallback(async (userId: string) => {
    if (!confirm('Are you sure you want to terminate all sessions for this user?')) {
      return;
    }
    
    const result = await executeRequest(() => api.terminateAllUserSessions(userId));
    if (result) {
      if (selectedUserId === userId) {
        fetchUserSessions(userId);
      }
    }
  }, [api, executeRequest, selectedUserId, fetchUserSessions]);

  // Format session duration
  const formatDuration = (loginAt: string, lastActivity: string) => {
    const login = new Date(loginAt);
    const activity = new Date(lastActivity);
    const duration = activity.getTime() - login.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  // Get user agent info
  const getUserAgentInfo = (userAgent: string) => {
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                  userAgent.includes('Firefox') ? 'Firefox' :
                  userAgent.includes('Safari') ? 'Safari' : 'Unknown';
    const os = userAgent.includes('Windows') ? 'Windows' :
               userAgent.includes('Mac') ? 'macOS' :
               userAgent.includes('Linux') ? 'Linux' :
               userAgent.includes('Android') ? 'Android' :
               userAgent.includes('iOS') ? 'iOS' : 'Unknown';
    
    return { browser, os };
  };

  if (!hasPermission('security:view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access session management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Management</h1>
        <p className="text-gray-600">Monitor and manage user sessions across the platform</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by phone or user ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Sessions</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchAllSessions}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Search Sessions
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

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">
              Enter a user ID or phone number to view and manage their active sessions. 
              You can terminate individual sessions or all sessions for a user.
            </p>
          </div>
        </div>
      </div>

      {/* User Sessions Modal */}
      {showUserModal && selectedUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">User Sessions</h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUserId(null);
                  setUserSessions([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {userSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active sessions found for this user
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {userSessions.length} session{userSessions.length !== 1 ? 's' : ''}
                  </div>
                  {hasPermission('security:manage') && (
                    <button
                      onClick={() => handleTerminateAllSessions(selectedUserId)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                    >
                      Terminate All Sessions
                    </button>
                  )}
                </div>

                {userSessions.map((session) => {
                  const { browser, os } = getUserAgentInfo(session.userAgent);
                  return (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Session ID</div>
                          <div className="text-sm text-gray-600">{session.id}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Status</div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            session.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {session.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">IP Address</div>
                          <div className="text-sm text-gray-600">{session.ipAddress}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Location</div>
                          <div className="text-sm text-gray-600">
                            {session.location ? 
                              `${session.location.city}, ${session.location.country}` : 
                              'Unknown'
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Device</div>
                          <div className="text-sm text-gray-600">{browser} on {os}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Duration</div>
                          <div className="text-sm text-gray-600">
                            {formatDuration(session.loginAt, session.lastActivity)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Login Time</div>
                          <div className="text-sm text-gray-600">
                            {new Date(session.loginAt).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Last Activity</div>
                          <div className="text-sm text-gray-600">
                            {new Date(session.lastActivity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      {session.isActive && hasPermission('security:manage') && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => handleTerminateSession(selectedUserId, session.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            Terminate Session
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
