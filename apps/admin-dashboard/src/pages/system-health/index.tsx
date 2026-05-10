'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Server,
  Database,
  Wifi,
  HardDrive,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { apiService, API_ENDPOINTS } from '@/services/api';
import { ServiceHealth, ServiceStatus } from '@/types';

interface SystemMetrics {
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  downServices: number;
  databaseLoad: number;
  diskUsage: number;
  networkIO: number;
  activeConnections: number;
}

export default function SystemHealthPage() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchSystemHealth();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchSystemHealth = async () => {
    try {
      const [servicesResponse, metricsResponse] = await Promise.all([
        apiService.get<ServiceHealth[]>(API_ENDPOINTS.SYSTEM_HEALTH.SERVICES),
        apiService.get<any>(API_ENDPOINTS.SYSTEM_HEALTH.METRICS)
      ]);

      if (servicesResponse.success && servicesResponse.data) {
        setServices(servicesResponse.data);
      } else {
        setError(servicesResponse.message || 'Failed to fetch services health');
      }

      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data);
      } else {
        setError(metricsResponse.message || 'Failed to fetch system metrics');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.HEALTHY: return 'text-green-600 bg-green-100';
      case ServiceStatus.DEGRADED: return 'text-yellow-600 bg-yellow-100';
      case ServiceStatus.UNHEALTHY: return 'text-red-600 bg-red-100';
      case ServiceStatus.DOWN: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.HEALTHY: return <CheckCircle className="h-4 w-4" />;
      case ServiceStatus.DEGRADED: return <AlertTriangle className="h-4 w-4" />;
      case ServiceStatus.UNHEALTHY: return <XCircle className="h-4 w-4" />;
      case ServiceStatus.DOWN: return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
          <h1 className="text-2xl font-semibold text-gray-900">System Health Monitoring</h1>
          <p className="mt-1 text-sm text-gray-600">
            Real-time monitoring of all microservices and system components
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
              autoRefresh 
                ? 'border-admin-600 bg-admin-600 text-white' 
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            {autoRefresh ? (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Auto Refresh ON
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Auto Refresh OFF
              </>
            )}
          </button>
          
          <button 
            onClick={fetchSystemHealth}
            className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-admin-600 hover:bg-admin-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </button>
        </div>
      </div>

      {/* System Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Server className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalServices || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Healthy Services</p>
                <p className="text-2xl font-bold text-green-600">{metrics.healthyServices || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Degraded Services</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.degradedServices || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Down Services</p>
                <p className="text-2xl font-bold text-red-600">{metrics.downServices || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.serviceName} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getStatusIcon(service.status)}
                <h3 className="ml-3 text-lg font-medium text-gray-900">{service.serviceName}</h3>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                {service.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Response Time</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{service.responseTime}ms</span>
                  {service.responseTime > 1000 && (
                    <TrendingUp className="h-4 w-4 text-red-500 ml-2" />
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Error Rate</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{service.errorRate}%</span>
                  {service.errorRate > 5 && (
                    <TrendingUp className="h-4 w-4 text-red-500 ml-2" />
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Uptime</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{service.uptime}%</span>
                  {service.uptime < 99 && (
                    <TrendingDown className="h-4 w-4 text-yellow-500 ml-2" />
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Checked</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(service.lastChecked).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Dependencies */}
            {service.dependencies && service.dependencies.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Dependencies</h4>
                <div className="flex flex-wrap gap-2">
                  {service.dependencies.map((dep) => (
                    <span key={dep} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* System Metrics */}
      {metrics && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center">
                <Database className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Database Load</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{metrics.databaseLoad}%</p>
            </div>

            <div>
              <div className="flex items-center">
                <HardDrive className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Disk Usage</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{metrics.diskUsage}%</p>
            </div>

            <div>
              <div className="flex items-center">
                <Wifi className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Network I/O</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{metrics.networkIO} MB/s</p>
            </div>

            <div>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Active Connections</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{metrics.activeConnections}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
