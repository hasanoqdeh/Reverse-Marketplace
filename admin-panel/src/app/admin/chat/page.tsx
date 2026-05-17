'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiAdminGetChatRooms, ChatRoom, RoomType, Pagination } from '../../../lib/adminAPI'
import { MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'

const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  DIRECT:  'bg-blue-100 text-blue-700 ring-blue-200',
  GROUP:   'bg-violet-100 text-violet-700 ring-violet-200',
  REQUEST: 'bg-green-100 text-green-700 ring-green-200',
  BID:     'bg-amber-100 text-amber-700 ring-amber-200',
  SUPPORT: 'bg-red-100 text-red-700 ring-red-200',
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
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, search, typeFilter, activeFilter])

  useEffect(() => { load() }, [load])

  const totalRooms = pagination?.total ?? 0
  const activeRooms = rooms.filter(r => r.isActive).length
  const rangeStart = totalRooms === 0 ? 0 : (page - 1) * 20 + 1
  const rangeEnd = Math.min(page * 20, totalRooms)

  return (
    <div className="p-5 sm:p-6 space-y-5 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Chat Monitoring</h1>
        <p className="text-sm text-slate-500 mt-0.5">Monitor and moderate all chat rooms.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Rooms',  value: totalRooms,                  bg: 'bg-blue-50',   text: 'text-blue-700' },
          { label: 'Active',       value: activeRooms,                 bg: 'bg-green-50',  text: 'text-green-700' },
          { label: 'This Page',    value: rooms.length,                bg: 'bg-violet-50', text: 'text-violet-700' },
          { label: 'Total Pages',  value: pagination?.totalPages ?? 0, bg: 'bg-slate-50',  text: 'text-slate-700' },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`${bg} rounded-xl px-4 py-3`}>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form
        onSubmit={e => { e.preventDefault(); setPage(1); load() }}
        className="flex flex-wrap gap-2.5 items-center"
      >
        <div className="relative flex-1 min-w-52">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by room name…"
            className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-3 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All types</option>
          {['DIRECT', 'GROUP', 'REQUEST', 'BID', 'SUPPORT'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={activeFilter}
          onChange={e => { setActiveFilter(e.target.value); setPage(1) }}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          type="submit"
          className="h-9 px-4 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Name', 'Type', 'Participants', 'Messages', 'Status', 'Created', 'Actions'].map(h => (
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
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No chat rooms found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : rooms.map(room => (
                <tr key={room.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-sm font-medium text-slate-900 truncate">{room.name}</p>
                    {room.description && <p className="text-xs text-slate-400 truncate mt-0.5">{room.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${ROOM_TYPE_COLORS[room.type] ?? 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                      {room.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{room._count?.participants ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{room._count?.messages ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${room.isActive ? 'bg-green-100 text-green-700 ring-green-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                      {room.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{formatDate(room.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/admin/chat/${room.id}`)}
                      className="text-xs font-medium px-2 py-1 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && rooms.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-500">
              Showing <span className="font-medium text-slate-700">{rangeStart}–{rangeEnd}</span> of <span className="font-medium text-slate-700">{totalRooms}</span>
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              ><ChevronLeft className="h-4 w-4" /></button>
              <div className="flex items-center px-3 h-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700">
                {page} / {pagination?.totalPages ?? 1}
              </div>
              <button
                disabled={!pagination || page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              ><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
