'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  apiGetAdminRequests, apiUpdateRequestStatus, apiDeleteRequest, apiTriggerExpiry,
  RequestItem, RequestAnalytics, GetAdminRequestsParams,
} from '@/lib/adminAPI'
import { format } from 'date-fns'
import { Search, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, FileText, CheckCircle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'bg-slate-100 text-slate-700 ring-slate-200',
  ACTIVE:    'bg-green-100 text-green-700 ring-green-200',
  HAS_BIDS:  'bg-blue-100 text-blue-700 ring-blue-200',
  COMPLETED: 'bg-violet-100 text-violet-700 ring-violet-200',
  CANCELLED: 'bg-red-100 text-red-700 ring-red-200',
  EXPIRED:   'bg-orange-100 text-orange-700 ring-orange-200',
}

const ANALYTICS_CARDS = [
  { key: 'totalRequests',    label: 'Total',       format: (v: number) => v.toLocaleString(),         bg: 'bg-slate-50',   color: 'text-slate-600' },
  { key: 'activeRequests',   label: 'Active',      format: (v: number) => v.toLocaleString(),         bg: 'bg-green-50',   color: 'text-green-600' },
  { key: 'completedRequests',label: 'Completed',   format: (v: number) => v.toLocaleString(),         bg: 'bg-violet-50',  color: 'text-violet-600' },
  { key: 'totalValue',       label: 'Total Value', format: (v: number) => `$${v.toLocaleString()}`,   bg: 'bg-amber-50',   color: 'text-amber-600' },
  { key: 'conversionRate',   label: 'Conversion',  format: (v: number) => `${v}%`,                    bg: 'bg-blue-50',    color: 'text-blue-600' },
]

const VALID_STATUSES = ['ACTIVE', 'CANCELLED', 'COMPLETED', 'EXPIRED']

type ConfirmModal =
  | { type: 'status'; requestId: string; title: string; newStatus: string }
  | { type: 'delete'; requestId: string; title: string }
  | null

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [analytics, setAnalytics] = useState<RequestAnalytics | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [params, setParams] = useState<GetAdminRequestsParams>({ page: 1, limit: 20, status: 'ALL' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [modal, setModal] = useState<ConfirmModal>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [search, setSearch] = useState('')

  const load = useCallback(async (p: GetAdminRequestsParams) => {
    setLoading(true)
    setError(null)
    try {
      const cleanParams: GetAdminRequestsParams = { ...p }
      if (cleanParams.status === 'ALL') delete cleanParams.status
      const res = await apiGetAdminRequests(cleanParams)
      setRequests(res.requests)
      setPagination(res.pagination)
      setAnalytics(res.analytics)
    } catch {
      setError('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(params) }, [params, load])

  const updateParam = (key: keyof GetAdminRequestsParams, value: string | number) =>
    setParams(prev => ({ ...prev, [key]: value, page: key === 'page' ? (value as number) : 1 }))

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  async function handleStatusChange() {
    if (!modal || modal.type !== 'status') return
    setActionLoading(true)
    try {
      await apiUpdateRequestStatus(modal.requestId, modal.newStatus)
      showFeedback(`Status updated to ${modal.newStatus}`)
      setModal(null)
      load(params)
    } catch {
      setError('Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!modal || modal.type !== 'delete') return
    setActionLoading(true)
    try {
      await apiDeleteRequest(modal.requestId)
      showFeedback('Request deleted')
      setModal(null)
      load(params)
    } catch {
      setError('Failed to delete request')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleTriggerExpiry() {
    try {
      const res = await apiTriggerExpiry()
      showFeedback(res.message)
      load(params)
    } catch {
      setError('Failed to trigger expiry processing')
    }
  }

  const filteredRequests = search
    ? requests.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.buyerId.includes(search))
    : requests

  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="p-5 sm:p-6 space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">Moderate and manage buyer requests.</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleTriggerExpiry} className="shrink-0 h-9 rounded-lg border-slate-200 text-slate-600">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Process Expired
        </Button>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {feedback}
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analytics strip */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ANALYTICS_CARDS.map(({ key, label, format: fmt, bg, color }) => (
            <div key={key} className={`${bg} rounded-xl px-4 py-3`}>
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className={`text-xl font-bold mt-0.5 ${color}`}>
                {fmt((analytics as unknown as Record<string, number>)[key] ?? 0)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search title or buyer ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm border-slate-200 bg-white"
          />
        </div>
        <select
          value={params.status ?? 'ALL'}
          onChange={e => updateParam('status', e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {['ALL', 'ACTIVE', 'HAS_BIDS', 'DRAFT', 'COMPLETED', 'CANCELLED', 'EXPIRED'].map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Title', 'Category', 'Status', 'Budget', 'Views', 'Expires', 'Created', 'Actions'].map(h => (
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
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No requests found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 max-w-[200px]">
                    <Link href={`/admin/requests/${r.id}`} className="group">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{r.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate font-mono">{r.buyerId.slice(0, 8)}…</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{r.category?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={r.status} colorClass={STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-700 ring-slate-200'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {r.budgetMin != null && r.budgetMax != null
                      ? `$${r.budgetMin}–$${r.budgetMax}`
                      : r.budgetMax != null ? `≤ $${r.budgetMax}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 text-center">{r.viewCount}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                    {r.expiresAt ? format(new Date(r.expiresAt), 'MMM d, yyyy') : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                    {format(new Date(r.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap min-w-[120px]">
                      {VALID_STATUSES.filter(s => s !== r.status).map(s => (
                        <button
                          key={s}
                          onClick={() => setModal({ type: 'status', requestId: r.id, title: r.title, newStatus: s })}
                          className="text-xs font-medium px-2 py-1 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >{s}</button>
                      ))}
                      <button
                        onClick={() => setModal({ type: 'delete', requestId: r.id, title: r.title })}
                        className="text-xs font-medium px-2 py-1 rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredRequests.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-500">
              Showing <span className="font-medium text-slate-700">{rangeStart}–{rangeEnd}</span> of <span className="font-medium text-slate-700">{pagination.total}</span>
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => updateParam('page', pagination.page - 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              ><ChevronLeft className="h-4 w-4" /></button>
              <div className="flex items-center px-3 h-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700">
                {pagination.page} / {pagination.totalPages}
              </div>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateParam('page', pagination.page + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              ><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-base font-semibold text-slate-900">
                {modal.type === 'delete' ? 'Delete Request' : `Set Status to ${modal.newStatus}`}
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                {modal.type === 'delete'
                  ? `Permanently delete "${modal.title}"? This action cannot be undone.`
                  : `Change status of "${modal.title}" to ${modal.newStatus}?`}
              </p>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-5">
              <Button variant="outline" onClick={() => setModal(null)} className="rounded-xl">Cancel</Button>
              <Button
                onClick={modal.type === 'delete' ? handleDelete : handleStatusChange}
                disabled={actionLoading}
                className={`rounded-xl ${modal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                {actionLoading ? 'Processing…' : modal.type === 'delete' ? 'Delete' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${colorClass}`}>
      {label.replace('_', ' ')}
    </span>
  )
}
