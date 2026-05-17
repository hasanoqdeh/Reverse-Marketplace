'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '../../../components/layout/AdminLayout'
import {
  apiGetAnalyticsOverview,
  apiGetUserAnalytics,
  apiGetRequestAnalytics,
  apiGetBidAnalytics,
  apiGetChatAnalytics,
  apiGetNotifAnalytics,
  OverviewStats,
  UserAnalyticsStats,
  RequestAnalyticsStats,
  BidAnalyticsStats,
  ChatAnalyticsStats,
  NotifAnalyticsStats,
  Trend,
} from '../../../lib/adminAPI'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

function fmtNum(n: number | undefined | null) {
  if (n == null) return '—'
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}k`
    : String(n)
}

function fmtPct(n: number | undefined | null) {
  if (n == null) return '—'
  return `${n.toFixed(1)}%`
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color = 'blue',
}: {
  label: string
  value: string | number
  sub?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan'
}) {
  const bg: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
    cyan: 'bg-cyan-50 border-cyan-200',
  }
  const text: Record<string, string> = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700',
    purple: 'text-purple-700',
    cyan: 'text-cyan-700',
  }
  return (
    <div className={`rounded-lg border p-4 ${bg[color]}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${text[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

// ─── MiniTrendChart ───────────────────────────────────────────────────────────

function MiniTrend({ data, dataKey = 'count', color = '#3B82F6' }: { data: Trend[]; dataKey?: string; color?: string }) {
  if (!data || data.length === 0) return <p className="text-xs text-gray-400 mt-2">No trend data</p>
  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <Line type="monotone" dataKey={dataKey} stroke={color} dot={false} strokeWidth={2} />
        <Tooltip
          labelFormatter={(l) => l}
          formatter={(v: number) => [v, dataKey]}
          contentStyle={{ fontSize: 11 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">{title}</h2>
      {children}
    </div>
  )
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Users', 'Requests', 'Bids', 'Chat', 'Notifications'] as const
type Tab = (typeof TABS)[number]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [users, setUsers] = useState<UserAnalyticsStats | null>(null)
  const [requests, setRequests] = useState<RequestAnalyticsStats | null>(null)
  const [bids, setBids] = useState<BidAnalyticsStats | null>(null)
  const [chat, setChat] = useState<ChatAnalyticsStats | null>(null)
  const [notifs, setNotifs] = useState<NotifAnalyticsStats | null>(null)

  const fetchTab = useCallback(async (tab: Tab) => {
    setLoading(true)
    setError(null)
    try {
      switch (tab) {
        case 'Overview': {
          if (!overview) {
            const res = await apiGetAnalyticsOverview()
            setOverview(res.overview)
          }
          break
        }
        case 'Users': {
          if (!users) {
            const res = await apiGetUserAnalytics()
            setUsers(res.stats)
          }
          break
        }
        case 'Requests': {
          if (!requests) {
            const res = await apiGetRequestAnalytics()
            setRequests(res.stats)
          }
          break
        }
        case 'Bids': {
          if (!bids) {
            const res = await apiGetBidAnalytics()
            setBids(res.stats)
          }
          break
        }
        case 'Chat': {
          if (!chat) {
            const res = await apiGetChatAnalytics()
            setChat(res.stats)
          }
          break
        }
        case 'Notifications': {
          if (!notifs) {
            const res = await apiGetNotifAnalytics()
            setNotifs(res.stats)
          }
          break
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [overview, users, requests, bids, chat, notifs])

  useEffect(() => {
    fetchTab(activeTab)
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide statistics and trends</p>
        </div>

        {/* Tab bar */}
        <div className="flex space-x-1 mb-6 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                activeTab === tab
                  ? 'bg-white border border-b-white border-gray-200 text-blue-700 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm mb-4">{error}</div>
        )}

        {/* ── Overview ── */}
        {!loading && activeTab === 'Overview' && overview && (
          <>
            <Section title="Platform Summary">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard label="Total Users" value={fmtNum(overview.users?.total)} color="blue" />
                <StatCard label="Total Requests" value={fmtNum(overview.requests?.total)} color="green" />
                <StatCard label="Total Bids" value={fmtNum(overview.bids?.total)} color="yellow" />
                <StatCard label="Chat Rooms" value={fmtNum(overview.chat?.totalRooms)} color="purple" />
                <StatCard label="Messages" value={fmtNum(overview.chat?.totalMessages)} color="cyan" />
                <StatCard label="Notifications" value={fmtNum(overview.notifications?.total)} color="red" />
              </div>
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">New Users (7 days)</h3>
                <MiniTrend data={overview.users?.trend ?? []} color="#3B82F6" />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">New Requests (7 days)</h3>
                <MiniTrend data={overview.requests?.trend ?? []} color="#10B981" />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">New Bids (7 days)</h3>
                <MiniTrend data={overview.bids?.trend ?? []} color="#F59E0B" />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Notifications (7 days)</h3>
                <MiniTrend data={overview.notifications?.trend ?? []} color="#EF4444" />
              </div>
            </div>
          </>
        )}

        {/* ── Users ── */}
        {!loading && activeTab === 'Users' && users && (
          <>
            <Section title="User Statistics">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Users" value={fmtNum(users.total)} color="blue" />
                <StatCard label="Active" value={fmtNum(users.active)} color="green" />
                <StatCard label="Banned" value={fmtNum(users.banned)} color="red" />
                <StatCard label="New Today" value={fmtNum(users.newToday)} color="yellow" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {users.byRole && users.byRole.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">By Role</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={users.byRole}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="role" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">New Registrations (7 days)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={users.trend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ── Requests ── */}
        {!loading && activeTab === 'Requests' && requests && (
          <>
            <Section title="Request Statistics">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Requests" value={fmtNum(requests.total)} color="green" />
                <StatCard label="Total Views" value={fmtNum(requests.totalViews)} color="blue" />
                <StatCard label="Total Bids" value={fmtNum(requests.totalBids)} color="yellow" />
                <StatCard label="Avg Bids/Request" value={requests.avgBidsPerRequest?.toFixed(1) ?? '—'} color="purple" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requests.byStatus && requests.byStatus.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">By Status</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={requests.byStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {requests.byStatus.map((_: unknown, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">New Requests (7 days)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={requests.trend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {requests.topCategories && requests.topCategories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Categories</h3>
                    <div className="space-y-2">
                      {requests.topCategories.slice(0, 5).map((c: { categoryId: string; count: number }, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-mono text-xs">{c.categoryId}</span>
                          <span className="font-semibold text-gray-900">{fmtNum(c.count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Views (7 days)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={requests.viewTrend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ── Bids ── */}
        {!loading && activeTab === 'Bids' && bids && (
          <>
            <Section title="Bid Statistics">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Bids" value={fmtNum(bids.total)} color="yellow" />
                <StatCard label="Conversion Rate" value={fmtPct(bids.conversionRate)} color="green" />
                <StatCard label="Avg Amount" value={bids.amount?.avg != null ? `$${Number(bids.amount.avg).toFixed(2)}` : '—'} color="blue" />
                <StatCard label="Avg Delivery" value={bids.avgDeliveryDays != null ? `${Number(bids.avgDeliveryDays).toFixed(1)}d` : '—'} color="purple" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bids.byStatus && bids.byStatus.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">By Status</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={bids.byStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ status, percent }: { status: string; percent: number }) =>
                            `${status} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {bids.byStatus.map((_: unknown, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">New Bids (7 days)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={bids.trend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {bids.amount && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Bid Amounts</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Min</p>
                        <p className="text-lg font-bold text-gray-800">${bids.amount.min != null ? Number(bids.amount.min).toFixed(2) : '—'}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="text-xs text-gray-500">Avg</p>
                        <p className="text-lg font-bold text-blue-700">${bids.amount.avg != null ? Number(bids.amount.avg).toFixed(2) : '—'}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Max</p>
                        <p className="text-lg font-bold text-gray-800">${bids.amount.max != null ? Number(bids.amount.max).toFixed(2) : '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {bids.topMerchants && bids.topMerchants.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Merchants by Bids</h3>
                    <div className="space-y-2">
                      {bids.topMerchants.slice(0, 5).map((m: { merchantId: string; count: number }, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-mono text-xs">{m.merchantId}</span>
                          <span className="font-semibold text-gray-900">{m.count} bids</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </>
        )}

        {/* ── Chat ── */}
        {!loading && activeTab === 'Chat' && chat && (
          <>
            <Section title="Chat Statistics">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Rooms" value={fmtNum(chat.rooms?.total)} color="purple" />
                <StatCard label="Active Rooms" value={fmtNum(chat.rooms?.active)} color="green" />
                <StatCard label="Total Messages" value={fmtNum(chat.messages?.total)} color="cyan" />
                <StatCard label="Deleted Msgs" value={fmtNum(chat.messages?.deleted)} color="red" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {chat.rooms?.byType && chat.rooms.byType.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Rooms by Type</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chat.rooms.byType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {chat.messages?.byType && chat.messages.byType.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Messages by Type</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chat.messages.byType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="lg:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Messages per Day (7 days)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chat.messages?.trend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#06B6D4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ── Notifications ── */}
        {!loading && activeTab === 'Notifications' && notifs && (
          <>
            <Section title="Notification Statistics">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Sent" value={fmtNum(notifs.total)} color="blue" />
                <StatCard label="Unread" value={fmtNum(notifs.unreadTotal)} color="yellow" />
                <StatCard label="Read Rate" value={fmtPct(notifs.readRate)} color="green" />
                <StatCard label="Sent Today" value={fmtNum(notifs.todayTotal)} color="purple" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {notifs.byChannel && notifs.byChannel.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">By Channel</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={notifs.byChannel}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {notifs.byType && notifs.byType.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">By Type</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={notifs.byType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {notifs.byType.map((_: unknown, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {notifs.byPriority && notifs.byPriority.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">By Priority</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={notifs.byPriority}
                          dataKey="count"
                          nameKey="priority"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label={({ priority, percent }: { priority: string; percent: number }) =>
                            `${priority} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {notifs.byPriority.map((_: unknown, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Sent per Day (7 days)</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={notifs.trend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Section>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
