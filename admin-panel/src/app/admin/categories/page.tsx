'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  apiGetCategories, apiCreateCategory, apiDeleteCategory,
  RequestCategory, CategoryPayload,
} from '@/lib/adminAPI'
import { AlertCircle, Plus, Pencil, Trash2, X, Check } from 'lucide-react'

const EMPTY_FORM: CategoryPayload = {
  name: '', slug: '', description: '', icon: '', parentId: null, isActive: true, sortOrder: 0,
}

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
      const payload: CategoryPayload = {
        ...form,
        parentId: form.parentId || null,
        slug: form.slug || autoSlug(form.name),
      }
      await apiCreateCategory(payload)
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
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Category
        </Button>
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

      {/* Create form (inline only for new categories) */}
      {createOpen && (
        <Card className="border-blue-200">
          <CardHeader><CardTitle>New Category</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input value={form.name} onChange={e => handleNameChange(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <Input
                    value={form.slug ?? ''}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="auto-generated"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <Input
                    value={form.icon ?? ''}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="e.g. 🛠️ or icon-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <Input
                    type="number"
                    value={form.sortOrder ?? 0}
                    onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description ?? ''}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <select
                    value={form.parentId ?? ''}
                    onChange={e => setForm(f => ({ ...f, parentId: e.target.value || null }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">None (root)</option>
                    {rootCats.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive ?? true}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeCreate}>
                  <X className="h-4 w-4 mr-1" />Cancel
                </Button>
                <Button type="submit" disabled={actionLoading || !form.name.trim()}>
                  <Check className="h-4 w-4 mr-1" />
                  {actionLoading ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Category list */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading…</div>
      ) : rootCats.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No categories yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {rootCats.map(cat => (
            <Card key={cat.id}>
              <CardContent className="py-3">
                <CategoryRow cat={cat} onDelete={setDeleteModal} />
                {childCats(cat.id).map(child => (
                  <div key={child.id} className="ml-6 mt-2 pl-4 border-l-2 border-gray-100">
                    <CategoryRow cat={child} onDelete={setDeleteModal} />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-red-700">Delete Category</h2>
            <p className="text-sm text-gray-600">
              Delete <strong>{deleteModal.name}</strong>? This may fail if there are requests in this category.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button>
              <Button onClick={handleDelete} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
                {actionLoading ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryRow({
  cat,
  onDelete,
}: {
  cat: RequestCategory
  onDelete: (d: { id: string; name: string }) => void
}) {
  return (
    <div className="flex items-center gap-3">
      {cat.icon && <span className="text-xl">{cat.icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{cat.name}</span>
          <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
          {!cat.isActive && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
              Inactive
            </span>
          )}
        </div>
        {cat.description && (
          <p className="text-xs text-gray-500 truncate">{cat.description}</p>
        )}
      </div>
      <span className="text-xs text-gray-400">#{cat.sortOrder}</span>
      <Link href={`/admin/categories/${cat.id}/edit`}>
        <button className="p-1 rounded text-blue-600 hover:bg-blue-50" title="Edit category">
          <Pencil className="h-4 w-4" />
        </button>
      </Link>
      <button
        onClick={() => onDelete({ id: cat.id, name: cat.name })}
        className="p-1 rounded text-red-600 hover:bg-red-50"
        title="Delete category"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
