'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  apiGetCategories, apiUpdateCategory,
  RequestCategory, CategoryPayload,
} from '@/lib/adminAPI'
import { AlertCircle, ArrowLeft, Check } from 'lucide-react'

export default function CategoryEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [allCategories, setAllCategories] = useState<RequestCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const [form, setForm] = useState<CategoryPayload>({
    name: '', slug: '', description: '', icon: '', parentId: null, isActive: true, sortOrder: 0,
  })

  useEffect(() => {
    apiGetCategories()
      .then(res => {
        setAllCategories(res.categories)
        const cat = res.categories.find(c => c.id === id)
        if (cat) {
          setForm({
            name: cat.name,
            slug: cat.slug,
            description: cat.description ?? '',
            icon: cat.icon ?? '',
            parentId: cat.parentId,
            isActive: cat.isActive,
            sortOrder: cat.sortOrder,
          })
        } else {
          setError('Category not found')
        }
      })
      .catch(() => setError('Failed to load category'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await apiUpdateCategory(id, { ...form, parentId: form.parentId || null })
      setFeedback('Category updated')
      setTimeout(() => router.push('/admin/categories'), 1000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const rootCats = allCategories.filter(c => !c.parentId && c.id !== id)

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/categories">
          <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
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

      <Card>
        <CardHeader><CardTitle>Category Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <Input
                  value={form.slug ?? ''}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
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
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/admin/categories">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={saving || !form.name.trim()}>
                <Check className="h-4 w-4 mr-1" />
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
