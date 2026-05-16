'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  apiGetAdminRequests, apiUpdateRequestStatus, apiDeleteRequest, apiTriggerExpiry,
  RequestItem, RequestAnalytics, GetAdminRequestsParams,
} from '@/lib/adminAPI'
import { format } from 'date-fns'
import { Search, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'bg-gray-100 text-gray-700',
  ACTIVE:    'bg-green-100 text-green-800',
  HAS_BIDS:  'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED:   'bg-orange-100 text-orange-800',
}

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
      showFeedback(`Request status updated to ${modal.newStatus}`)
      setModal(null)
      load(params)
    } catch {
      setError('Failed to update request status')
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
    ? requests.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.buyerId.includes(search)
      )
    : requests

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
        <Button size="sm" variant="outline" onClick={handleTriggerExpiry}>
          <RefreshCw className="h-4 w-4 mr-1" /> Process Expired
        </Button>
      </div>

      {feedback && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{feedback}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analytics summary */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: analytics.totalRequests },
            { label: 'Active', value: analytics.activeRequests },
            { label: 'Completed', value: analytics.completedRequests },
            { label: 'Total Value', value: `$${analytics.totalValue.toLocaleString()}` },
            { label: 'Conversion', value: `${analytics.conversionRate}%` },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-gray-500 uppercase">{label}</p>
                <p className="text-xl font-bold mt-1">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search title or buyer ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={params.status ?? 'ALL'}
              onChange={e => updateParam('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {['ALL', 'ACTIVE', 'HAS_BIDS', 'DRAFT', 'COMPLETED', 'CANCELLED', 'EXPIRED'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Category', 'Status', 'Budget', 'Views', 'Expires', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No requests found</td></tr>
              ) : filteredRequests.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs">
                    <Link href={`/admin/requests/${r.id}`} className="hover:text-blue-600 line-clamp-2">
                      {r.title}
                    </Link>
                    <div className="text-xs text-gray-400 truncate">{r.buyerId}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {r.category?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={r.status} colorClass={STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-800'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {r.budgetMin != null && r.budgetMax != null
                      ? `$${r.budgetMin}–$${r.budgetMax}`
                      : r.budgetMax != null
                        ? `up to $${r.budgetMax}`
                        : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{r.viewCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {r.expiresAt ? format(new Date(r.expiresAt), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {format(new Date(r.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {VALID_STATUSES.filter(s => s !== r.status).map(s => (
                        <button
                          key={s}
                          onClick={() => setModal({ type: 'status', requestId: r.id, title: r.title, newStatus: s })}
                          className="text-xs px-2 py-1 rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >{s}</button>
                      ))}
                      <button
                        onClick={() => setModal({ type: 'delete', requestId: r.id, title: r.title })}
                        className="text-xs px-2 py-1 rounded text-red-700 bg-red-50 hover:bg-red-100"
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {pagination.total} total · page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={pagination.page <= 1}
            onClick={() => updateParam('page', pagination.page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" disabled={pagination.page >= pagination.totalPages}
            onClick={() => updateParam('page', pagination.page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {modal.type === 'delete' ? 'Delete Request' : `Set Status to ${modal.newStatus}`}
            </h2>
            <p className="text-sm text-gray-600">
              {modal.type === 'delete'
                ? `Are you sure you want to permanently delete "${modal.title}"? This cannot be undone.`
                : `Change status of "${modal.title}" to ${modal.newStatus}?`}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button
                onClick={modal.type === 'delete' ? handleDelete : handleStatusChange}
                disabled={actionLoading}
                className={modal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
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

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  )
}
