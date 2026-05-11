'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
  User,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '@/types';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin Dashboard - Reverse Marketplace' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div 
          className={`${sidebarOpen ? 'w-64' : 'w-16'} text-white transition-all duration-300 ease-in-out flex flex-col fixed inset-y-0 z-50`}
          style={{ backgroundColor: '#0F1117' }}
        >
      

          {/* Navigation - Below User Menu */}
          <nav className="flex-1 px-2 py-4 space-y-2">
                {/* User Menu - Top */}
          <div className="border-b border-gray-700">
            <div className="flex items-center space-x-3 px-2 py-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <h1>H</h1>
                </div>
              </div>
              
            </div>
          </div>
            {filteredNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700 hover:text-white transition-colors"
              >
                <item.icon className={`mr-3 h-5 w-5 text-white ${!sidebarOpen ? 'mx-auto' : ''}`} />
                {sidebarOpen && item.name}
              </Link>
            ))}
          </nav>``
        </div>

        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 ease-in-out`}>
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

    {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center px-2 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-600 rounded-md transition-colors"
                >
                  <User className="h-4 w-4 text-white mr-2" />
                  {sidebarOpen && (
                    <span className="flex-1 text-sm text-gray-300">
                      {user?.email || user?.phone || 'Admin User'}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors">
                        <User className="h-4 w-4 mr-2" />
                        <span className="flex-1">{user?.email || user?.phone || 'Admin User'}</span>
                      </div>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span className="flex-1">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
    </>
  );
};

export default AdminLayout;
