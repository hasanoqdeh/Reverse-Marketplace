'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Eye, 
  ChevronDown,
  MoreHorizontal,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Scale,
  FileText
} from 'lucide-react';
import { apiService, API_ENDPOINTS } from '@/services/api';
import { Dispute, DisputeStatus, DisputeFilters, ResolutionAction } from '@/types';

interface DisputeWithSeverity extends Dispute {
  severity: string;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<DisputeWithSeverity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<DisputeFilters>({});
  const [selectedDisputes, setSelectedDisputes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [filters]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await apiService.get<Dispute[]>(`${API_ENDPOINTS.DISPUTES.LIST}?${params.toString()}`);
      if (response.success && response.data) {
        const disputesWithSeverity = response.data.map((dispute: Dispute) => ({
          ...dispute,
          severity: dispute.status === DisputeStatus.OPEN ? 'HIGH' : 
                   dispute.status === DisputeStatus.INVESTIGATING ? 'MEDIUM' : 'LOW'
        }));
        setDisputes(disputesWithSeverity);
      } else {
        setError(response.message || 'Failed to fetch disputes');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId: string, action: ResolutionAction) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.DISPUTES.RESOLVE(disputeId), {
        action,
        description: `Resolved by admin with action: ${action}`
      });
      if (response.success) {
        fetchDisputes(); // Refresh list
      } else {
        setError(response.message || 'Failed to resolve dispute');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters({ ...filters, search: term });
  };

  const handleFilterChange = (key: keyof DisputeFilters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const toggleDisputeSelection = (disputeId: string) => {
    setSelectedDisputes(prev => 
      prev.includes(disputeId) 
        ? prev.filter(id => id !== disputeId)
        : [...prev, disputeId]
    );
  };

  const selectAllDisputes = () => {
    if (selectedDisputes.length === disputes.length) {
      setSelectedDisputes([]);
    } else {
      setSelectedDisputes(disputes.map(dispute => dispute.id));
    }
  };

  const getStatusColor = (status: DisputeStatus) => {
    switch (status) {
      case DisputeStatus.OPEN: return 'text-yellow-600 bg-yellow-100';
      case DisputeStatus.INVESTIGATING: return 'text-blue-600 bg-blue-100';
      case DisputeStatus.RESOLVED: return 'text-green-600 bg-green-100';
      case DisputeStatus.CLOSED: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'text-gray-600 bg-gray-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
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
          <h1 className="text-2xl font-semibold text-gray-900">Disputes Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Handle and resolve buyer-merchant disputes
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
            onClick={fetchDisputes}
            className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-admin-600 hover:bg-admin-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
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
                  placeholder="Search by ID, buyer, merchant, or reason..."
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-admin-500 focus:border-admin-500 block w-full text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-admin-500 focus:border-admin-500 text-sm"
              >
                <option value="">All Status</option>
                <option value={DisputeStatus.OPEN}>OPEN</option>
                <option value={DisputeStatus.INVESTIGATING}>INVESTIGATING</option>
                <option value={DisputeStatus.RESOLVED}>RESOLVED</option>
                <option value={DisputeStatus.CLOSED}>CLOSED</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select
                value={filters.assignedTo || ''}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-admin-500 focus:border-admin-500 text-sm"
              >
                <option value="">All Agents</option>
                <option value="agent1">Agent 1</option>
                <option value="agent2">Agent 2</option>
                <option value="agent3">Agent 3</option>
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

      {/* Disputes Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedDisputes.length === disputes.length && disputes.length > 0}
              onChange={selectAllDisputes}
              className="h-4 w-4 text-admin-600 focus:ring-admin-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Select all ({selectedDisputes.length} selected)
            </span>
          </div>
          <span className="text-sm text-gray-700">
            {disputes.length} total disputes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedDisputes.length === disputes.length && disputes.length > 0}
                    onChange={selectAllDisputes}
                    className="h-4 w-4 text-admin-600 focus:ring-admin-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispute ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {disputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDisputes.includes(dispute.id)}
                      onChange={() => toggleDisputeSelection(dispute.id)}
                      className="h-4 w-4 text-admin-600 focus:ring-admin-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{dispute.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Buyer:</div>
                      <div className="text-gray-500">{dispute.buyerId}</div>
                      <div className="font-medium text-gray-900 mt-1">Merchant:</div>
                      <div className="text-gray-500">{dispute.merchantId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{dispute.reason}</div>
                      <div className="text-gray-500 mt-1">{dispute.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(dispute.severity)}`}>
                      {dispute.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-admin-600 hover:text-admin-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <FileText className="h-4 w-4" />
                      </button>
                      
                      {dispute.status !== DisputeStatus.RESOLVED && dispute.status !== DisputeStatus.CLOSED ? (
                        <button 
                          onClick={() => handleResolveDispute(dispute.id, ResolutionAction.REFUND_BUYER)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      ) : (
                        <button className="text-gray-400 cursor-not-allowed">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
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
