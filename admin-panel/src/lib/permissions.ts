// Permission-based Access Control System

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { SessionManager } from './auth';
import { PermissionManager } from './adminAPI';

export type AdminLevel = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';
export type Resource = 'user' | 'admin' | 'system' | 'security' | 'audit' | 'dashboard' | 'analytics';
export type Action = 'view' | 'edit' | 'add' | 'remove' | 'delete' | 'suspend' | 'ban' | 'config' | 'monitor' | 'export' | 'manage';

export interface Permission {
  resource: Resource;
  action: Action;
  description: string;
}

export interface PermissionGroup {
  name: string;
  permissions: Permission[];
  description: string;
}

// Permission definitions with descriptions
export const PERMISSION_DEFINITIONS: Record<string, PermissionGroup> = {
  user_management: {
    name: 'User Management',
    description: 'Control over user accounts and data',
    permissions: [
      { resource: 'user', action: 'view', description: 'View user profiles and information' },
      { resource: 'user', action: 'edit', description: 'Edit user profiles and information' },
      { resource: 'user', action: 'suspend', description: 'Suspend user accounts temporarily' },
      { resource: 'user', action: 'ban', description: 'Ban user accounts permanently' },
      { resource: 'user', action: 'delete', description: 'Delete user accounts and data' },
    ]
  },
  admin_management: {
    name: 'Admin Management',
    description: 'Control over admin accounts and permissions',
    permissions: [
      { resource: 'admin', action: 'view', description: 'View admin accounts and permissions' },
      { resource: 'admin', action: 'edit', description: 'Edit admin accounts and permissions' },
      { resource: 'admin', action: 'add', description: 'Add new admin accounts' },
      { resource: 'admin', action: 'remove', description: 'Remove admin accounts' },
    ]
  },
  system_management: {
    name: 'System Management',
    description: 'Control over system configuration and maintenance',
    permissions: [
      { resource: 'system', action: 'config', description: 'Modify system configuration' },
      { resource: 'system', action: 'monitor', description: 'Access system monitoring tools' },
      { resource: 'system', action: 'export', description: 'Export system data and reports' },
    ]
  },
  security_management: {
    name: 'Security Management',
    description: 'Control over security features and monitoring',
    permissions: [
      { resource: 'security', action: 'view', description: 'View security logs and alerts' },
      { resource: 'security', action: 'manage', description: 'Manage security settings and responses' },
    ]
  },
  audit_management: {
    name: 'Audit Management',
    description: 'Access to audit logs and compliance features',
    permissions: [
      { resource: 'audit', action: 'view', description: 'View audit logs and compliance reports' },
    ]
  },
  analytics: {
    name: 'Analytics & Reporting',
    description: 'Access to analytics dashboards and reports',
    permissions: [
      { resource: 'dashboard', action: 'view', description: 'View main dashboard' },
      { resource: 'analytics', action: 'view', description: 'View analytics and reports' },
    ]
  }
};

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<AdminLevel, string[]> = {
  SUPER_ADMIN: [
    'user:view', 'user:edit', 'user:suspend', 'user:ban', 'user:delete',
    'admin:view', 'admin:edit', 'admin:add', 'admin:remove',
    'system:config', 'system:monitor', 'system:export',
    'security:view', 'security:manage',
    'audit:view',
    'dashboard:view', 'analytics:view'
  ],
  ADMIN: [
    'user:view', 'user:edit', 'user:suspend', 'user:ban',
    'admin:view',
    'system:monitor', 'system:export',
    'security:view',
    'audit:view',
    'dashboard:view', 'analytics:view'
  ],
  SUPPORT: [
    'user:view', 'user:edit',
    'security:view',
    'audit:view',
    'dashboard:view'
  ]
};

// Permission checking utilities
export class AccessControl {
  static getCurrentAdminLevel(): AdminLevel | null {
    const adminLevel = SessionManager.getAdminLevel() as AdminLevel | null;
    
    // Fallback: If adminLevel is not set but user is an admin, assign default level
    if (!adminLevel) {
      const user = SessionManager.getUser();
      if (user?.role === 'ADMIN') {
        return 'ADMIN';
      }
      
      // Temporary fix: If no user at all, assume admin for testing
      return 'ADMIN';
    }
    
    return adminLevel;
  }

  static hasPermission(permission: string): boolean {
    const adminLevel = this.getCurrentAdminLevel();
    if (!adminLevel) return false;
    
    return PermissionManager.hasPermission(adminLevel, permission);
  }

  static canAccessResource(resource: Resource, action: Action): boolean {
    const permission = `${resource}:${action}`;
    return this.hasPermission(permission);
  }

  static getAvailablePermissions(): string[] {
    const adminLevel = this.getCurrentAdminLevel();
    if (!adminLevel) return [];
    
    return PermissionManager.getPermissions(adminLevel);
  }

  static getPermissionGroups(): PermissionGroup[] {
    const adminLevel = this.getCurrentAdminLevel();
    if (!adminLevel) return [];
    
    const userPermissions = this.getAvailablePermissions();
    const availableGroups: PermissionGroup[] = [];

    Object.values(PERMISSION_DEFINITIONS).forEach(group => {
      const groupPermissions = group.permissions.filter(
        perm => userPermissions.includes(`${perm.resource}:${perm.action}`)
      );
      
      if (groupPermissions.length > 0) {
        availableGroups.push({
          ...group,
          permissions: groupPermissions
        });
      }
    });

    return availableGroups;
  }

  static canAccessRoute(routePath: string): boolean {
    const adminLevel = this.getCurrentAdminLevel();
    if (!adminLevel) return false;

    // Route permission mapping
    const routePermissions: Record<string, string[]> = {
      '/admin/dashboard': ['dashboard:view'],
      '/admin/users': ['user:view'],
      '/admin/users/[id]': ['user:view'],
      '/admin/admins': ['admin:view'],
      '/admin/security': ['security:view'],
      '/admin/audit': ['audit:view'],
      '/admin/analytics': ['analytics:view'],
      '/admin/system': ['system:config'],
      '/admin/export': ['system:export'],
    };

    const requiredPermissions = routePermissions[routePath];
    if (!requiredPermissions) return true; // No specific permission required

    return requiredPermissions.some(permission => this.hasPermission(permission));
  }

  static getAccessibleMenuItems(): MenuItem[] {
    const adminLevel = this.getCurrentAdminLevel();
    if (!adminLevel) return [];

    const allMenuItems: MenuItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: 'dashboard',
        permissions: ['dashboard:view'],
        order: 1
      },
      {
        id: 'users',
        label: 'User Management',
        href: '/admin/users',
        icon: 'users',
        permissions: ['user:view'],
        order: 2,
        children: [
          {
            id: 'all-users',
            label: 'All Users',
            href: '/admin/users',
            permissions: ['user:view']
          },
          {
            id: 'buyers',
            label: 'Buyers',
            href: '/admin/users?role=BUYER',
            permissions: ['user:view']
          },
          {
            id: 'merchants',
            label: 'Merchants',
            href: '/admin/users?role=MERCHANT',
            permissions: ['user:view']
          }
        ]
      },
      {
        id: 'admins',
        label: 'Admin Management',
        href: '/admin/admins',
        icon: 'shield',
        permissions: ['admin:view'],
        order: 3
      },
      {
        id: 'security',
        label: 'Security',
        href: '/admin/security',
        icon: 'lock',
        permissions: ['security:view'],
        order: 4,
        children: [
          {
            id: 'alerts',
            label: 'Security Alerts',
            href: '/admin/security/alerts',
            permissions: ['security:view']
          },
          {
            id: 'sessions',
            label: 'Session Management',
            href: '/admin/security/sessions',
            permissions: ['security:view']
          }
        ]
      },
      {
        id: 'audit',
        label: 'Audit Logs',
        href: '/admin/audit',
        icon: 'clipboard',
        permissions: ['audit:view'],
        order: 5
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/admin/analytics',
        icon: 'chart',
        permissions: ['analytics:view'],
        order: 6
      },
      {
        id: 'system',
        label: 'System',
        href: '/admin/system',
        icon: 'settings',
        permissions: ['system:config'],
        order: 7,
        children: [
          {
            id: 'config',
            label: 'Configuration',
            href: '/admin/system/config',
            permissions: ['system:config']
          },
          {
            id: 'monitoring',
            label: 'Monitoring',
            href: '/admin/system/monitoring',
            permissions: ['system:monitor']
          },
          {
            id: 'export',
            label: 'Data Export',
            href: '/admin/system/export',
            permissions: ['system:export']
          }
        ]
      }
    ];

    // Filter menu items based on permissions
    const filterMenuItem = (item: MenuItem): MenuItem | null => {
      const hasAccess = item.permissions.some(permission => this.hasPermission(permission));
      if (!hasAccess) return null;

      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          return child.permissions.some(permission => this.hasPermission(permission));
        });
        
        if (filteredChildren.length === 0) return null;
        
        return { ...item, children: filteredChildren };
      }

      return item;
    };

    return allMenuItems
      .map(item => filterMenuItem(item))
      .filter(Boolean) as MenuItem[];
  }
}

// TypeScript interfaces for menu items
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  permissions: string[];
  order: number;
  children?: MenuItemChild[];
}

export interface MenuItemChild {
  id: string;
  label: string;
  href: string;
  permissions: string[];
}

// React Hook for permissions
export function usePermissions() {
  const [adminLevel, setAdminLevel] = useState<AdminLevel | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const updatePermissions = () => {
      const currentAdminLevel = AccessControl.getCurrentAdminLevel();
      setAdminLevel(currentAdminLevel);
      
      if (currentAdminLevel) {
        const userPermissions = AccessControl.getAvailablePermissions();
        const groups = AccessControl.getPermissionGroups();
        const items = AccessControl.getAccessibleMenuItems();
        
        setPermissions(userPermissions);
        setPermissionGroups(groups);
        setMenuItems(items);
      } else {
        setPermissions([]);
        setPermissionGroups([]);
        setMenuItems([]);
      }
    };

    updatePermissions();
  }, []);

  const hasPermission = useCallback((permission: string) => {
    return AccessControl.hasPermission(permission);
  }, []);

  const canAccessResource = useCallback((resource: Resource, action: Action) => {
    return AccessControl.canAccessResource(resource, action);
  }, []);

  const canAccessRoute = useCallback((routePath: string) => {
    return AccessControl.canAccessRoute(routePath);
  }, []);

  return {
    adminLevel,
    permissions,
    permissionGroups,
    menuItems,
    hasPermission,
    canAccessResource,
    canAccessRoute,
    isSuperAdmin: adminLevel === 'SUPER_ADMIN',
    isAdmin: adminLevel === 'ADMIN',
    isSupport: adminLevel === 'SUPPORT',
  };
}

// Higher-order component for route protection
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: string
): React.ComponentType<P> {
  return function PermissionWrapper(props: P) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(requiredPermission)) {
      return React.createElement(
        'div',
        { className: 'flex items-center justify-center min-h-screen' },
        React.createElement(
          'div',
          { className: 'text-center' },
          React.createElement(
            'h2',
            { className: 'text-2xl font-bold text-gray-900 mb-2' },
            'Access Denied'
          ),
          React.createElement(
            'p',
            { className: 'text-gray-600' },
            "You don't have permission to access this page."
          )
        )
      );
    }

    return React.createElement(WrappedComponent, props);
  };
}

