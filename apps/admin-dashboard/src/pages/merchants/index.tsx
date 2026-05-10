'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Ban, 
  ChevronDown,
  MoreHorizontal,
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react';
import { apiService, API_ENDPOINTS } from '@/services/api';
import { Merchant, UserRole, UserStatus, VerificationStatus, UserFilters } from '@/types';

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMerchants();
  }, [filters]);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.verificationStatus) params.append('verificationStatus', filters.verificationStatus);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await apiService.get<Merchant[]>(`${API_ENDPOINTS.MERCHANTS.LIST}?${params.toString()}`);
      if (response.success && response.data) {
        setMerchants(response.data);
      } else {
        setError(response.message || 'Failed to fetch merchants');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMerchant = async (merchantId: string) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.MERCHANTS.VERIFY(merchantId));
      if (response.success) {
        fetchMerchants(); // Refresh list
      } else {
        setError(response.message || 'Failed to verify merchant');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRejectMerchant = async (merchantId: string) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.MERCHANTS.REJECT(merchantId));
      if (response.success) {
        fetchMerchants(); // Refresh list
      } else {
        setError(response.message || 'Failed to reject merchant');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSuspendMerchant = async (merchantId: string) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.MERCHANTS.SUSPEND(merchantId));
      if (response.success) {
        fetchMerchants(); // Refresh list
      } else {
        setError(response.message || 'Failed to suspend merchant');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters({ ...filters, search: term });
  };

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const toggleMerchantSelection = (merchantId: string) => {
    setSelectedMerchants(prev => 
      prev.includes(merchantId) 
        ? prev.filter(id => id !== merchantId)
        : [...prev, merchantId]
    );
  };

  const selectAllMerchants = () => {
    if (selectedMerchants.length === merchants.length) {
      setSelectedMerchants([]);
    } else {
      setSelectedMerchants(merchants.map(merchant => merchant.id));
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE: return 'text-green-600 bg-green-100';
      case UserStatus.BANNED: return 'text-red-600 bg-red-100';
      case UserStatus.PENDING: return 'text-yellow-600 bg-yellow-100';
      case UserStatus.INACTIVE: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVerificationStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED: return 'text-green-600 bg-green-100';
      case VerificationStatus.PENDING: return 'text-yellow-600 bg-yellow-100';
      case VerificationStatus.REJECTED: return 'text-red-600 bg-red-100';
      case VerificationStatus.SUSPENDED: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Merchants Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage merchant verification, performance, and subscriptions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          
          <button 
            onClick={fetchMerchants}
            className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-admin-600 hover:bg-admin-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          
          <button className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-success-600 hover:bg-success-700">
            <Store className="h-4 w-4 mr-2" />
            Add Merchant
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by business name, email, or ID..."
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-admin-500 focus:border-admin-500 block w-full text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
              <select
                value={filters.verificationStatus || ''}
                onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-admin-500 focus:border-admin-500 text-sm"
              >
                <option value="">All Status</option>
                <option value={VerificationStatus.PENDING}>PENDING</option>
                <option value={VerificationStatus.VERIFIED}>VERIFIED</option>
                <option value={VerificationStatus.REJECTED}>REJECTED</option>
                <option value={VerificationStatus.SUSPENDED}>SUSPENDED</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-admin-500 focus:border-admin-500 text-sm"
              >
                <option value="">All Status</option>
                <option value={UserStatus.ACTIVE}>ACTIVE</option>
                <option value={UserStatus.INACTIVE}>INACTIVE</option>
                <option value={UserStatus.BANNED}>BANNED</option>
                <option value={UserStatus.PENDING}>PENDING</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-admin-500 focus:border-admin-500 text-sm mb-2"
                placeholder="From"
              />
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-admin-500 focus:border-admin-500 text-sm"
                placeholder="To"
              />
            </div>
          </div>
        </div>
      )}

      {/* Merchants Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedMerchants.length === merchants.length && merchants.length > 0}
              onChange={selectAllMerchants}
              className="h-4 w-4 text-admin-600 focus:ring-admin-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Select all ({selectedMerchants.length} selected)
            </span>
          </div>
          <span className="text-sm text-gray-700">
            {merchants.length} total merchants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedMerchants.length === merchants.length && merchants.length > 0}
                    onChange={selectAllMerchants}
                    className="h-4 w-4 text-admin-600 focus:ring-admin-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Deals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {merchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedMerchants.includes(merchant.id)}
                      onChange={() => toggleMerchantSelection(merchant.id)}
                      className="h-4 w-4 text-admin-600 focus:ring-admin-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Store className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {merchant.businessName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {merchant.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationStatusColor(merchant.verificationStatus)}`}>
                      {merchant.verificationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(merchant.status)}`}>
                      {merchant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {merchant.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ★
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {merchant.totalDeals}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {merchant.subscriptionPlan}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(merchant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-admin-600 hover:text-admin-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {merchant.verificationStatus === VerificationStatus.PENDING ? (
                        <button 
                          onClick={() => handleVerifyMerchant(merchant.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      ) : merchant.verificationStatus === VerificationStatus.VERIFIED ? (
                        <button 
                          onClick={() => handleSuspendMerchant(merchant.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleVerifyMerchant(merchant.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
