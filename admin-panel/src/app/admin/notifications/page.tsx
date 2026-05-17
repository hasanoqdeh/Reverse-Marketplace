'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  apiAdminGetNotifications, apiAdminGetNotificationStats,
  apiAdminSendNotification, apiAdminDeleteNotification,
  NotificationItem, NotifStats, GetAdminNotificationsParams,
} from '@/lib/adminAPI'
import { Bell, Send, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  SYSTEM: 'bg-gray-100 text-gray-700', REQUEST: 'bg-blue-100 text-blue-700',
  BID: 'bg-green-100 text-green-700', PAYMENT: 'bg-yellow-100 text-yellow-700',
  CHAT: 'bg-purple-100 text-purple-700', SECURITY: 'bg-red-100 text-red-700',
  SUBSCRIPTION: 'bg-cyan-100 text-cyan-700', MARKETING: 'bg-pink-100 text-pink-700',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600', PROCESSING: 'bg-blue-100 text-blue-600',
  SENT: 'bg-indigo-100 text-indigo-600', DELIVERED: 'bg-green-100 text-green-600',
  FAILED: 'bg-red-100 text-red-600', EXPIRED: 'bg-orange-100 text-orange-600',
  READ: 'bg-teal-100 text-teal-600',
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-gray-400', NORMAL: 'text-blue-500', HIGH: 'text-yellow-500', URGENT: 'text-red-500',
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Send Notification</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-3">
          {err && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{err}</p>}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">User ID (UUID)</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.userId} onChange={e => set('userId', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
            <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={form.content} onChange={e => set('content', e.target.value)} />
          </div>
          {[
            { label: 'Type',     key: 'type',     opts: ['SYSTEM','REQUEST','BID','PAYMENT','CHAT','SUBSCRIPTION','SECURITY','MARKETING'] },
            { label: 'Channel',  key: 'channel',  opts: ['IN_APP','PUSH','EMAIL','SMS','WEBHOOK'] },
            { label: 'Priority', key: 'priority', opts: ['LOW','NORMAL','HIGH','URGENT'] },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={(form as Record<string, string>)[f.key]} onChange={e => set(f.key, e.target.value)}>
                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="p-5 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={submit} disabled={sending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <Send className="h-4 w-4" />{sending ? 'Sending…' : 'Send'}
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">{total.toLocaleString()} total notifications</p>
        </div>
        <button onClick={() => setShowSend(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Send className="h-4 w-4" /> Send Notification
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total"     value={stats.total}        icon={Bell}          color="text-blue-600" />
          <StatCard label="Today"     value={stats.todayTotal}   icon={Clock}         color="text-purple-600" />
          <StatCard label="Unread"    value={stats.unreadTotal}  icon={AlertTriangle} color="text-yellow-500" />
          <StatCard label="Read Rate" value={`${stats.readRate}%`} icon={CheckCircle} color="text-green-600" />
        </div>
      )}

      {/* Breakdown panels */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">By Channel</h3>
            <div className="space-y-2">
              {stats.byChannel.map(r => (
                <div key={r.channel} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{r.channel}</span>
                  <span className="font-semibold">{r.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">By Type</h3>
            <div className="space-y-2">
              {stats.byType.map(r => (
                <div key={r.type} className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[r.type] ?? 'bg-gray-100 text-gray-700'}`}>{r.type}</span>
                  <span className="font-semibold">{r.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {([
          { label: 'Type',     key: 'type',     opts: ['SYSTEM','REQUEST','BID','PAYMENT','CHAT','SUBSCRIPTION','SECURITY','MARKETING'] },
          { label: 'Channel',  key: 'channel',  opts: ['IN_APP','PUSH','EMAIL','SMS','WEBHOOK'] },
          { label: 'Status',   key: 'status',   opts: ['PENDING','SENT','DELIVERED','FAILED','EXPIRED','READ'] },
          { label: 'Priority', key: 'priority', opts: ['LOW','NORMAL','HIGH','URGENT'] },
        ] as const).map(f => (
          <select key={f.key}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={(params as Record<string, string>)[f.key] ?? ''}
            onChange={e => setFilter(f.key, e.target.value)}>
            <option value="">{f.label}: All</option>
            {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No notifications found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Title / Content', 'User', 'Type', 'Channel', 'Priority', 'Status', 'Created', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notifications.map(n => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 truncate">{n.content}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">{n.userId.slice(0, 8)}…</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[n.type] ?? 'bg-gray-100 text-gray-700'}`}>{n.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{n.channel}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs font-bold ${PRIORITY_COLORS[n.priority]}`}>● {n.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[n.status] ?? 'bg-gray-100 text-gray-600'}`}>{n.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id}
                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {params.page ?? 1} of {totalPages} ({total.toLocaleString()} total)</p>
          <div className="flex gap-2">
            <button disabled={(params.page ?? 1) <= 1}
              onClick={() => setParams(p => ({ ...p, page: (p.page ?? 1) - 1 }))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
              Previous
            </button>
            <button disabled={(params.page ?? 1) >= totalPages}
              onClick={() => setParams(p => ({ ...p, page: (p.page ?? 1) + 1 }))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}

      {showSend && <SendModal onClose={() => setShowSend(false)} onSent={() => load()} />}
    </div>
  )
}
