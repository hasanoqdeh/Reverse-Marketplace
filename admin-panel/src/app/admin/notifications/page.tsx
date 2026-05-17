'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  apiAdminGetNotifications, apiAdminGetNotificationStats,
  apiAdminSendNotification, apiAdminDeleteNotification,
  NotificationItem, NotifStats, GetAdminNotificationsParams,
} from '@/lib/adminAPI'
import { Bell, Send, Trash2, CheckCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  SYSTEM: 'bg-slate-100 text-slate-700', REQUEST: 'bg-blue-100 text-blue-700',
  BID: 'bg-green-100 text-green-700', PAYMENT: 'bg-yellow-100 text-yellow-700',
  CHAT: 'bg-violet-100 text-violet-700', SECURITY: 'bg-red-100 text-red-700',
  SUBSCRIPTION: 'bg-cyan-100 text-cyan-700', MARKETING: 'bg-pink-100 text-pink-700',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-600', PROCESSING: 'bg-blue-100 text-blue-600',
  SENT: 'bg-indigo-100 text-indigo-600', DELIVERED: 'bg-green-100 text-green-600',
  FAILED: 'bg-red-100 text-red-600', EXPIRED: 'bg-orange-100 text-orange-600',
  READ: 'bg-teal-100 text-teal-600',
}

const PRIORITY_DOT: Record<string, string> = {
  LOW: 'bg-slate-300', NORMAL: 'bg-blue-500', HIGH: 'bg-amber-500', URGENT: 'bg-red-500',
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const fieldCls = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"

function SendModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [form, setForm] = useState({
    userId: '', type: 'SYSTEM', title: '', content: '', channel: 'IN_APP', priority: 'NORMAL',
  })
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    if (!form.userId || !form.title || !form.content) { setErr('User ID, title and content are required'); return }
    setSending(true)
    try { await apiAdminSendNotification(form); onSent(); onClose() }
    catch (e: unknown) { setErr((e as Error).message || 'Send failed') }
    finally { setSending(false) }
  }

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Send Notification</h2>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none">×</button>
        </div>
        <div className="p-5 space-y-3.5">
          {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
          <FormField label="User ID (UUID)">
            <input className={fieldCls} value={form.userId} onChange={e => set('userId', e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          </FormField>
          <FormField label="Title">
            <input className={fieldCls} value={form.title} onChange={e => set('title', e.target.value)} />
          </FormField>
          <FormField label="Content">
            <textarea rows={3} className={`${fieldCls} resize-none`} value={form.content} onChange={e => set('content', e.target.value)} />
          </FormField>
          {([
            { label: 'Type',     key: 'type',     opts: ['SYSTEM','REQUEST','BID','PAYMENT','CHAT','SUBSCRIPTION','SECURITY','MARKETING'] },
            { label: 'Channel',  key: 'channel',  opts: ['IN_APP','PUSH','EMAIL','SMS','WEBHOOK'] },
            { label: 'Priority', key: 'priority', opts: ['LOW','NORMAL','HIGH','URGENT'] },
          ] as const).map(f => (
            <FormField key={f.key} label={f.label}>
              <select className={fieldCls} value={(form as Record<string, string>)[f.key]} onChange={e => set(f.key, e.target.value)}>
                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </FormField>
          ))}
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button
            onClick={submit}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [stats, setStats] = useState<NotifStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState<GetAdminNotificationsParams>({ page: 1, limit: 20 })
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [showSend, setShowSend] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async (p = params) => {
    setLoading(true)
    try {
      const [nr, sr] = await Promise.all([apiAdminGetNotifications(p), apiAdminGetNotificationStats()])
      setNotifications(nr.notifications)
      setTotal(nr.pagination.total)
      setTotalPages(nr.pagination.totalPages)
      setStats(sr.stats)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [params])

  useEffect(() => { load() }, [params])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return
    setDeleting(id)
    await apiAdminDeleteNotification(id).catch(() => null)
    setNotifications(prev => prev.filter(n => n.id !== id))
    setDeleting(null)
  }

  const setFilter = (key: keyof GetAdminNotificationsParams, val: string) =>
    setParams(p => ({ ...p, page: 1, [key]: val || undefined }))

  const currentPage = params.page ?? 1
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * (params.limit ?? 20) + 1
  const rangeEnd = Math.min(currentPage * (params.limit ?? 20), total)

  return (
    <div className="p-5 sm:p-6 space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total.toLocaleString()} total notifications</p>
        </div>
        <button
          onClick={() => setShowSend(true)}
          className="flex items-center gap-2 px-4 h-9 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
        >
          <Send className="h-3.5 w-3.5" /> Send Notification
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Sent', value: stats.total,       icon: Bell,          bg: 'bg-blue-50',   iconColor: 'text-blue-600' },
            { label: 'Today',      value: stats.todayTotal,  icon: Clock,         bg: 'bg-violet-50', iconColor: 'text-violet-600' },
            { label: 'Unread',     value: stats.unreadTotal, icon: AlertTriangle, bg: 'bg-amber-50',  iconColor: 'text-amber-600' },
            { label: 'Read Rate',  value: `${stats.readRate}%`, icon: CheckCircle, bg: 'bg-green-50', iconColor: 'text-green-600' },
          ].map(({ label, value, icon: Icon, bg, iconColor }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </p>
                </div>
                <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Breakdown panels */}
      {stats && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: 'By Channel', rows: stats.byChannel.map(r => ({ key: r.channel, count: r.count, label: r.channel })) },
            { title: 'By Type',    rows: stats.byType.map(r => ({ key: r.type, count: r.count, label: r.type, badge: TYPE_COLORS[r.type] })) },
          ].map(panel => (
            <div key={panel.title} className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">{panel.title}</h3>
              <div className="space-y-2">
                {panel.rows.map(r => (
                  <div key={r.key} className="flex items-center justify-between text-sm">
                    {'badge' in r && r.badge
                      ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.badge}`}>{r.label}</span>
                      : <span className="text-slate-600">{r.label}</span>
                    }
                    <span className="font-semibold text-slate-900">{r.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5">
        {([
          { label: 'Type',     key: 'type',     opts: ['SYSTEM','REQUEST','BID','PAYMENT','CHAT','SUBSCRIPTION','SECURITY','MARKETING'] },
          { label: 'Channel',  key: 'channel',  opts: ['IN_APP','PUSH','EMAIL','SMS','WEBHOOK'] },
          { label: 'Status',   key: 'status',   opts: ['PENDING','SENT','DELIVERED','FAILED','EXPIRED','READ'] },
          { label: 'Priority', key: 'priority', opts: ['LOW','NORMAL','HIGH','URGENT'] },
        ] as const).map(f => (
          <select
            key={f.key}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={(params as Record<string, string>)[f.key] ?? ''}
            onChange={e => setFilter(f.key, e.target.value)}
          >
            <option value="">{f.label}: All</option>
            {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Title / Content', 'User', 'Type', 'Channel', 'Priority', 'Status', 'Created', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No notifications found</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : notifications.map(n => (
                <tr key={n.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-sm font-medium text-slate-900 truncate">{n.title}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{n.content}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">{n.userId.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[n.type] ?? 'bg-slate-100 text-slate-700'}`}>{n.type}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{n.channel}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[n.priority] ?? 'bg-slate-300'}`} />
                      <span className="text-xs text-slate-600">{n.priority}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[n.status] ?? 'bg-slate-100 text-slate-600'}`}>{n.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(n.id)}
                      disabled={deleting === n.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && notifications.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-500">
              Showing <span className="font-medium text-slate-700">{rangeStart}–{rangeEnd}</span> of <span className="font-medium text-slate-700">{total.toLocaleString()}</span>
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setParams(p => ({ ...p, page: (p.page ?? 1) - 1 }))}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              ><ChevronLeft className="h-4 w-4" /></button>
              <div className="flex items-center px-3 h-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700">
                {currentPage} / {totalPages}
              </div>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setParams(p => ({ ...p, page: (p.page ?? 1) + 1 }))}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              ><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {showSend && <SendModal onClose={() => setShowSend(false)} onSent={() => load()} />}
    </div>
  )
}
