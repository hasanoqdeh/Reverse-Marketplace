'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Bell, Globe, Lock, Info } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <SecuritySettings />
      <NotificationSettings />
      <SystemInfo />
    </div>
  )
}

// ─── Security ────────────────────────────────────────────────────────────────

function SecuritySettings() {
  const settings = [
    { label: 'Session Timeout',        value: '8 hours' },
    { label: 'Max Concurrent Sessions', value: '5 devices' },
    { label: 'OTP Expiry',             value: '10 minutes' },
    { label: 'OTP Max Attempts',       value: '3 per code' },
    { label: 'Max Failed Logins',      value: '5 before lockout' },
    { label: 'Lockout Duration',       value: '30 min → 60 → 4h → 24h' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Lock className="h-4 w-4 text-gray-400" />
          Security Policy
        </CardTitle>
        <p className="text-xs text-gray-400 mt-0.5">Configured via environment variables on the server</p>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-100">
          {settings.map(({ label, value }) => (
            <li key={label} className="flex items-center justify-between py-3 text-sm">
              <span className="text-gray-600">{label}</span>
              <span className="font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded text-xs">{value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// ─── Notifications ───────────────────────────────────────────────────────────

function NotificationSettings() {
  const [prefs, setPrefs] = useState(() => {
    if (typeof window === 'undefined') return { loginAlerts: true, suspendAlerts: true, systemAlerts: true }
    try {
      const stored = localStorage.getItem('admin_notification_prefs')
      return stored ? JSON.parse(stored) : { loginAlerts: true, suspendAlerts: true, systemAlerts: true }
    } catch {
      return { loginAlerts: true, suspendAlerts: true, systemAlerts: true }
    }
  })

  const toggle = (key: keyof typeof prefs) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    localStorage.setItem('admin_notification_prefs', JSON.stringify(next))
  }

  const items: { key: keyof typeof prefs; label: string; description: string }[] = [
    { key: 'loginAlerts',   label: 'Login Alerts',   description: 'Notify on suspicious login attempts' },
    { key: 'suspendAlerts', label: 'User Actions',   description: 'Notify when users are suspended or banned' },
    { key: 'systemAlerts',  label: 'System Alerts',  description: 'Critical infrastructure or error alerts' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-400" />
          Notification Preferences
        </CardTitle>
        <p className="text-xs text-gray-400 mt-0.5">Saved locally in your browser</p>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-100">
          {items.map(({ key, label, description }) => (
            <li key={key} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              <Toggle enabled={prefs[key]} onToggle={() => toggle(key)} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// ─── System Info ─────────────────────────────────────────────────────────────

function SystemInfo() {
  const rows = [
    { label: 'API Endpoint',   value: API_URL },
    { label: 'Environment',    value: process.env.NODE_ENV ?? 'development' },
    { label: 'Admin Panel',    value: 'Next.js 14 App Router' },
    { label: 'Auth',           value: 'JWT (phone + OTP)' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Info className="h-4 w-4 text-gray-400" />
          System Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-100">
          {rows.map(({ label, value }) => (
            <li key={label} className="flex items-start justify-between gap-4 py-3 text-sm">
              <span className="text-gray-500 whitespace-nowrap">{label}</span>
              <span className="font-mono text-xs text-gray-700 text-right break-all">{value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
