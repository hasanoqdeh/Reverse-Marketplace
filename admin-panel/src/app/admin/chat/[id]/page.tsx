'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '../../../../components/layout/AdminLayout'
import {
  apiAdminGetChatRoom, apiAdminGetChatMessages, apiAdminDeleteChatMessage,
  ChatRoom, ChatMessage, Pagination,
} from '../../../../lib/adminAPI'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const TYPE_ICON: Record<string, string> = {
  TEXT: '💬', IMAGE: '🖼', FILE: '📎', VOICE: '🎤', VIDEO: '🎥', LOCATION: '📍', SYSTEM: '⚙️',
}

const ROOM_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  DIRECT:  { bg: 'bg-blue-100',   text: 'text-blue-800' },
  GROUP:   { bg: 'bg-purple-100', text: 'text-purple-800' },
  REQUEST: { bg: 'bg-green-100',  text: 'text-green-800' },
  BID:     { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  SUPPORT: { bg: 'bg-red-100',    text: 'text-red-800' },
}

export default function AdminChatRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [msgPagination, setMsgPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(true)
  const [msgPage, setMsgPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadRoom = useCallback(async () => {
    try {
      const res = await apiAdminGetChatRoom(params.id)
      setRoom(res.room)
    } catch {
      router.push('/admin/chat')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  const loadMessages = useCallback(async () => {
    setMsgLoading(true)
    try {
      const res = await apiAdminGetChatMessages(params.id, { page: msgPage, limit: 50 })
      setMessages(res.messages)
      setMsgPagination(res.pagination)
    } catch {
      // ignore
    } finally {
      setMsgLoading(false)
    }
  }, [params.id, msgPage])

  useEffect(() => { loadRoom() }, [loadRoom])
  useEffect(() => { loadMessages() }, [loadMessages])

  async function handleDelete(messageId: string) {
    setDeleteLoading(true)
    try {
      await apiAdminDeleteChatMessage(messageId)
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: '[Message deleted]' } : m))
      setDeleteConfirm(null)
    } catch {
      // ignore
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    )
  }

  if (!room) return null

  const tc = ROOM_TYPE_COLORS[room.type] ?? ROOM_TYPE_COLORS.DIRECT

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/chat')}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tc.bg} ${tc.text}`}>
                {room.type}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${room.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {room.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {room.description && <p className="text-sm text-gray-500 mt-1">{room.description}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Messages {msgPagination && `(${msgPagination.total})`}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMsgPage(p => Math.max(1, p - 1))}
                    disabled={msgPage === 1}
                    className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <span className="px-3 py-1 text-xs text-gray-500">
                    {msgPage}/{msgPagination?.totalPages ?? 1}
                  </span>
                  <button
                    onClick={() => setMsgPage(p => Math.min(msgPagination?.totalPages ?? 1, p + 1))}
                    disabled={msgPage === (msgPagination?.totalPages ?? 1)}
                    className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {msgLoading ? (
                  <div className="py-12 text-center text-gray-500">Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">No messages yet</div>
                ) : messages.map(msg => (
                  <div key={msg.id} className={`px-6 py-4 ${msg.isDeleted ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {msg.senderId.slice(0, 8)}…
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
                          <span className="text-xs">{TYPE_ICON[msg.type] ?? '💬'}</span>
                          {msg.isEdited && <span className="text-xs text-gray-400 italic">edited</span>}
                          {msg.isDeleted && <span className="text-xs text-red-400 font-medium">deleted</span>}
                        </div>
                        <p className="text-sm text-gray-800 break-words">{msg.content}</p>
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {Object.entries(
                              msg.reactions.reduce((acc, r) => {
                                acc[r.reactionType] = (acc[r.reactionType] || 0) + 1
                                return acc
                              }, {} as Record<string, number>)
                            ).map(([emoji, count]) => (
                              <span key={emoji} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                {emoji} {count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {!msg.isDeleted && (
                        <button
                          onClick={() => setDeleteConfirm(msg.id)}
                          className="text-red-400 hover:text-red-600 text-xs font-medium flex-shrink-0"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Room info */}
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Room Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">ID</dt>
                  <dd className="font-mono text-gray-700 text-xs">{room.id.slice(0, 12)}…</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="font-medium">{room.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Participants</dt>
                  <dd className="font-medium">{room._count?.participants ?? room.participants?.length ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Messages</dt>
                  <dd className="font-medium">{room._count?.messages ?? msgPagination?.total ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Created</dt>
                  <dd>{new Date(room.createdAt).toLocaleDateString()}</dd>
                </div>
                {room.relatedRequestId && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Request</dt>
                    <dd>
                      <a href={`/admin/requests/${room.relatedRequestId}`} className="text-blue-600 hover:underline text-xs">
                        View →
                      </a>
                    </dd>
                  </div>
                )}
                {room.relatedBidId && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Bid</dt>
                    <dd>
                      <a href={`/admin/bids/${room.relatedBidId}`} className="text-blue-600 hover:underline text-xs">
                        View →
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Participants */}
            {room.participants && room.participants.length > 0 && (
              <div className="bg-white rounded-lg shadow p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Participants</h3>
                <div className="space-y-2">
                  {room.participants.map(p => (
                    <div key={p.userId} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-gray-600 text-xs">{p.userId.slice(0, 12)}…</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        p.role === 'OWNER' ? 'bg-yellow-100 text-yellow-800' :
                        p.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>{p.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Message</h3>
            <p className="text-sm text-gray-600 mb-6">This message will be marked as deleted and its content will be replaced. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
