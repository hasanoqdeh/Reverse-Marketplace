'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiGetDashboardMetrics, DashboardMetrics, apiAdminGetNotificationAnalytics, NotifStats } from '@/lib/adminAPI'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, ShieldCheck, Clock, AlertTriangle, CheckCircle, Phone, Bell } from 'lucide-react'
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
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!metrics) return null

  const userCards = [
    { label: 'Total Users',     value: metrics.users.total,       icon: Users,        color: 'text-blue-600' },
    { label: 'Active Users',    value: metrics.users.active,      icon: CheckCircle,  color: 'text-green-600' },
    { label: 'New Today',       value: metrics.users.newToday,    icon: Clock,        color: 'text-purple-600' },
    { label: 'New This Week',   value: metrics.users.newThisWeek, icon: ShieldCheck,  color: 'text-orange-600' },
  ]

  const authCards = [
    { label: 'Login Attempts Today',  value: metrics.authentication.loginAttemptsToday,  icon: Phone,          color: 'text-blue-600' },
    { label: 'Successful Logins',     value: metrics.authentication.successfulLoginsToday, icon: CheckCircle,  color: 'text-green-600' },
    { label: 'Failed Logins',         value: metrics.authentication.failedLoginsToday,    icon: AlertTriangle, color: 'text-red-600' },
    { label: 'OTP Sent Today',        value: metrics.authentication.otpSentToday,         icon: Phone,         color: 'text-purple-600' },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* User Stats */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Users</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {userCards.map(c => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>
      </section>

      {/* Role breakdown */}
      <section className="grid gap-4 sm:grid-cols-3">
        {Object.entries(metrics.users.byRole).map(([role, count]) => (
          <Card key={role}>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 uppercase">{role}</p>
              <p className="text-2xl font-bold mt-1">{count}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Auth Stats */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Authentication — Today</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {authCards.map(c => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>
      </section>

      {/* Registration Trend */}
      {trend.length > 0 && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Registrations — Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend.map(d => ({ ...d, date: format(new Date(d.date), 'MMM d') }))}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Notifications section */}
      {notifStats && (
        <>
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Notifications</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Sent"  value={notifStats.total}       icon={Bell}          color="text-blue-600" />
              <StatCard label="Today"       value={notifStats.todayTotal}  icon={Clock}         color="text-purple-600" />
              <StatCard label="Unread"      value={notifStats.unreadTotal} icon={AlertTriangle} color="text-yellow-500" />
              <StatCard label="Read Rate"   value={notifStats.readRate as unknown as number}   icon={CheckCircle}   color="text-green-600" />
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold text-gray-700">Notifications by Channel</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={notifStats.byChannel}>
                    <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {notifTrend.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm font-semibold text-gray-700">Notifications — Last 7 Days</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={notifTrend.map(d => ({ ...d, date: format(new Date(d.date), 'MMM d') }))}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-lg" />
    </div>
  )
}
