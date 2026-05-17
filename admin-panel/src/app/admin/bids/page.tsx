'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  apiGetAdminBids, apiAdminForceRejectBid,
  BidItem, BidAnalytics, GetAdminBidsParams,
} from '@/lib/adminAPI'
import { format } from 'date-fns'
import {
  Search, ChevronLeft, ChevronRight, AlertCircle,
  DollarSign, Clock, CheckCircle, XCircle, Gavel,
} from 'lucide-react'

const BID_STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700 ring-yellow-200',
  ACCEPTED:  'bg-green-100 text-green-700 ring-green-200',
  REJECTED:  'bg-red-100 text-red-700 ring-red-200',
  EXPIRED:   'bg-orange-100 text-orange-700 ring-orange-200',
  WITHDRAWN: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const ALL_STATUSES = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN']

type RejectModal = { bid: BidItem } | null

export default function BidsPage() {
  const [bids, setBids] = useState<BidItem[]>([])
  const [analytics, setAnalytics] = useState<BidAnalytics | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [params, setParams] = useState<GetAdminBidsParams>({ page: 1, limit: 20, status: 'ALL' })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<RejectModal>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async (p: GetAdminBidsParams) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetAdminBids(p)
      setBids(res.bids)
      setPagination(res.pagination)
      setAnalytics(res.analytics)
    } catch {
      setError('Failed to load bids')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(params) }, [params, load])

  const updateParam = (key: keyof GetAdminBidsParams, value: string | number) =>
    setParams(prev => ({ ...prev, [key]: value, page: key === 'page' ? (value as number) : 1 }))

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  async function handleForceReject() {
    if (!rejectModal) return
    setActionLoading(true)
    try {
      await apiAdminForceRejectBid(rejectModal.bid.id)
      showFeedback('Bid rejected')
      setRejectModal(null)
      load(params)
    } catch {
      setError('Failed to reject bid')
    } finally {
      setActionLoading(false)
    }
  }

  const pending  = analytics?.statusBreakdown.find(s => s.status === 'PENDING')?.count  ?? 0
  const accepted = analytics?.statusBreakdown.find(s => s.status === 'ACCEPTED')?.count ?? 0
  const rejected = analytics?.statusBreakdown.find(s => s.status === 'REJECTED')?.count ?? 0

  const displayed = search
    ? bids.filter(b => b.merchantId.includes(search) || b.requestId.includes(search) || b.id.includes(search))
    : bids

  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="p-5 sm:p-6 space-y-5 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Bids</h1>
        <p className="text-sm text-slate-500 mt-0.5">Monitor and moderate all platform bids.</p>
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

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Bids', value: analytics.totalBids.toLocaleString(), icon: DollarSign, bg: 'bg-blue-50',   iconColor: 'text-blue-600' },
            { label: 'Pending',    value: String(pending),                       icon: Clock,       bg: 'bg-amber-50',  iconColor: 'text-amber-600' },
            { label: 'Accepted',   value: String(accepted),                      icon: CheckCircle, bg: 'bg-green-50',  iconColor: 'text-green-600' },
            { label: 'Rejected',   value: String(rejected),                      icon: XCircle,     bg: 'bg-red-50',    iconColor: 'text-red-600' },
          ].map(({ label, value, icon: Icon, bg, iconColor }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total value banner */}
      {analytics && analytics.totalValue > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3.5 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700">Total value across all bids</span>
          <span className="text-lg font-bold text-blue-800">
            ${analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by bid, request, or merchant ID…"
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
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</option>)}
        </select>
        <input
          type="date"
          value={params.startDate ?? ''}
          onChange={e => updateParam('startDate', e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="From date"
        />
        <input
          type="date"
          value={params.endDate ?? ''}
          onChange={e => updateParam('endDate', e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="To date"
        />
        {(params.startDate || params.endDate) && (
          <button
            onClick={() => setParams(prev => ({ ...prev, startDate: undefined, endDate: undefined, page: 1 }))}
            className="h-9 px-3 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >Clear dates</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Request', 'Merchant', 'Amount', 'Delivery', 'Status', 'Submitted', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Gavel className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No bids found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : displayed.map(bid => (
                <tr key={bid.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/requests/${bid.requestId}`} className="text-xs font-mono text-blue-600 hover:text-blue-700 hover:underline">
                      {bid.requestId.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">
                    {bid.merchantId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap">
                    ${parseFloat(bid.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {bid.deliveryDays}d
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${BID_STATUS_COLORS[bid.status] ?? 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                      {bid.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {format(new Date(bid.createdAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/bids/${bid.id}`}
                        className="text-xs font-medium px-2 py-1 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >View</Link>
                      {bid.status === 'PENDING' && (
                        <button
                          onClick={() => setRejectModal({ bid })}
                          className="text-xs font-medium px-2 py-1 rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                        >Reject</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && displayed.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-500">
              Showing <span className="font-medium text-slate-700">{rangeStart}–{rangeEnd}</span> of <span className="font-medium text-slate-700">{pagination.total.toLocaleString()}</span>
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

      {/* Force-reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-base font-semibold text-red-700">Force-Reject Bid</h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Reject the{' '}
                <span className="font-semibold text-slate-700">${parseFloat(rejectModal.bid.amount).toFixed(2)}</span>{' '}
                bid from merchant{' '}
                <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{rejectModal.bid.merchantId.slice(0, 12)}…</code>?
                {' '}This cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >Cancel</button>
              <button
                onClick={handleForceReject}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Rejecting…' : 'Reject Bid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
