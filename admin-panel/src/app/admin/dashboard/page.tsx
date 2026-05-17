'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiGetDashboardMetrics, DashboardMetrics, apiAdminGetNotificationAnalytics, NotifStats } from '@/lib/adminAPI'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, ShieldCheck, Clock, AlertTriangle, CheckCircle, Phone, Bell, TrendingUp, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [trend, setTrend] = useState<{ date: string; count: number }[]>([])
  const [notifStats, setNotifStats] = useState<NotifStats | null>(null)
  const [notifTrend, setNotifTrend] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      apiGetDashboardMetrics(),
      apiAdminGetNotificationAnalytics().catch(() => null),
    ]).then(([res, notifRes]) => {
      setMetrics(res.metrics)
      setTrend(res.trends.userRegistrations)
      if (notifRes) {
        setNotifStats(notifRes.stats)
        setNotifTrend(notifRes.stats.trend ?? [])
      }
    }).catch(() => setError('Failed to load dashboard metrics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />
  if (error) return (
    <div className="p-6">
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    </div>
  )
  if (!metrics) return null

  const userCards = [
    { label: 'Total Users',   value: metrics.users.total,       icon: Users,       bg: 'bg-blue-50',   iconColor: 'text-blue-600',   trend: null },
    { label: 'Active Users',  value: metrics.users.active,      icon: CheckCircle, bg: 'bg-green-50',  iconColor: 'text-green-600',  trend: null },
    { label: 'New Today',     value: metrics.users.newToday,    icon: Clock,       bg: 'bg-violet-50', iconColor: 'text-violet-600', trend: null },
    { label: 'New This Week', value: metrics.users.newThisWeek, icon: TrendingUp,  bg: 'bg-amber-50',  iconColor: 'text-amber-600',  trend: null },
  ]

  const authCards = [
    { label: 'Login Attempts', value: metrics.authentication.loginAttemptsToday,   icon: Phone,         bg: 'bg-blue-50',   iconColor: 'text-blue-600' },
    { label: 'Successful',     value: metrics.authentication.successfulLoginsToday, icon: CheckCircle,   bg: 'bg-green-50',  iconColor: 'text-green-600' },
    { label: 'Failed',         value: metrics.authentication.failedLoginsToday,     icon: AlertTriangle, bg: 'bg-red-50',    iconColor: 'text-red-600' },
    { label: 'OTPs Sent',      value: metrics.authentication.otpSentToday,          icon: ShieldCheck,   bg: 'bg-violet-50', iconColor: 'text-violet-600' },
  ]

  const roleColorMap: Record<string, { bg: string; text: string; dot: string }> = {
    BUYER:    { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
    MERCHANT: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
    ADMIN:    { bg: 'bg-slate-100', text: 'text-slate-700',  dot: 'bg-slate-500' },
  }

  return (
    <div className="p-5 sm:p-6 space-y-6 max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of your marketplace platform.</p>
      </div>

      {/* User Stats */}
      <section>
        <SectionHeader title="Users" href="/admin/users" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {userCards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* Role breakdown + Registration trend */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Role Breakdown */}
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(metrics.users.byRole).map(([role, count]) => {
              const colors = roleColorMap[role] ?? { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' }
              const pct = metrics.users.total > 0 ? Math.round((count / metrics.users.total) * 100) : 0
              return (
                <div key={role}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                      <span className="text-sm font-medium text-slate-700 capitalize">{role.toLowerCase()}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors.dot}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Registration Trend */}
        {trend.length > 0 && (
          <Card className="lg:col-span-2 border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Registrations — Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trend.map(d => ({ ...d, date: format(new Date(d.date), 'MMM d') }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Auth Stats */}
      <section>
        <SectionHeader title="Authentication — Today" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {authCards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* Notifications */}
      {notifStats && (
        <section>
          <SectionHeader title="Notifications" href="/admin/notifications" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            <StatCard label="Total Sent"  value={notifStats.total}       icon={Bell}          bg="bg-blue-50"   iconColor="text-blue-600" />
            <StatCard label="Today"       value={notifStats.todayTotal}  icon={Clock}         bg="bg-violet-50" iconColor="text-violet-600" />
            <StatCard label="Unread"      value={notifStats.unreadTotal} icon={AlertTriangle} bg="bg-amber-50"  iconColor="text-amber-600" />
            <StatCard label="Read Rate"   value={notifStats.readRate as unknown as number}    icon={CheckCircle} bg="bg-green-50" iconColor="text-green-600" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-slate-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">By Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={notifStats.byChannel} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="channel" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {notifTrend.length > 0 && (
              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">Trend — Last 7 Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={notifTrend.map(d => ({ ...d, date: format(new Date(d.date), 'MMM d') }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                      <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}

function StatCard({
  label, value, icon: Icon, bg, iconColor,
}: {
  label: string; value: number; icon: React.ElementType; bg: string; iconColor: string;
}) {
  return (
    <Card className="border-slate-200 shadow-none hover:shadow-sm transition-shadow">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value.toLocaleString()}</p>
          </div>
          <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-4.5 w-4.5 ${iconColor}`} style={{width:'18px',height:'18px'}} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-5 sm:p-6 space-y-6 max-w-7xl animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-32" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-48 bg-slate-200 rounded-xl" />
        <div className="lg:col-span-2 h-48 bg-slate-200 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
      </div>
    </div>
  )
}
