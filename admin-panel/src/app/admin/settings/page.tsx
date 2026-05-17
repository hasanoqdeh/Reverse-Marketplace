'use client'

import { useState } from 'react'
import { Bell, Lock, Info } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

function SectionCard({ icon: Icon, title, subtitle, children }: {
  icon: React.ElementType; title: string; subtitle?: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-5 divide-y divide-slate-100">
        {children}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="p-5 sm:p-6 space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform configuration and preferences.</p>
      </div>

      <SecuritySettings />
      <NotificationSettings />
      <SystemInfo />
    </div>
  )
}

function SecuritySettings() {
  const settings = [
    { label: 'Session Timeout',         value: '8 hours' },
    { label: 'Max Concurrent Sessions', value: '5 devices' },
    { label: 'OTP Expiry',              value: '10 minutes' },
    { label: 'OTP Max Attempts',        value: '3 per code' },
    { label: 'Max Failed Logins',       value: '5 before lockout' },
    { label: 'Lockout Duration',        value: '30 min → 60 → 4h → 24h' },
  ]

  return (
    <SectionCard icon={Lock} title="Security Policy" subtitle="Configured via environment variables on the server">
      {settings.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between py-3 text-sm">
          <span className="text-slate-600">{label}</span>
          <code className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">{value}</code>
        </div>
      ))}
    </SectionCard>
  )
}

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
    <SectionCard icon={Bell} title="Notification Preferences" subtitle="Saved locally in your browser">
      {items.map(({ key, label, description }) => (
        <div key={String(key)} className="flex items-center justify-between py-3.5">
          <div>
            <p className="text-sm font-medium text-slate-800">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          </div>
          <Toggle enabled={prefs[key]} onToggle={() => toggle(key)} />
        </div>
      ))}
    </SectionCard>
  )
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-slate-200'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
        enabled ? 'translate-x-4' : 'translate-x-0.5'
      }`} />
    </button>
  )
}

function SystemInfo() {
  const rows = [
    { label: 'API Endpoint', value: API_URL },
    { label: 'Environment',  value: process.env.NODE_ENV ?? 'development' },
    { label: 'Admin Panel',  value: 'Next.js 14 App Router' },
    { label: 'Auth',         value: 'JWT (phone + OTP)' },
  ]

  return (
    <SectionCard icon={Info} title="System Information">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-start justify-between gap-4 py-3 text-sm">
          <span className="text-slate-500 whitespace-nowrap shrink-0">{label}</span>
          <code className="font-mono text-xs text-slate-700 text-right break-all">{value}</code>
        </div>
      ))}
    </SectionCard>
  )
}
