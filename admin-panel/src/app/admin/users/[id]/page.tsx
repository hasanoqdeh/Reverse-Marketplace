'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiGetUser, apiSuspendUser, apiBanUser, apiActivateUser, AdminUser } from '@/lib/adminAPI'
import { format } from 'date-fns'
import { AlertCircle, ArrowLeft } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800', PENDING: 'bg-yellow-100 text-yellow-800',
  BANNED: 'bg-red-100 text-red-800',     SUSPENDED: 'bg-orange-100 text-orange-800',
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<'suspend' | 'ban' | null>(null)
  const [reason, setReason] = useState('')
  const [acting, setActing] = useState(false)

  useEffect(() => {
    apiGetUser(id)
      .then(r => setUser(r.user))
      .catch(() => setError('User not found'))
      .finally(() => setLoading(false))
  }, [id])

  async function doAction(type: 'suspend' | 'ban' | 'activate') {
    if (!user) return
    setActing(true)
    try {
      if (type === 'suspend') await apiSuspendUser(user.id, { reason })
      else if (type === 'ban') await apiBanUser(user.id, { reason, permanent: true })
      else await apiActivateUser(user.id)
      setFeedback(`User ${type}d successfully`)
      setShowModal(null)
      setReason('')
      const refreshed = await apiGetUser(user.id)
      setUser(refreshed.user)
    } catch {
      setError(`Failed to ${type} user`)
    } finally {
      setActing(false)
    }
  }

  if (loading) return <div className="p-6 animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-4" /><div className="h-48 bg-gray-200 rounded-lg" /></div>
  if (error && !user) return <div className="p-6 text-red-600">{error}</div>
  if (!user) return null

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
      </button>

      {feedback && <Alert className="border-green-200 bg-green-50"><AlertDescription className="text-green-800">{feedback}</AlertDescription></Alert>}
      {error   && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>User Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Row label="Phone"  value={user.phone} />
          <Row label="Role"   value={<Badge label={user.role} colorClass="bg-blue-100 text-blue-800" />} />
          <Row label="Status" value={<Badge label={user.status} colorClass={STATUS_COLORS[user.status] ?? 'bg-gray-100 text-gray-800'} />} />
          <Row label="Phone Verified" value={user.phoneVerified ? '✅ Verified' : '❌ Not verified'} />
          {user.profile && <>
            <Row label="Name" value={`${user.profile.firstName} ${user.profile.lastName}`} />
            {user.profile.city && <Row label="City" value={user.profile.city} />}
          </>}
          <Row label="Registered" value={format(new Date(user.createdAt), 'PPP')} />
          <Row label="Last Login" value={user.lastLoginAt ? format(new Date(user.lastLoginAt), 'PPP p') : '—'} />
          {user.failedLoginAttempts > 0 && <Row label="Failed Attempts" value={<span className="text-red-600">{user.failedLoginAttempts}</span>} />}
          {user.lockedUntil && <Row label="Locked Until" value={<span className="text-red-600">{format(new Date(user.lockedUntil), 'PPP p')}</span>} />}
        </CardContent>
      </Card>

      {/* Actions */}
      {user.role !== 'ADMIN' && (
        <Card>
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="flex gap-3 flex-wrap">
            {user.status !== 'SUSPENDED' && (
              <Button variant="outline" className="text-orange-700 border-orange-300" onClick={() => setShowModal('suspend')}>
                Suspend User
              </Button>
            )}
            {user.status !== 'BANNED' && (
              <Button variant="outline" className="text-red-700 border-red-300" onClick={() => setShowModal('ban')}>
                Ban User
              </Button>
            )}
            {(user.status === 'BANNED' || user.status === 'SUSPENDED') && (
              <Button variant="outline" className="text-green-700 border-green-300" onClick={() => doAction('activate')} disabled={acting}>
                {acting ? 'Processing…' : 'Activate User'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <CardTitle className="capitalize">{showModal} {user.phone}</CardTitle>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Provide a reason…"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowModal(null); setReason('') }}>Cancel</Button>
              <Button
                onClick={() => doAction(showModal)}
                disabled={acting || !reason.trim()}
                className={showModal === 'ban' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {acting ? 'Processing…' : `Confirm ${showModal}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-sm text-gray-500 w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )
}

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>{label}</span>
}
