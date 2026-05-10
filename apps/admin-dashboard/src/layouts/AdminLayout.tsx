'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  MessageSquare, 
  DollarSign, 
  Shield, 
  BarChart3, 
  Activity, 
  FileText,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  User
} from 'lucide-react';
import { UserRole } from '@/types';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/auth/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: [UserRole.ADMIN, UserRole.SUPPORT_AGENT, UserRole.FINANCE_MANAGER, UserRole.OPERATIONS_MANAGER],
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: [UserRole.ADMIN, UserRole.OPERATIONS_MANAGER],
    },
    {
      name: 'Merchants',
      href: '/merchants',
      icon: Store,
      roles: [UserRole.ADMIN, UserRole.OPERATIONS_MANAGER],
    },
    {
      name: 'Requests',
      href: '/requests',
      icon: MessageSquare,
      roles: [UserRole.ADMIN, UserRole.SUPPORT_AGENT, UserRole.OPERATIONS_MANAGER],
    },
    {
      name: 'Bids',
      href: '/bids',
      icon: DollarSign,
      roles: [UserRole.ADMIN, UserRole.OPERATIONS_MANAGER],
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: DollarSign,
      roles: [UserRole.ADMIN, UserRole.FINANCE_MANAGER],
    },
    {
      name: 'Disputes',
      href: '/disputes',
      icon: Shield,
      roles: [UserRole.ADMIN, UserRole.SUPPORT_AGENT],
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: [UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.OPERATIONS_MANAGER],
    },
    {
      name: 'System Health',
      href: '/system-health',
      icon: Activity,
      roles: [UserRole.ADMIN, UserRole.SYSTEM_VIEWER],
    },
    {
      name: 'Audit Logs',
      href: '/audit-logs',
      icon: FileText,
      roles: [UserRole.ADMIN],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: [UserRole.ADMIN],
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-admin-900 text-white transition-all duration-300 ease-in-out flex flex-col fixed inset-y-0 z-50`}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-admin-800">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-admin-400" />
            {sidebarOpen && (
              <span className="text-xl font-bold">Admin Portal</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {filteredNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-admin-700 hover:text-white transition-colors"
            >
              <item.icon className={`mr-3 h-5 w-5 ${!sidebarOpen ? 'mx-auto' : ''}`} />
              {sidebarOpen && item.name}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="border-t border-admin-800 p-2">
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="flex-shrink-0">
              <User className="h-6 w-6 bg-admin-600 rounded-full" />
            </div>
            {sidebarOpen && user && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.email || user.phone}
                </p>
                <p className="text-xs text-admin-400 truncate">
                  {user.role}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-2 py-2 text-sm font-medium rounded-md hover:bg-admin-700 transition-colors"
          >
            <LogOut className={`mr-3 h-5 w-5 ${!sidebarOpen ? 'mx-auto' : ''}`} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 ease-in-out`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, requests, bids..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-admin-500 focus:border-admin-500 block w-64 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-md hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.email || user.phone}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.role}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-admin-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
