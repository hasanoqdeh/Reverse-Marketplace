'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  apiGetUsers, apiSuspendUser, apiBanUser, apiActivateUser, apiBulkAction,
  AdminUser, GetUsersParams,
} from '@/lib/adminAPI'
import { format } from 'date-fns'
import { Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'bg-green-100 text-green-800',
  PENDING:   'bg-yellow-100 text-yellow-800',
  BANNED:    'bg-red-100 text-red-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
}

const ROLE_COLORS: Record<string, string> = {
  BUYER:    'bg-blue-100 text-blue-800',
  MERCHANT: 'bg-purple-100 text-purple-800',
  ADMIN:    'bg-red-100 text-red-800',
}

type ConfirmModal = { type: 'suspend' | 'ban' | 'activate'; userId: string; userName: string } | null

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [params, setParams] = useState<GetUsersParams>({ page: 1, limit: 20, search: '', role: 'ALL', status: 'ALL' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [modal, setModal] = useState<ConfirmModal>(null)
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const load = useCallback(async (p: GetUsersParams) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetUsers(p)
      setUsers(res.users)
      setPagination(res.pagination)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(params) }, [params, load])

  const updateParam = (key: keyof GetUsersParams, value: string | number) =>
    setParams(prev => ({ ...prev, [key]: value, page: key === 'page' ? (value as number) : 1 }))

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleAll = () =>
    setSelected(prev => prev.length === users.length ? [] : users.map(u => u.id))

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  async function handleAction() {
    if (!modal) return
    setActionLoading(true)
    try {
      if (modal.type === 'suspend') await apiSuspendUser(modal.userId, { reason })
      else if (modal.type === 'ban')     await apiBanUser(modal.userId, { reason, permanent: true })
      else if (modal.type === 'activate') await apiActivateUser(modal.userId)
      showFeedback(`User ${modal.type}d successfully`)
      setModal(null)
      setReason('')
      load(params)
    } catch {
      setError(`Failed to ${modal.type} user`)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleBulkAction(action: string) {
    if (!selected.length) return
    setActionLoading(true)
    try {
      await apiBulkAction(selected, action)
      showFeedback(`Bulk ${action} applied to ${selected.length} user(s)`)
      setSelected([])
      load(params)
    } catch {
      setError('Bulk action failed')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>

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

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search phone or name…"
                value={params.search}
                onChange={e => updateParam('search', e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={params.role}
              onChange={e => updateParam('role', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {['ALL', 'BUYER', 'MERCHANT', 'ADMIN'].map(r => <option key={r}>{r}</option>)}
            </select>
            <select
              value={params.status}
              onChange={e => updateParam('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {['ALL', 'ACTIVE', 'PENDING', 'BANNED', 'SUSPENDED'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-sm text-blue-800">{selected.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction('SUSPEND')} disabled={actionLoading}>Suspend</Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction('BAN')} disabled={actionLoading} className="text-red-600 border-red-300">Ban</Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction('VERIFY')} disabled={actionLoading}>Verify</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={selected.length === users.length && users.length > 0} onChange={toggleAll} />
                </th>
                {['Phone', 'Role', 'Status', 'Registered', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <Link href={`/admin/users/${u.id}`} className="hover:text-blue-600">{u.phone}</Link>
                    {u.profile && <div className="text-xs text-gray-500">{u.profile.firstName} {u.profile.lastName}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={u.role} colorClass={ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-800'} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={u.status} colorClass={STATUS_COLORS[u.status] ?? 'bg-gray-100 text-gray-800'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {u.lastLoginAt ? format(new Date(u.lastLoginAt), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.status !== 'SUSPENDED' && u.role !== 'ADMIN' && (
                        <button
                          onClick={() => setModal({ type: 'suspend', userId: u.id, userName: u.phone })}
                          className="text-xs px-2 py-1 rounded text-orange-700 bg-orange-50 hover:bg-orange-100"
                        >Suspend</button>
                      )}
                      {u.status !== 'BANNED' && u.role !== 'ADMIN' && (
                        <button
                          onClick={() => setModal({ type: 'ban', userId: u.id, userName: u.phone })}
                          className="text-xs px-2 py-1 rounded text-red-700 bg-red-50 hover:bg-red-100"
                        >Ban</button>
                      )}
                      {(u.status === 'BANNED' || u.status === 'SUSPENDED') && (
                        <button
                          onClick={() => setModal({ type: 'activate', userId: u.id, userName: u.phone })}
                          className="text-xs px-2 py-1 rounded text-green-700 bg-green-50 hover:bg-green-100"
                        >Activate</button>
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
          {pagination.total} total · page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm" variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => updateParam('page', pagination.page - 1)}
          ><ChevronLeft className="h-4 w-4" /></Button>
          <Button
            size="sm" variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => updateParam('page', pagination.page + 1)}
          ><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <CardTitle className="capitalize">{modal.type} {modal.userName}</CardTitle>
            {modal.type !== 'activate' && (
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
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setModal(null); setReason('') }}>Cancel</Button>
              <Button
                onClick={handleAction}
                disabled={actionLoading || (modal.type !== 'activate' && !reason.trim())}
                className={modal.type === 'ban' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {actionLoading ? 'Processing…' : `Confirm ${modal.type}`}
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
