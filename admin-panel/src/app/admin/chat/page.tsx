'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '../../../components/layout/AdminLayout'
import { apiAdminGetChatRooms, ChatRoom, RoomType, Pagination } from '../../../lib/adminAPI'

const ROOM_TYPE_COLORS: Record<RoomType, { bg: string; text: string }> = {
  DIRECT:  { bg: 'bg-blue-100',  text: 'text-blue-800' },
  GROUP:   { bg: 'bg-purple-100', text: 'text-purple-800' },
  REQUEST: { bg: 'bg-green-100', text: 'text-green-800' },
  BID:     { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  SUPPORT: { bg: 'bg-red-100',   text: 'text-red-800' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminChatPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean | undefined> = { page, limit: 20 }
      if (search) params.search = search
      if (typeFilter) params.type = typeFilter
      if (activeFilter !== '') params.isActive = activeFilter === 'true'
      const res = await apiAdminGetChatRooms(params as never)
      setRooms(res.rooms)
      setPagination(res.pagination)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter, activeFilter])

  useEffect(() => { load() }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    load()
  }

  const totalRooms = pagination?.total ?? 0
  const activeRooms = rooms.filter(r => r.isActive).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat Monitoring</h1>
            <p className="mt-1 text-sm text-gray-500">Monitor and moderate all chat rooms</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Rooms" value={totalRooms} color="blue" />
          <StatCard label="Active" value={activeRooms} color="green" />
          <StatCard label="This Page" value={rooms.length} color="purple" />
          <StatCard label="Pages" value={pagination?.totalPages ?? 0} color="gray" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="DIRECT">Direct</option>
                <option value="GROUP">Group</option>
                <option value="REQUEST">Request</option>
                <option value="BID">Bid</option>
                <option value="SUPPORT">Support</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={activeFilter}
                onChange={e => { setActiveFilter(e.target.value); setPage(1) }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Type', 'Participants', 'Messages', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading…</td></tr>
                ) : rooms.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No chat rooms found</td></tr>
                ) : rooms.map(room => {
                  const tc = ROOM_TYPE_COLORS[room.type] ?? ROOM_TYPE_COLORS.DIRECT
                  return (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{room.name}</div>
                        {room.description && <div className="text-xs text-gray-500 truncate max-w-xs">{room.description}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tc.bg} ${tc.text}`}>
                          {room.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{room._count?.participants ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{room._count?.messages ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${room.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {room.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(room.createdAt)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/admin/chat/${room.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} rooms)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600', green: 'text-green-600', purple: 'text-purple-600', gray: 'text-gray-600',
  }
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color] ?? 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
