'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  apiGetAdminBids, apiAdminForceRejectBid,
  BidItem, BidAnalytics, GetAdminBidsParams,
} from '@/lib/adminAPI'
import { format } from 'date-fns'
import {
  Search, ChevronLeft, ChevronRight, AlertCircle,
  DollarSign, Clock, CheckCircle, XCircle,
} from 'lucide-react'

const BID_STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  ACCEPTED:  'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-800',
  EXPIRED:   'bg-orange-100 text-orange-800',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
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

  const pending   = analytics?.statusBreakdown.find(s => s.status === 'PENDING')?.count   ?? 0
  const accepted  = analytics?.statusBreakdown.find(s => s.status === 'ACCEPTED')?.count  ?? 0
  const rejected  = analytics?.statusBreakdown.find(s => s.status === 'REJECTED')?.count  ?? 0

  const displayed = search
    ? bids.filter(b =>
        b.merchantId.includes(search) ||
        b.requestId.includes(search) ||
        b.id.includes(search)
      )
    : bids

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Bids</h1>

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

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Bids"
            value={analytics.totalBids.toLocaleString()}
            icon={DollarSign}
            color="text-blue-600"
          />
          <StatCard
            label="Pending"
            value={String(pending)}
            icon={Clock}
            color="text-yellow-600"
          />
          <StatCard
            label="Accepted"
            value={String(accepted)}
            icon={CheckCircle}
            color="text-green-600"
          />
          <StatCard
            label="Rejected / Other"
            value={String(rejected)}
            icon={XCircle}
            color="text-red-600"
          />
        </div>
      )}

      {/* Total value banner */}
      {analytics && analytics.totalValue > 0 && (
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">Total bid value across all bids</span>
            <span className="text-xl font-bold text-blue-800">
              ${analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by bid, request, or merchant ID…"
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
              {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <input
              type="date"
              value={params.startDate ?? ''}
              onChange={e => updateParam('startDate', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600"
              title="From date"
            />
            <input
              type="date"
              value={params.endDate ?? ''}
              onChange={e => updateParam('endDate', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600"
              title="To date"
            />
            {(params.startDate || params.endDate) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setParams(prev => ({ ...prev, startDate: undefined, endDate: undefined, page: 1 }))}
              >
                Clear dates
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Request', 'Merchant', 'Amount', 'Delivery', 'Status', 'Submitted', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                    </div>
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                    No bids found
                  </td>
                </tr>
              ) : displayed.map(bid => (
                <tr key={bid.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-blue-600 max-w-[140px]">
                    <Link href={`/admin/requests/${bid.requestId}`} className="hover:underline truncate block">
                      {bid.requestId.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600 max-w-[140px] truncate">
                    {bid.merchantId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    ${parseFloat(bid.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {bid.deliveryDays}d
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={bid.status} colorClass={BID_STATUS_COLORS[bid.status] ?? 'bg-gray-100 text-gray-700'} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {format(new Date(bid.createdAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/bids/${bid.id}`}
                        className="text-xs px-2 py-1 rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        View
                      </Link>
                      {bid.status === 'PENDING' && (
                        <button
                          onClick={() => setRejectModal({ bid })}
                          className="text-xs px-2 py-1 rounded text-red-700 bg-red-50 hover:bg-red-100"
                        >
                          Reject
                        </button>
                      )}
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
          {pagination.total.toLocaleString()} total · page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm" variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => updateParam('page', pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm" variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => updateParam('page', pagination.page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Force-reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-red-700">Force-Reject Bid</h2>
            <p className="text-sm text-gray-600">
              Reject the{' '}
              <span className="font-semibold">${parseFloat(rejectModal.bid.amount).toFixed(2)}</span>{' '}
              bid from merchant{' '}
              <span className="font-mono text-xs bg-gray-100 px-1 rounded">{rejectModal.bid.merchantId.slice(0, 12)}…</span>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRejectModal(null)}>Cancel</Button>
              <Button
                onClick={handleForceReject}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? 'Rejecting…' : 'Reject Bid'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string; value: string; icon: React.ElementType; color: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  )
}
