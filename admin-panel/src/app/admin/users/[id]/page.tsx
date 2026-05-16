'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  apiGetUser, apiSuspendUser, apiBanUser, apiActivateUser, apiUpdateUser,
  apiGetUserSessions, apiRevokeUserSession, apiGetUserLogs,
  AdminUser, UserSession, ActivityLog,
} from '@/lib/adminAPI'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowLeft, Pencil, X, Shield, Ban, CheckCircle, Monitor, Clock, AlertTriangle, RefreshCw } from 'lucide-react'

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'bg-green-100 text-green-800 border-green-200',
  PENDING:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  BANNED:    'bg-red-100 text-red-800 border-red-200',
  SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
}

const ROLE_COLORS: Record<string, string> = {
  BUYER:    'bg-blue-100 text-blue-800',
  MERCHANT: 'bg-purple-100 text-purple-800',
  ADMIN:    'bg-gray-100 text-gray-800',
}

const ACTION_COLORS: Record<string, string> = {
  USER_VIEW:        'bg-gray-100 text-gray-700',
  USER_EDIT:        'bg-blue-100 text-blue-700',
  USER_SUSPEND:     'bg-orange-100 text-orange-700',
  USER_BAN:         'bg-red-100 text-red-700',
  SESSION_TERMINATE:'bg-yellow-100 text-yellow-700',
  USER_BULK_ACTION: 'bg-purple-100 text-purple-700',
}

type Tab = 'overview' | 'sessions' | 'logs'

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [user, setUser]         = useState<AdminUser | null>(null)
  const [loading, setLoading]   = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)
  const [tab, setTab]           = useState<Tab>('overview')

  // sessions
  const [sessions, setSessions]     = useState<UserSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  // logs
  const [logs, setLogs]         = useState<ActivityLog[]>([])
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsPage, setLogsPage] = useState(1)

  // edit profile
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ firstName: '', lastName: '', city: '', country: '', role: '' })

  // status actions
  const [modal, setModal]       = useState<'suspend' | 'ban' | null>(null)
  const [reason, setReason]     = useState('')
  const [duration, setDuration] = useState('')
  const [acting, setActing]     = useState(false)

  // ─── Load user ───────────────────────────────────────────────────

  const loadUser = useCallback(async () => {
    try {
      const r = await apiGetUser(id)
      setUser(r.user)
      syncForm(r.user)
    } catch {
      setPageError('User not found')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadUser() }, [loadUser])

  // ─── Load sessions ────────────────────────────────────────────────

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const r = await apiGetUserSessions(id)
      setSessions(r.sessions)
    } catch { /* silent */ }
    finally { setSessionsLoading(false) }
  }, [id])

  // ─── Load logs ────────────────────────────────────────────────────

  const loadLogs = useCallback(async (page = 1) => {
    setLogsLoading(true)
    try {
      const r = await apiGetUserLogs(id, { page, limit: 20 })
      setLogs(r.logs)
      setLogsTotal(r.total)
      setLogsPage(page)
    } catch { /* silent */ }
    finally { setLogsLoading(false) }
  }, [id])

  // Lazy-load tabs
  useEffect(() => {
    if (tab === 'sessions' && sessions.length === 0 && !sessionsLoading) loadSessions()
    if (tab === 'logs'     && logs.length === 0     && !logsLoading)    loadLogs(1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // ─── Helpers ─────────────────────────────────────────────────────

  function syncForm(u: AdminUser) {
    setForm({
      firstName: u.profile?.firstName ?? '',
      lastName:  u.profile?.lastName  ?? '',
      city:      u.profile?.city      ?? '',
      country:   u.profile?.country   ?? '',
      role:      u.role,
    })
  }

  function flash(msg: string, ok: boolean) {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 4000)
  }

  // ─── Actions ─────────────────────────────────────────────────────

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    try {
      const payload: Record<string, string> = {}
      if (form.firstName !== (user.profile?.firstName ?? '')) payload.firstName = form.firstName
      if (form.lastName  !== (user.profile?.lastName  ?? '')) payload.lastName  = form.lastName
      if (form.city      !== (user.profile?.city      ?? '')) payload.city      = form.city
      if (form.country   !== (user.profile?.country   ?? '')) payload.country   = form.country
      if (form.role      !== user.role)                        payload.role      = form.role

      if (Object.keys(payload).length === 0) { setEditing(false); return }

      const res = await apiUpdateUser(user.id, payload)
      setUser(res.user); syncForm(res.user)
      setEditing(false)
      flash('Profile updated successfully.', true)
    } catch {
      flash('Failed to save changes.', false)
    } finally {
      setSaving(false)
    }
  }

  async function doStatusAction(type: 'suspend' | 'ban' | 'activate') {
    if (!user) return
    setActing(true)
    try {
      if (type === 'suspend') {
        await apiSuspendUser(user.id, { reason, duration: duration ? parseInt(duration) : undefined })
      } else if (type === 'ban') {
        await apiBanUser(user.id, { reason, permanent: true })
      } else {
        await apiActivateUser(user.id)
      }
      setModal(null); setReason(''); setDuration('')
      flash(`User ${type === 'activate' ? 'activated' : type + 'd'} successfully.`, true)
      await loadUser()
    } catch {
      flash(`Failed to ${type} user.`, false)
    } finally {
      setActing(false)
    }
  }

  async function revokeSession(sessionId: string) {
    try {
      await apiRevokeUserSession(id, sessionId)
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isActive: false } : s))
      flash('Session revoked.', true)
    } catch {
      flash('Failed to revoke session.', false)
    }
  }

  // ─── Render guards ────────────────────────────────────────────────

  if (loading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32" />
      <div className="h-40 bg-gray-200 rounded-xl" />
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  )

  if (pageError || !user) return (
    <div className="p-6 text-red-600 flex items-center gap-2">
      <AlertTriangle className="h-5 w-5" /> {pageError ?? 'User not found'}
    </div>
  )

  const displayName = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
    : null

  return (
    <div className="p-6 max-w-5xl space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </button>
        <button onClick={loadUser} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* ── Identity bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg shrink-0">
          {displayName ? displayName[0].toUpperCase() : user.phone.slice(-2)}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-lg leading-tight">{displayName ?? 'No name'}</div>
          <div className="text-sm text-gray-500">{user.phone}</div>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Badge label={user.role}   colorClass={ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-700'} />
          <Badge label={user.status} colorClass={STATUS_COLORS[user.status] ?? 'bg-gray-100 text-gray-700'} border />
        </div>
      </div>

      {/* ── Feedback ── */}
      {feedback && (
        <Alert className={feedback.ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={feedback.ok ? 'text-green-800' : 'text-red-800'}>
            {feedback.msg}
          </AlertDescription>
        </Alert>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['overview', 'sessions', 'logs'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'logs' ? 'Activity Logs' : t === 'sessions' ? 'Sessions' : 'Overview'}
          </button>
        ))}
      </div>

      {/* ════════════════ OVERVIEW ════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-4">

          {/* Profile info card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Profile Information</CardTitle>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => { setEditing(true); setFeedback(null) }}
                  className="flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => { setEditing(false); syncForm(user) }}
                  className="flex items-center gap-1.5 text-gray-500">
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  <InfoRow label="Phone"          value={user.phone} />
                  <InfoRow label="Role"           value={<Badge label={user.role} colorClass={ROLE_COLORS[user.role] ?? ''} />} />
                  <InfoRow label="Status"         value={<Badge label={user.status} colorClass={STATUS_COLORS[user.status] ?? ''} border />} />
                  <InfoRow label="Phone Verified" value={user.phoneVerified ? '✅ Verified' : '❌ Not verified'} />
                  <InfoRow label="First Name"     value={user.profile?.firstName || '—'} />
                  <InfoRow label="Last Name"      value={user.profile?.lastName  || '—'} />
                  <InfoRow label="City"           value={user.profile?.city      || '—'} />
                  <InfoRow label="Country"        value={user.profile?.country   || '—'} />
                  <InfoRow label="Registered"     value={format(new Date(user.createdAt), 'PPP')} />
                  <InfoRow label="Last Login"     value={user.lastLoginAt ? format(new Date(user.lastLoginAt), 'PPP p') : '—'} />
                  {Number(user.failedLoginAttempts) > 0 && (
                    <InfoRow label="Failed Logins" value={<span className="text-red-600 font-medium">{user.failedLoginAttempts}</span>} />
                  )}
                  {user.lockedUntil && (
                    <InfoRow label="Locked Until" value={<span className="text-red-600">{format(new Date(user.lockedUntil), 'PPP p')}</span>} />
                  )}
                  <InfoRow label="User ID" value={<span className="font-mono text-xs text-gray-400">{user.id}</span>} />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Role selector */}
                  {user.role !== 'ADMIN' && (
                    <div className="space-y-1.5">
                      <Label>Role</Label>
                      <div className="flex gap-3">
                        {(['BUYER', 'MERCHANT'] as const).map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, role: r }))}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                              form.role === r
                                ? r === 'BUYER' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            {r === 'BUYER' ? '🛒' : '🏪'} {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={form.firstName}
                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={form.lastName}
                        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={form.city} placeholder="Optional"
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={form.country} placeholder="e.g. JO"
                        onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button onClick={saveProfile} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={() => { setEditing(false); syncForm(user) }} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status management card */}
          {user.role !== 'ADMIN' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" /> Account Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {user.status !== 'SUSPENDED' && user.status !== 'BANNED' && (
                    <Button
                      variant="outline"
                      onClick={() => setModal('suspend')}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50 flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Suspend User
                    </Button>
                  )}
                  {user.status !== 'BANNED' && (
                    <Button
                      variant="outline"
                      onClick={() => setModal('ban')}
                      className="border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-2">
                      <Ban className="h-4 w-4" /> Ban User
                    </Button>
                  )}
                  {(user.status === 'SUSPENDED' || user.status === 'BANNED') && (
                    <Button
                      variant="outline"
                      onClick={() => doStatusAction('activate')}
                      disabled={acting}
                      className="border-green-300 text-green-700 hover:bg-green-50 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {acting ? 'Processing…' : 'Activate User'}
                    </Button>
                  )}
                </div>

                {user.status === 'SUSPENDED' && (
                  <p className="mt-3 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                    ⚠️ This account is currently suspended.
                    {user.lockedUntil && ` Locked until ${format(new Date(user.lockedUntil), 'PPP p')}.`}
                  </p>
                )}
                {user.status === 'BANNED' && (
                  <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    🚫 This account is permanently banned.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ════════════════ SESSIONS ════════════════ */}
      {tab === 'sessions' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-4 w-4 text-gray-500" /> Sessions
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadSessions} disabled={sessionsLoading}
              className="flex items-center gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${sessionsLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {sessionsLoading ? (
              <div className="p-6 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No sessions found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">IP Address</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Device</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Active</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expires</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sessions.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {s.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">{s.ipAddress ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={s.userAgent ?? ''}>
                          {parseUA(s.userAgent)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {format(new Date(s.createdAt), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {s.lastActivityAt
                            ? formatDistanceToNow(new Date(s.lastActivityAt), { addSuffix: true })
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {format(new Date(s.expiresAt), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-3">
                          {s.isActive && (
                            <button
                              onClick={() => revokeSession(s.id)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline transition-colors">
                              Revoke
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
      )}

      {/* ════════════════ ACTIVITY LOGS ════════════════ */}
      {tab === 'logs' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">
              Admin Activity Logs
              {logsTotal > 0 && <span className="ml-2 text-xs font-normal text-gray-400">({logsTotal} total)</span>}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => loadLogs(logsPage)} disabled={logsLoading}
              className="flex items-center gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${logsLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {logsLoading ? (
              <div className="p-6 space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No activity logs for this user.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">By Admin</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {logs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              ACTION_COLORS[log.action_type] ?? 'bg-gray-100 text-gray-600'
                            }`}>
                              {log.action_type.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700">
                            {log.first_name
                              ? `${log.first_name} ${log.last_name ?? ''}`.trim()
                              : log.admin_phone ?? log.admin_id?.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 max-w-[220px]">
                            <LogDetails details={log.action_details} />
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {log.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {logsTotal > 20 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Page {logsPage} of {Math.ceil(logsTotal / 20)}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={logsPage <= 1 || logsLoading}
                        onClick={() => loadLogs(logsPage - 1)}>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled={logsPage >= Math.ceil(logsTotal / 20) || logsLoading}
                        onClick={() => loadLogs(logsPage + 1)}>
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ════════════════ SUSPEND / BAN MODAL ════════════════ */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md space-y-4 p-6">
            <div className="flex items-center gap-3">
              {modal === 'ban'
                ? <Ban className="h-5 w-5 text-red-500" />
                : <Clock className="h-5 w-5 text-orange-500" />}
              <h3 className="text-lg font-semibold capitalize">{modal} {user.phone}</h3>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Reason *</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Provide a reason…"
              />
            </div>

            {modal === 'suspend' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Duration (hours, optional)</label>
                <Input
                  type="number" min="1" placeholder="Leave blank for indefinite"
                  value={duration} onChange={e => setDuration(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={() => { setModal(null); setReason(''); setDuration('') }}>
                Cancel
              </Button>
              <Button
                onClick={() => doStatusAction(modal)}
                disabled={acting || !reason.trim()}
                className={modal === 'ban' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}
              >
                {acting ? 'Processing…' : `Confirm ${modal}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )
}

function Badge({ label, colorClass, border }: { label: string; colorClass: string; border?: boolean }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass} ${border ? 'border' : ''}`}>
      {label}
    </span>
  )
}

function LogDetails({ details }: { details: Record<string, unknown> }) {
  const entries = Object.entries(details).filter(([, v]) => v !== null && v !== undefined)
  if (entries.length === 0) return <span className="text-gray-300">—</span>
  return (
    <div className="space-y-0.5">
      {entries.slice(0, 3).map(([k, v]) => (
        <div key={k} className="truncate">
          <span className="text-gray-400">{k}: </span>
          <span className="text-gray-600">{String(v)}</span>
        </div>
      ))}
    </div>
  )
}

function parseUA(ua: string | null): string {
  if (!ua) return '—'
  if (/Mobile|Android|iPhone/i.test(ua)) return '📱 Mobile'
  if (/Chrome/i.test(ua)) return '🌐 Chrome'
  if (/Firefox/i.test(ua)) return '🦊 Firefox'
  if (/Safari/i.test(ua)) return '🧭 Safari'
  return ua.slice(0, 30)
}
