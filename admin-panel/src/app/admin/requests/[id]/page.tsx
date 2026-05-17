'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  apiGetAdminRequest, apiUpdateRequestStatus, apiDeleteRequest,
  apiGetRequestBids, apiAdminForceRejectBid,
  RequestItem, BidItem,
} from '@/lib/adminAPI'
import { format } from 'date-fns'
import { AlertCircle, ArrowLeft, Trash2 } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'bg-gray-100 text-gray-700',
  ACTIVE:    'bg-green-100 text-green-800',
  HAS_BIDS:  'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED:   'bg-orange-100 text-orange-800',
}

const BID_STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  ACCEPTED:  'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-800',
  EXPIRED:   'bg-orange-100 text-orange-800',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
}

const VALID_STATUSES = ['ACTIVE', 'CANCELLED', 'COMPLETED', 'EXPIRED']

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [request, setRequest] = useState<RequestItem | null>(null)
  const [bids, setBids] = useState<BidItem[]>([])
  const [bidsLoading, setBidsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [statusModal, setStatusModal] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<BidItem | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    apiGetAdminRequest(id)
      .then(res => setRequest(res.request))
      .catch(() => setError('Failed to load request'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setBidsLoading(true)
    apiGetRequestBids(id)
      .then(res => setBids(res.bids))
      .catch(() => {})
      .finally(() => setBidsLoading(false))
  }, [id])

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  async function handleStatusChange(status: string) {
    setActionLoading(true)
    try {
      await apiUpdateRequestStatus(id, status)
      showFeedback(`Status updated to ${status}`)
      setStatusModal(null)
      const res = await apiGetAdminRequest(id)
      setRequest(res.request)
    } catch {
      setError('Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      await apiDeleteRequest(id)
      router.push('/admin/requests')
    } catch {
      setError('Failed to delete request')
      setActionLoading(false)
    }
  }

  async function handleForceReject() {
    if (!rejectModal) return
    setActionLoading(true)
    try {
      await apiAdminForceRejectBid(rejectModal.id)
      showFeedback('Bid rejected')
      setRejectModal(null)
      const res = await apiGetRequestBids(id)
      setBids(res.bids)
    } catch {
      setError('Failed to reject bid')
    } finally {
      setActionLoading(false)
    }
  }

  function formatBudget(item: RequestItem) {
    if (item.budgetMin != null && item.budgetMax != null)
      return `$${item.budgetMin} – $${item.budgetMax}`
    if (item.budgetMax != null) return `up to $${item.budgetMax}`
    if (item.budgetMin != null) return `from $${item.budgetMin}`
    return '—'
  }

  function formatLocation(item: RequestItem) {
    const parts = [item.locationCity, item.locationCountry].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : (item.locationAddress ?? '—')
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>
  if (error && !request) return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  )
  if (!request) return null

  const pendingBids = bids.filter(b => b.status === 'PENDING')
  const lowestBid = pendingBids.length > 0
    ? Math.min(...pendingBids.map(b => parseFloat(b.amount)))
    : null

  return (
    <div className="p-6 space-y-4 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/requests">
          <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1 line-clamp-1">{request.title}</h1>
        <button
          onClick={() => setDeleteModal(true)}
          className="p-2 rounded text-red-600 hover:bg-red-50"
          title="Delete request"
        >
          <Trash2 className="h-5 w-5" />
        </button>
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

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{request.description}</p>
            </CardContent>
          </Card>

          {request.images && request.images.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Images</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {request.images.map(img => (
                    <a key={img.id} href={img.imageUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={img.imageUrl}
                        alt={request.title}
                        className="h-24 w-24 object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Bids Section ── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Bids
                  {bids.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">({bids.length})</span>
                  )}
                </CardTitle>
                {lowestBid !== null && (
                  <span className="text-sm text-gray-500">
                    Lowest: <span className="font-semibold text-green-700">${lowestBid.toFixed(2)}</span>
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {bidsLoading ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">Loading bids…</div>
              ) : bids.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">No bids yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Merchant ID', 'Amount', 'Delivery', 'Status', 'Submitted', 'Action'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bids.map(bid => (
                        <tr key={bid.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs font-mono text-gray-600 max-w-[140px] truncate">
                            {bid.merchantId}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            ${parseFloat(bid.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {bid.deliveryDays}d
                            {bid.deliveryNotes && (
                              <span className="ml-1 text-xs text-gray-400" title={bid.deliveryNotes}>ⓘ</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${BID_STATUS_COLORS[bid.status] ?? 'bg-gray-100 text-gray-700'}`}>
                              {bid.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {format(new Date(bid.createdAt), 'MMM d, HH:mm')}
                          </td>
                          <td className="px-4 py-3">
                            {bid.status === 'PENDING' && (
                              <button
                                onClick={() => setRejectModal(bid)}
                                className="text-xs px-2 py-1 rounded text-red-700 bg-red-50 hover:bg-red-100"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-sm font-medium ${STATUS_COLORS[request.status] ?? 'bg-gray-100 text-gray-700'}`}>
                {request.status}
              </span>
              <div>
                <p className="text-xs text-gray-500 mb-2">Change status</p>
                <div className="flex flex-wrap gap-2">
                  {VALID_STATUSES.filter(s => s !== request.status).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusModal(s)}
                      className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Set {s}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Buyer ID" value={request.buyerId} mono />
              <Row label="Category" value={request.category?.name ?? '—'} />
              <Row label="Location" value={formatLocation(request)} />
              <Row label="Budget" value={formatBudget(request)} />
              <Row label="Views" value={String(request.viewCount)} />
              <Row label="Bids" value={String(request.bidCount)} />
              <Row label="Priority" value={String(request.priorityScore)} />
              <Row label="Created" value={format(new Date(request.createdAt), 'MMM d, yyyy HH:mm')} />
              <Row label="Updated" value={format(new Date(request.updatedAt), 'MMM d, yyyy HH:mm')} />
              {request.publishedAt && (
                <Row label="Published" value={format(new Date(request.publishedAt), 'MMM d, yyyy HH:mm')} />
              )}
              {request.expiresAt && (
                <Row label="Expires" value={format(new Date(request.expiresAt), 'MMM d, yyyy HH:mm')} />
              )}
            </CardContent>
          </Card>

          {/* Bid summary in sidebar */}
          {bids.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Bid Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED'].map(s => {
                  const count = bids.filter(b => b.status === s).length
                  if (count === 0) return null
                  return <Row key={s} label={s} value={String(count)} />
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Set status to {statusModal}?</h2>
            <p className="text-sm text-gray-600">This will update the request status and notify the buyer.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStatusModal(null)}>Cancel</Button>
              <Button onClick={() => handleStatusChange(statusModal)} disabled={actionLoading}>
                {actionLoading ? 'Updating…' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-red-700">Delete Request</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete this request? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteModal(false)}>Cancel</Button>
              <Button onClick={handleDelete} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
                {actionLoading ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Force-reject bid modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-red-700">Reject Bid</h2>
            <p className="text-sm text-gray-600">
              Force-reject the <span className="font-semibold">${parseFloat(rejectModal.amount).toFixed(2)}</span> bid from merchant{' '}
              <span className="font-mono text-xs">{rejectModal.merchantId}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRejectModal(null)}>Cancel</Button>
              <Button onClick={handleForceReject} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
                {actionLoading ? 'Rejecting…' : 'Reject Bid'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-gray-900 text-right truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}
