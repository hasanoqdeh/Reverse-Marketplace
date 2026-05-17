'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiGetMe, apiUpdateMyProfile, AdminUser } from '@/lib/adminAPI'
import { format } from 'date-fns'
import { User, Phone, Shield, Clock, CheckCircle, AlertCircle, Pencil, X } from 'lucide-react'

function InfoCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="px-5 py-1 divide-y divide-slate-100">
        {children}
      </div>
    </div>
  )
}

function Detail({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-slate-500 whitespace-nowrap">{label}</span>
      <span className={`text-sm font-medium text-right ${valueClass ?? 'text-slate-900'}`}>{value}</span>
    </div>
  )
}

export default function ProfilePage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)
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
      setFeedback({ msg: 'Profile updated successfully.', ok: true })
      setEditing(false)
    } catch {
      setFeedback({ msg: 'Failed to save changes.', ok: false })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <ProfileSkeleton />
  if (error) return (
    <div className="p-5">
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
    </div>
  )
  if (!admin) return null

  const fullName = admin.profile?.firstName && admin.profile?.lastName
    ? `${admin.profile.firstName} ${admin.profile.lastName}`
    : admin.phone

  const initials = admin.profile?.firstName
    ? `${admin.profile.firstName[0]}${admin.profile.lastName?.[0] ?? ''}`.toUpperCase()
    : admin.phone[0].toUpperCase()

  const subRoleLabel: Record<string, string> = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', SUPPORT: 'Support' }

  return (
    <div className="p-5 sm:p-6 space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your account details and permissions.</p>
      </div>

      {feedback && (
        <Alert className={feedback.ok ? 'rounded-xl border-green-200 bg-green-50' : 'rounded-xl border-red-200 bg-red-50'}>
          <AlertDescription className={feedback.ok ? 'text-green-800' : 'text-red-800'}>
            {feedback.msg}
          </AlertDescription>
        </Alert>
      )}

      {/* Identity hero */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{fullName}</p>
              <p className="text-sm text-slate-500">{admin.phone}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200">
                  {subRoleLabel[admin.adminSubRole ?? ''] ?? admin.adminSubRole ?? 'Admin'}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${admin.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                  {admin.status === 'ACTIVE'
                    ? <CheckCircle className="h-3 w-3" />
                    : <AlertCircle className="h-3 w-3" />
                  }
                  {admin.status}
                </span>
              </div>
            </div>
          </div>
          {!editing && (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-xl border border-blue-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Edit Profile</h2>
            <button onClick={cancelEdit} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { id: 'firstName', label: 'First Name', key: 'firstName' as const },
                { id: 'lastName',  label: 'Last Name',  key: 'lastName'  as const },
                { id: 'city',      label: 'City',       key: 'city'      as const, placeholder: 'Optional' },
                { id: 'country',   label: 'Country',    key: 'country'   as const, placeholder: 'e.g. JO' },
              ].map(f => (
                <div key={f.id} className="space-y-1.5">
                  <Label htmlFor={f.id} className="text-xs font-semibold text-slate-600">{f.label}</Label>
                  <Input
                    id={f.id}
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={User} title="Account Details">
          <Detail label="Full Name" value={fullName} />
          <Detail label="Phone"     value={admin.phone} />
          <Detail label="Role"      value="Admin" />
          <Detail label="Sub-role"  value={subRoleLabel[admin.adminSubRole ?? ''] ?? admin.adminSubRole ?? '—'} />
          {admin.profile?.city    && <Detail label="City"    value={admin.profile.city} />}
          {admin.profile?.country && <Detail label="Country" value={admin.profile.country} />}
        </InfoCard>

        <InfoCard icon={Shield} title="Security">
          <Detail
            label="Phone Verified"
            value={admin.phoneVerified ? 'Verified' : 'Not verified'}
            valueClass={admin.phoneVerified ? 'text-green-600' : 'text-red-600'}
          />
          <Detail
            label="Account Status"
            value={admin.status}
            valueClass={admin.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}
          />
          <Detail
            label="Failed Logins"
            value={String(admin.failedLoginAttempts ?? 0)}
            valueClass={Number(admin.failedLoginAttempts) > 0 ? 'text-orange-600' : undefined}
          />
          {admin.lockedUntil && (
            <Detail label="Locked Until" value={format(new Date(admin.lockedUntil), 'MMM d, yyyy HH:mm')} valueClass="text-red-600" />
          )}
        </InfoCard>

        <InfoCard icon={Clock} title="Login History">
          <Detail label="Account Created" value={admin.createdAt ? format(new Date(admin.createdAt), 'MMM d, yyyy') : '—'} />
          <Detail label="Last Login"      value={admin.lastLoginAt ? format(new Date(admin.lastLoginAt), 'MMM d, yyyy HH:mm') : 'Never'} />
        </InfoCard>

        {Object.keys(permissions).length > 0 && (
          <InfoCard icon={Shield} title="Permissions">
            {Object.entries(permissions).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                {val
                  ? <CheckCircle className="h-4 w-4 text-green-500" />
                  : <AlertCircle className="h-4 w-4 text-slate-300" />
                }
              </div>
            ))}
          </InfoCard>
        )}
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="p-5 sm:p-6 space-y-5 max-w-4xl animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-32" />
      <div className="h-24 bg-slate-200 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(3)].map((_, i) => <div key={i} className="h-44 bg-slate-200 rounded-xl" />)}
      </div>
    </div>
  )
}
