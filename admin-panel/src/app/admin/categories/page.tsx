'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  apiGetCategories, apiCreateCategory, apiDeleteCategory,
  RequestCategory, CategoryPayload,
} from '@/lib/adminAPI'
import { AlertCircle, Plus, Pencil, Trash2, X, Check, Tag, CheckCircle } from 'lucide-react'

const EMPTY_FORM: CategoryPayload = {
  name: '', slug: '', description: '', icon: '', parentId: null, isActive: true, sortOrder: 0,
}

const fieldCls = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<RequestCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<CategoryPayload>(EMPTY_FORM)
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetCategories()
      setCategories(res.categories)
    } catch {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  function handleNameChange(name: string) {
    setForm(prev => ({ ...prev, name, slug: autoSlug(name) }))
  }

  function closeCreate() {
    setCreateOpen(false)
    setForm(EMPTY_FORM)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setActionLoading(true)
    try {
      await apiCreateCategory({ ...form, parentId: form.parentId || null, slug: form.slug || autoSlug(form.name) })
      showFeedback('Category created')
      closeCreate()
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to create category')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteModal) return
    setActionLoading(true)
    try {
      await apiDeleteCategory(deleteModal.id)
      showFeedback('Category deleted')
      setDeleteModal(null)
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to delete category')
    } finally {
      setActionLoading(false)
    }
  }

  const rootCats = categories.filter(c => !c.parentId)
  const childCats = (parentId: string) => categories.filter(c => c.parentId === parentId)

  return (
    <div className="p-5 sm:p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage request categories and hierarchy.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 h-9 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5" /> New Category
        </button>
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

      {/* Create form */}
      {createOpen && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
          <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">New Category</h2>
            <button onClick={closeCreate} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Name <span className="text-red-500">*</span></label>
                <Input value={form.name} onChange={e => handleNameChange(e.target.value)} required className="rounded-xl border-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Slug</label>
                <Input
                  value={form.slug ?? ''}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="auto-generated"
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Icon</label>
                <Input
                  value={form.icon ?? ''}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="e.g. 🛠️ or icon-name"
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sort Order</label>
                <Input
                  type="number"
                  value={form.sortOrder ?? 0}
                  onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className={`${fieldCls} resize-none`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Parent Category</label>
                <select
                  value={form.parentId ?? ''}
                  onChange={e => setForm(f => ({ ...f, parentId: e.target.value || null }))}
                  className={fieldCls}
                >
                  <option value="">None (root)</option>
                  {rootCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2.5 pt-5">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive ?? true}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={closeCreate} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !form.name.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                {actionLoading ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rootCats.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Tag className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">No categories yet</p>
          <p className="text-xs text-slate-400">Create your first category to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rootCats.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border border-slate-200">
              <div className="px-4 py-3">
                <CategoryRow cat={cat} onDelete={setDeleteModal} />
              </div>
              {childCats(cat.id).map(child => (
                <div key={child.id} className="px-4 py-3 border-t border-slate-100 ml-8 pl-4 border-l-2 border-l-slate-100">
                  <CategoryRow cat={child} onDelete={setDeleteModal} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-base font-semibold text-red-700">Delete Category</h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Delete <strong className="text-slate-700">{deleteModal.name}</strong>? This may fail if there are requests in this category.
              </p>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={actionLoading} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors">
                {actionLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryRow({ cat, onDelete }: {
  cat: RequestCategory
  onDelete: (d: { id: string; name: string }) => void
}) {
  return (
    <div className="flex items-center gap-3">
      {cat.icon && <span className="text-xl shrink-0">{cat.icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-900">{cat.name}</span>
          <code className="text-xs text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded">{cat.slug}</code>
          {!cat.isActive && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200">
              Inactive
            </span>
          )}
        </div>
        {cat.description && (
          <p className="text-xs text-slate-400 truncate mt-0.5">{cat.description}</p>
        )}
      </div>
      <span className="text-xs text-slate-400 shrink-0">#{cat.sortOrder}</span>
      <Link href={`/admin/categories/${cat.id}/edit`}>
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </Link>
      <button
        onClick={() => onDelete({ id: cat.id, name: cat.name })}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
