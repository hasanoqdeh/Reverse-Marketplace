'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  apiGetUsers, apiSuspendUser, apiBanUser, apiActivateUser, apiBulkAction,
  AdminUser, GetUsersParams,
} from '@/lib/adminAPI'
import { format } from 'date-fns'
import { Search, ChevronLeft, ChevronRight, AlertCircle, Users, CheckCircle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'bg-green-100 text-green-700 ring-green-200',
  PENDING:   'bg-yellow-100 text-yellow-700 ring-yellow-200',
  BANNED:    'bg-red-100 text-red-700 ring-red-200',
  SUSPENDED: 'bg-orange-100 text-orange-700 ring-orange-200',
}

const ROLE_COLORS: Record<string, string> = {
  BUYER:    'bg-blue-100 text-blue-700 ring-blue-200',
  MERCHANT: 'bg-violet-100 text-violet-700 ring-violet-200',
  ADMIN:    'bg-slate-100 text-slate-700 ring-slate-200',
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
      if (modal.type === 'suspend')  await apiSuspendUser(modal.userId, { reason })
      else if (modal.type === 'ban') await apiBanUser(modal.userId, { reason, permanent: true })
      else                           await apiActivateUser(modal.userId)
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

  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="p-5 sm:p-6 space-y-5 max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage and moderate platform users.</p>
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

      {/* Filters row — inline, no extra card */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by phone or name…"
            value={params.search}
            onChange={e => updateParam('search', e.target.value)}
            className="pl-9 h-9 text-sm border-slate-200 bg-white"
          />
        </div>
        <select
          value={params.role}
          onChange={e => updateParam('role', e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
        >
          {['ALL', 'BUYER', 'MERCHANT', 'ADMIN'].map(r => <option key={r} value={r}>{r === 'ALL' ? 'All roles' : r}</option>)}
        </select>
        <select
          value={params.status}
          onChange={e => updateParam('status', e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
        >
          {['ALL', 'ACTIVE', 'PENDING', 'BANNED', 'SUSPENDED'].map(s => <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</option>)}
        </select>
      </div>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-800">{selected.length} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('SUSPEND')} disabled={actionLoading} className="h-7 text-xs">Suspend</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('BAN')} disabled={actionLoading} className="h-7 text-xs text-red-600 border-red-300 hover:bg-red-50">Ban</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('VERIFY')} disabled={actionLoading} className="h-7 text-xs">Verify</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])} className="h-7 text-xs text-slate-500">Clear</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === users.length && users.length > 0}
                    onChange={toggleAll}
                    className="rounded border-slate-300"
                  />
                </th>
                {['User', 'Role', 'Status', 'Joined', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-4 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                    <td className="px-4 py-3"><div className="h-5 bg-slate-200 rounded-full w-16" /></td>
                    <td className="px-4 py-3"><div className="h-5 bg-slate-200 rounded-full w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-6 bg-slate-200 rounded w-24" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No users found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(u.id)}
                      onChange={() => toggleSelect(u.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${u.id}`} className="group">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{u.phone}</p>
                      {u.profile && (
                        <p className="text-xs text-slate-400 mt-0.5">{u.profile.firstName} {u.profile.lastName}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={u.role} colorClass={ROLE_COLORS[u.role] ?? 'bg-slate-100 text-slate-700 ring-slate-200'} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={u.status} colorClass={STATUS_COLORS[u.status] ?? 'bg-slate-100 text-slate-700 ring-slate-200'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                    {u.lastLoginAt ? format(new Date(u.lastLoginAt), 'MMM d, yyyy') : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {u.status !== 'SUSPENDED' && u.role !== 'ADMIN' && (
                        <ActionBtn
                          label="Suspend"
                          onClick={() => setModal({ type: 'suspend', userId: u.id, userName: u.phone })}
                          className="text-amber-700 bg-amber-50 hover:bg-amber-100"
                        />
                      )}
                      {u.status !== 'BANNED' && u.role !== 'ADMIN' && (
                        <ActionBtn
                          label="Ban"
                          onClick={() => setModal({ type: 'ban', userId: u.id, userName: u.phone })}
                          className="text-red-700 bg-red-50 hover:bg-red-100"
                        />
                      )}
                      {(u.status === 'BANNED' || u.status === 'SUSPENDED') && (
                        <ActionBtn
                          label="Activate"
                          onClick={() => setModal({ type: 'activate', userId: u.id, userName: u.phone })}
                          className="text-green-700 bg-green-50 hover:bg-green-100"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-500">
              Showing <span className="font-medium text-slate-700">{rangeStart}–{rangeEnd}</span> of <span className="font-medium text-slate-700">{pagination.total}</span> users
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => updateParam('page', pagination.page - 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center px-3 h-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700">
                {pagination.page} / {pagination.totalPages}
              </div>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateParam('page', pagination.page + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-base font-semibold text-slate-900 capitalize">{modal.type} User</h2>
              <p className="text-sm text-slate-500 mt-1">
                You are about to <strong className="text-slate-700">{modal.type}</strong> <strong className="text-slate-700">{modal.userName}</strong>.
                {modal.type !== 'activate' && ' This action requires a reason.'}
              </p>
            </div>
            {modal.type !== 'activate' && (
              <div className="px-6 pb-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason <span className="text-red-500">*</span></label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Provide a reason…"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 px-6 pb-5 pt-3">
              <Button variant="outline" onClick={() => { setModal(null); setReason('') }} className="rounded-xl">Cancel</Button>
              <Button
                onClick={handleAction}
                disabled={actionLoading || (modal.type !== 'activate' && !reason.trim())}
                className={`rounded-xl ${modal.type === 'ban' ? 'bg-red-600 hover:bg-red-700' : modal.type === 'suspend' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${colorClass}`}>
      {label}
    </span>
  )
}

function ActionBtn({ label, onClick, className }: { label: string; onClick: () => void; className: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${className}`}
    >
      {label}
    </button>
  )
}
