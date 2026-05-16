'use client'

import { useState, useEffect } from 'react'
import { SessionManager } from './auth'

export interface MenuItem {
  id: string
  label: string
  href: string
  icon: string
  children?: MenuItem[]
}

const MENU_BY_ROLE: Record<string, MenuItem[]> = {
  SUPER_ADMIN: [
    { id: 'dashboard',  label: 'Dashboard',   href: '/admin/dashboard',  icon: 'dashboard' },
    { id: 'users',      label: 'Users',        href: '/admin/users',      icon: 'users' },
    { id: 'requests',   label: 'Requests',     href: '/admin/requests',   icon: 'document' },
    { id: 'categories', label: 'Categories',   href: '/admin/categories', icon: 'tag' },
    { id: 'logs',       label: 'Audit Logs',   href: '/admin/logs',       icon: 'clipboard' },
    { id: 'settings',   label: 'Settings',     href: '/admin/settings',   icon: 'settings' },
  ],
  ADMIN: [
    { id: 'dashboard',  label: 'Dashboard',   href: '/admin/dashboard',  icon: 'dashboard' },
    { id: 'users',      label: 'Users',        href: '/admin/users',      icon: 'users' },
    { id: 'requests',   label: 'Requests',     href: '/admin/requests',   icon: 'document' },
    { id: 'categories', label: 'Categories',   href: '/admin/categories', icon: 'tag' },
    { id: 'logs',       label: 'Audit Logs',   href: '/admin/logs',       icon: 'clipboard' },
  ],
  SUPPORT: [
    { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    { id: 'users',     label: 'Users',     href: '/admin/users',     icon: 'users' },
    { id: 'requests',  label: 'Requests',  href: '/admin/requests',  icon: 'document' },
  ],
}

// Routes each role can access
// /admin/profile and /admin/settings are accessible to all roles (linked from top-nav user menu)
const ALLOWED_ROUTES: Record<string, string[]> = {
  SUPER_ADMIN: ['/admin/dashboard', '/admin/users', '/admin/requests', '/admin/categories', '/admin/logs', '/admin/settings', '/admin/profile'],
  ADMIN:       ['/admin/dashboard', '/admin/users', '/admin/requests', '/admin/categories', '/admin/logs', '/admin/settings', '/admin/profile'],
  SUPPORT:     ['/admin/dashboard', '/admin/users', '/admin/requests', '/admin/settings', '/admin/profile'],
}

export function usePermissions() {
  const [adminLevel, setAdminLevel] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  useEffect(() => {
    const user = SessionManager.getUser()
    const subRole = user?.adminSubRole || null
    setAdminLevel(subRole)
    setMenuItems(subRole ? (MENU_BY_ROLE[subRole] ?? MENU_BY_ROLE.SUPPORT) : [])
  }, [])

  function canAccessRoute(path: string): boolean {
    if (!adminLevel) return false
    const allowed = ALLOWED_ROUTES[adminLevel] ?? []
    return allowed.some(r => path.startsWith(r))
  }

  return { adminLevel, menuItems, canAccessRoute }
}
