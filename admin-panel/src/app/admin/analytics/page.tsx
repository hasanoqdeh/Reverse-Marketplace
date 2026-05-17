'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  apiGetAnalyticsOverview, apiGetUserAnalytics, apiGetRequestAnalytics,
  apiGetBidAnalytics, apiGetChatAnalytics, apiGetNotifAnalytics,
  OverviewStats, UserAnalyticsStats, RequestAnalyticsStats,
  BidAnalyticsStats, ChatAnalyticsStats, NotifAnalyticsStats, Trend,
} from '../../../lib/adminAPI'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

const chartStyle = {
  contentStyle: { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
}

function fmtNum(n: number | undefined | null) {
  if (n == null) return '—'
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(1)}k`
    : String(n)
}

function fmtPct(n: number | undefined | null) {
  return n == null ? '—' : `${n.toFixed(1)}%`
}

function StatCard({ label, value, sub, color = 'blue' }: {
  label: string; value: string | number; sub?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan'
}) {
  const cfg = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700' },
    green:  { bg: 'bg-green-50',  text: 'text-green-700' },
    yellow: { bg: 'bg-amber-50',  text: 'text-amber-700' },
    red:    { bg: 'bg-red-50',    text: 'text-red-700' },
    purple: { bg: 'bg-violet-50', text: 'text-violet-700' },
    cyan:   { bg: 'bg-cyan-50',   text: 'text-cyan-700' },
  }[color]
  return (
    <div className={`rounded-xl p-4 ${cfg.bg}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${cfg.text}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

function MiniTrend({ data, color = '#3B82F6' }: { data: Trend[]; color?: string }) {
  if (!data?.length) return <p className="text-xs text-slate-400 py-6 text-center">No trend data</p>
  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <Line type="monotone" dataKey="count" stroke={color} dot={false} strokeWidth={2} />
        <Tooltip contentStyle={chartStyle.contentStyle} formatter={(v: number) => [v, 'count']} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-100">{title}</h2>
      {children}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-600 mb-3">{title}</h3>
      {children}
    </div>
  )
}

const axisStyle = { fontSize: 11, fill: '#94a3b8' }
const gridStyle = { strokeDasharray: '3 3', stroke: '#f1f5f9' }

function TrendChart({ data, color }: { data: Trend[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={chartStyle.contentStyle} />
        <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function BarChartCard({ data, dataKey, colorFn }: { data: unknown[]; dataKey: string; colorFn?: (i: number) => string }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={24}>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis dataKey={dataKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={chartStyle.contentStyle} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {(data as unknown[]).map((_: unknown, i: number) => (
            <Cell key={i} fill={colorFn ? colorFn(i) : COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

const TABS = ['Overview', 'Users', 'Requests', 'Bids', 'Chat', 'Notifications'] as const
type Tab = (typeof TABS)[number]

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
      if (tab === 'Overview'      && !overview)   { const r = await apiGetAnalyticsOverview(); setOverview(r.overview) }
      else if (tab === 'Users'    && !users)       { const r = await apiGetUserAnalytics();    setUsers(r.stats) }
      else if (tab === 'Requests' && !requests)    { const r = await apiGetRequestAnalytics(); setRequests(r.stats) }
      else if (tab === 'Bids'     && !bids)        { const r = await apiGetBidAnalytics();     setBids(r.stats) }
      else if (tab === 'Chat'     && !chat)        { const r = await apiGetChatAnalytics();    setChat(r.stats) }
      else if (tab === 'Notifications' && !notifs) { const r = await apiGetNotifAnalytics();  setNotifs(r.stats) }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [overview, users, requests, bids, chat, notifs])

  useEffect(() => { fetchTab(activeTab) }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-5 sm:p-6 max-w-7xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform-wide statistics and trends</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-600" />
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      {/* Overview */}
      {!loading && activeTab === 'Overview' && overview && (
        <>
          <Section title="Platform Summary">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Users"         value={fmtNum(overview.users?.total)}         color="blue" />
              <StatCard label="Requests"      value={fmtNum(overview.requests?.total)}      color="green" />
              <StatCard label="Bids"          value={fmtNum(overview.bids?.total)}          color="yellow" />
              <StatCard label="Chat Rooms"    value={fmtNum(overview.chat?.totalRooms)}     color="purple" />
              <StatCard label="Messages"      value={fmtNum(overview.chat?.totalMessages)}  color="cyan" />
              <StatCard label="Notifications" value={fmtNum(overview.notifications?.total)} color="red" />
            </div>
          </Section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="New Users — 7 days"><MiniTrend data={overview.users?.trend ?? []} color="#3B82F6" /></ChartCard>
            <ChartCard title="New Requests — 7 days"><MiniTrend data={overview.requests?.trend ?? []} color="#10B981" /></ChartCard>
            <ChartCard title="New Bids — 7 days"><MiniTrend data={overview.bids?.trend ?? []} color="#F59E0B" /></ChartCard>
            <ChartCard title="Notifications — 7 days"><MiniTrend data={overview.notifications?.trend ?? []} color="#EF4444" /></ChartCard>
          </div>
        </>
      )}

      {/* Users */}
      {!loading && activeTab === 'Users' && users && (
        <Section title="User Statistics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatCard label="Total"    value={fmtNum(users.total)}    color="blue" />
            <StatCard label="Active"   value={fmtNum(users.active)}   color="green" />
            <StatCard label="Banned"   value={fmtNum(users.banned)}   color="red" />
            <StatCard label="New Today" value={fmtNum(users.newToday)} color="yellow" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {users.byRole?.length > 0 && (
              <ChartCard title="By Role">
                <BarChartCard data={users.byRole} dataKey="role" colorFn={i => COLORS[i % COLORS.length]} />
              </ChartCard>
            )}
            <ChartCard title="Registrations — 7 days">
              <TrendChart data={users.trend ?? []} color="#3B82F6" />
            </ChartCard>
          </div>
        </Section>
      )}

      {/* Requests */}
      {!loading && activeTab === 'Requests' && requests && (
        <Section title="Request Statistics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatCard label="Total"          value={fmtNum(requests.total)}            color="green" />
            <StatCard label="Total Views"    value={fmtNum(requests.totalViews)}       color="blue" />
            <StatCard label="Total Bids"     value={fmtNum(requests.totalBids)}        color="yellow" />
            <StatCard label="Avg Bids/Req"   value={requests.avgBidsPerRequest?.toFixed(1) ?? '—'} color="purple" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {requests.byStatus?.length > 0 && (
              <ChartCard title="By Status">
                <BarChartCard data={requests.byStatus} dataKey="status" />
              </ChartCard>
            )}
            <ChartCard title="New Requests — 7 days">
              <TrendChart data={requests.trend ?? []} color="#10B981" />
            </ChartCard>
            <ChartCard title="Views — 7 days">
              <TrendChart data={requests.viewTrend ?? []} color="#8B5CF6" />
            </ChartCard>
            {requests.topCategories?.length > 0 && (
              <ChartCard title="Top Categories">
                <div className="space-y-2 mt-1">
                  {requests.topCategories.slice(0, 5).map((c: { categoryId: string; count: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-mono text-xs truncate">{c.categoryId}</span>
                      <span className="font-semibold text-slate-900">{fmtNum(c.count)}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}
          </div>
        </Section>
      )}

      {/* Bids */}
      {!loading && activeTab === 'Bids' && bids && (
        <Section title="Bid Statistics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatCard label="Total Bids"      value={fmtNum(bids.total)}                                                     color="yellow" />
            <StatCard label="Conversion"      value={fmtPct(bids.conversionRate)}                                            color="green" />
            <StatCard label="Avg Amount"      value={bids.amount?.avg != null ? `$${Number(bids.amount.avg).toFixed(2)}` : '—'} color="blue" />
            <StatCard label="Avg Delivery"    value={bids.avgDeliveryDays != null ? `${Number(bids.avgDeliveryDays).toFixed(1)}d` : '—'} color="purple" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bids.byStatus?.length > 0 && (
              <ChartCard title="By Status">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={bids.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70}
                      label={({ status, percent }: { status: string; percent: number }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}>
                      {bids.byStatus.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={chartStyle.contentStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
            <ChartCard title="New Bids — 7 days">
              <TrendChart data={bids.trend ?? []} color="#F59E0B" />
            </ChartCard>
            {bids.amount && (
              <ChartCard title="Bid Amounts">
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { l: 'Min', v: bids.amount.min, c: 'bg-slate-50 text-slate-700' },
                    { l: 'Avg', v: bids.amount.avg, c: 'bg-blue-50 text-blue-700' },
                    { l: 'Max', v: bids.amount.max, c: 'bg-slate-50 text-slate-700' },
                  ].map(({ l, v, c }) => (
                    <div key={l} className={`text-center p-3 rounded-xl ${c}`}>
                      <p className="text-xs text-slate-500">{l}</p>
                      <p className="text-lg font-bold mt-0.5">${v != null ? Number(v).toFixed(2) : '—'}</p>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}
            {bids.topMerchants?.length > 0 && (
              <ChartCard title="Top Merchants by Bids">
                <div className="space-y-2 mt-1">
                  {bids.topMerchants.slice(0, 5).map((m: { merchantId: string; count: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-xs text-slate-500">{m.merchantId.slice(0, 12)}…</span>
                      <span className="font-semibold text-slate-900">{m.count} bids</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}
          </div>
        </Section>
      )}

      {/* Chat */}
      {!loading && activeTab === 'Chat' && chat && (
        <Section title="Chat Statistics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatCard label="Total Rooms"   value={fmtNum(chat.rooms?.total)}    color="purple" />
            <StatCard label="Active Rooms"  value={fmtNum(chat.rooms?.active)}   color="green" />
            <StatCard label="Total Messages" value={fmtNum(chat.messages?.total)} color="cyan" />
            <StatCard label="Deleted Msgs"  value={fmtNum(chat.messages?.deleted)} color="red" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {chat.rooms?.byType?.length > 0 && (
              <ChartCard title="Rooms by Type">
                <BarChartCard data={chat.rooms.byType} dataKey="type" colorFn={() => '#8B5CF6'} />
              </ChartCard>
            )}
            {chat.messages?.byType?.length > 0 && (
              <ChartCard title="Messages by Type">
                <BarChartCard data={chat.messages.byType} dataKey="type" colorFn={() => '#06B6D4'} />
              </ChartCard>
            )}
            <ChartCard title="Messages per Day — 7 days">
              <TrendChart data={chat.messages?.trend ?? []} color="#06B6D4" />
            </ChartCard>
          </div>
        </Section>
      )}

      {/* Notifications */}
      {!loading && activeTab === 'Notifications' && notifs && (
        <Section title="Notification Statistics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatCard label="Total Sent" value={fmtNum(notifs.total)}        color="blue" />
            <StatCard label="Unread"     value={fmtNum(notifs.unreadTotal)}  color="yellow" />
            <StatCard label="Read Rate"  value={fmtPct(notifs.readRate)}     color="green" />
            <StatCard label="Today"      value={fmtNum(notifs.todayTotal)}   color="purple" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {notifs.byChannel?.length > 0 && (
              <ChartCard title="By Channel">
                <BarChartCard data={notifs.byChannel} dataKey="channel" colorFn={() => '#3B82F6'} />
              </ChartCard>
            )}
            {notifs.byType?.length > 0 && (
              <ChartCard title="By Type">
                <BarChartCard data={notifs.byType} dataKey="type" />
              </ChartCard>
            )}
            {notifs.byPriority?.length > 0 && (
              <ChartCard title="By Priority">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={notifs.byPriority} dataKey="count" nameKey="priority" cx="50%" cy="50%" outerRadius={65}
                      label={({ priority, percent }: { priority: string; percent: number }) => `${priority} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}>
                      {notifs.byPriority.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={chartStyle.contentStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
            <ChartCard title="Sent per Day — 7 days">
              <TrendChart data={notifs.trend ?? []} color="#8B5CF6" />
            </ChartCard>
          </div>
        </Section>
      )}
    </div>
  )
}
