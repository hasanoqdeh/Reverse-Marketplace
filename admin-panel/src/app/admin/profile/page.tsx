'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiGetMe, apiUpdateMyProfile, AdminUser } from '@/lib/adminAPI'
import { format } from 'date-fns'
import { User, Phone, Shield, Clock, CheckCircle, AlertCircle, Pencil, X } from 'lucide-react'

export default function ProfilePage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', city: '', country: '' })

  useEffect(() => {
    apiGetMe()
      .then(res => {
        setAdmin(res.admin)
        setPermissions(res.permissions ?? {})
        setForm({
          firstName: res.admin.profile?.firstName ?? '',
          lastName:  res.admin.profile?.lastName  ?? '',
          city:      res.admin.profile?.city      ?? '',
          country:   res.admin.profile?.country   ?? '',
        })
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  function startEdit() { setEditing(true); setFeedback(null) }
  function cancelEdit() {
    setEditing(false)
    setForm({
      firstName: admin?.profile?.firstName ?? '',
      lastName:  admin?.profile?.lastName  ?? '',
      city:      admin?.profile?.city      ?? '',
      country:   admin?.profile?.country   ?? '',
    })
  }

  async function save() {
    setSaving(true)
    setFeedback(null)
    try {
      const res = await apiUpdateMyProfile(form)
      setAdmin(res.admin)
      setFeedback('Profile updated successfully.')
      setEditing(false)
    } catch {
      setFeedback('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <ProfileSkeleton />
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!admin) return null

  const fullName = admin.profile?.firstName && admin.profile?.lastName
    ? `${admin.profile.firstName} ${admin.profile.lastName}`
    : admin.phone

  const initials = admin.profile?.firstName
    ? `${admin.profile.firstName[0]}${admin.profile.lastName?.[0] ?? ''}`.toUpperCase()
    : admin.phone[0].toUpperCase()

  const subRoleLabel: Record<string, string> = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', SUPPORT: 'Support' }
  const statusColor = admin.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
  const StatusIcon = admin.status === 'ACTIVE' ? CheckCircle : AlertCircle

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {feedback && (
        <Alert className={feedback.includes('success') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={feedback.includes('success') ? 'text-green-800' : 'text-red-800'}>
            {feedback}
          </AlertDescription>
        </Alert>
      )}

      {/* Identity card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{fullName}</p>
                <p className="text-sm text-gray-500">{admin.phone}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {subRoleLabel[admin.adminSubRole ?? ''] ?? admin.adminSubRole ?? 'Admin'}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${statusColor}`}>
                    <StatusIcon className="h-3 w-3" />
                    {admin.status}
                  </span>
                </div>
              </div>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={startEdit} className="flex items-center gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      {editing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g. JO" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
              <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Account details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Detail label="Full Name" value={fullName} />
            <Detail label="Phone" value={admin.phone} icon={<Phone className="h-4 w-4 text-gray-400" />} />
            <Detail label="Role" value="Admin" />
            <Detail label="Sub-role" value={subRoleLabel[admin.adminSubRole ?? ''] ?? admin.adminSubRole ?? '—'} />
            {admin.profile?.city && <Detail label="City" value={admin.profile.city} />}
            {admin.profile?.country && <Detail label="Country" value={admin.profile.country} />}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Detail
              label="Phone Verified"
              value={admin.phoneVerified ? 'Yes' : 'No'}
              valueClass={admin.phoneVerified ? 'text-green-600' : 'text-red-600'}
            />
            <Detail
              label="Account Status"
              value={admin.status}
              valueClass={admin.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}
            />
            <Detail
              label="Failed Login Attempts"
              value={String(admin.failedLoginAttempts ?? 0)}
              valueClass={Number(admin.failedLoginAttempts) > 0 ? 'text-orange-600' : undefined}
            />
            {admin.lockedUntil && (
              <Detail label="Locked Until" value={format(new Date(admin.lockedUntil), 'MMM d, yyyy HH:mm')} valueClass="text-red-600" />
            )}
          </CardContent>
        </Card>

        {/* Login history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              Login History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Detail
              label="Account Created"
              value={admin.createdAt ? format(new Date(admin.createdAt), 'MMM d, yyyy') : '—'}
            />
            <Detail
              label="Last Login"
              value={admin.lastLoginAt ? format(new Date(admin.lastLoginAt), 'MMM d, yyyy HH:mm') : 'Never'}
            />
          </CardContent>
        </Card>

        {/* Permissions */}
        {Object.keys(permissions).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Object.entries(permissions).map(([key, val]) => (
                  <li key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {val
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : <AlertCircle className="h-4 w-4 text-gray-300" />
                    }
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function Detail({ label, value, icon, valueClass }: {
  label: string; value: string; icon?: React.ReactNode; valueClass?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500 whitespace-nowrap">{label}</span>
      <span className={`text-sm font-medium text-right ${valueClass ?? 'text-gray-900'} flex items-center gap-1`}>
        {icon}{value}
      </span>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-36" />
      <div className="h-28 bg-gray-200 rounded-lg" />
      <div className="grid gap-6 sm:grid-cols-2">
        {[...Array(3)].map((_, i) => <div key={i} className="h-44 bg-gray-200 rounded-lg" />)}
      </div>
    </div>
  )
}
