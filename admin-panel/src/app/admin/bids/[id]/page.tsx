'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiGetAdminBid, apiAdminForceRejectBid, BidItem } from '@/lib/adminAPI'
import { format } from 'date-fns'
import { ArrowLeft, AlertCircle } from 'lucide-react'

const BID_STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  ACCEPTED:  'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-800',
  EXPIRED:   'bg-orange-100 text-orange-800',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
}

export default function BidDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [bid, setBid] = useState<BidItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    apiGetAdminBid(id)
      .then(res => setBid(res.bid))
      .catch(() => setError('Failed to load bid'))
      .finally(() => setLoading(false))
  }, [id])

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  async function handleForceReject() {
    if (!bid) return
    setActionLoading(true)
    try {
      await apiAdminForceRejectBid(bid.id)
      showFeedback('Bid rejected')
      setRejectModal(false)
      setBid(prev => prev ? { ...prev, status: 'REJECTED', rejectedAt: new Date().toISOString() } : prev)
    } catch {
      setError('Failed to reject bid')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>
  if (error && !bid) return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  )
  if (!bid) return null

  const statusColor = BID_STATUS_COLORS[bid.status] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/bids">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />Back to Bids
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Bid Detail</h1>
        {bid.status === 'PENDING' && (
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => setRejectModal(true)}
          >
            Force Reject
          </Button>
        )}
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

      {/* Status banner */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${statusColor}`}>
        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
        {bid.status}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Amount card */}
        <Card className="border-blue-100">
          <CardContent className="pt-6 pb-5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bid Amount</p>
            <p className="text-4xl font-bold text-blue-700">
              ${parseFloat(bid.amount).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {bid.deliveryDays} day{bid.deliveryDays !== 1 ? 's' : ''} delivery
            </p>
          </CardContent>
        </Card>

        {/* Timestamps card */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Submitted"  value={format(new Date(bid.createdAt), 'MMM d, yyyy HH:mm')} />
            {bid.expiresAt && (
              <Row label="Expires" value={format(new Date(bid.expiresAt), 'MMM d, yyyy HH:mm')} />
            )}
            {bid.acceptedAt && (
              <Row label="Accepted"  value={format(new Date(bid.acceptedAt), 'MMM d, yyyy HH:mm')} highlight="green" />
            )}
            {bid.rejectedAt && (
              <Row label="Rejected"  value={format(new Date(bid.rejectedAt), 'MMM d, yyyy HH:mm')} highlight="red" />
            )}
            {bid.withdrawnAt && (
              <Row label="Withdrawn" value={format(new Date(bid.withdrawnAt), 'MMM d, yyyy HH:mm')} highlight="gray" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* IDs + details */}
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Bid ID"      value={bid.id}         mono />
          <Row
            label="Request"
            value={bid.requestId}
            mono
            link={`/admin/requests/${bid.requestId}`}
          />
          <Row label="Merchant ID" value={bid.merchantId} mono />
          <Row label="Priority Score" value={String(bid.priorityScore)} />
          <Row label="Updated" value={format(new Date(bid.updatedAt), 'MMM d, yyyy HH:mm')} />
        </CardContent>
      </Card>

      {/* Notes */}
      {(bid.deliveryNotes || bid.specialTerms) && (
        <Card>
          <CardHeader><CardTitle>Notes & Terms</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-700">
            {bid.deliveryNotes && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Delivery Notes</p>
                <p className="whitespace-pre-wrap">{bid.deliveryNotes}</p>
              </div>
            )}
            {bid.specialTerms && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Special Terms</p>
                <p className="whitespace-pre-wrap">{bid.specialTerms}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Force-reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-red-700">Force-Reject Bid</h2>
            <p className="text-sm text-gray-600">
              This will permanently reject the{' '}
              <span className="font-semibold">${parseFloat(bid.amount).toFixed(2)}</span>{' '}
              bid. The merchant will no longer be able to fulfil this request.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRejectModal(false)}>Cancel</Button>
              <Button
                onClick={handleForceReject}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({
  label, value, mono, link, highlight,
}: {
  label: string
  value: string
  mono?: boolean
  link?: string
  highlight?: 'green' | 'red' | 'gray'
}) {
  const highlightClass =
    highlight === 'green' ? 'text-green-700 font-medium' :
    highlight === 'red'   ? 'text-red-700 font-medium'   :
    highlight === 'gray'  ? 'text-gray-400'               : 'text-gray-900'

  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      {link ? (
        <Link
          href={link}
          className={`text-right truncate font-mono text-xs text-blue-600 hover:underline ${mono ? '' : ''}`}
        >
          {value}
        </Link>
      ) : (
        <span className={`text-right truncate ${mono ? 'font-mono text-xs' : ''} ${highlightClass}`}>
          {value}
        </span>
      )}
    </div>
  )
}
