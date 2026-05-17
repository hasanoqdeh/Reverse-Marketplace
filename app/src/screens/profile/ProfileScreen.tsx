import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import AppHeader from '../../components/AppHeader';

const PRIMARY = '#2563EB';

export default function ProfileScreen() {
  const {user, logout, updateProfile} = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.profile?.firstName ?? '',
    lastName:  user?.profile?.lastName  ?? '',
    city:      (user?.profile as any)?.city    ?? '',
    country:   (user?.profile as any)?.country ?? '',
  });

  const initials = user?.profile?.firstName
    ? `${user.profile.firstName[0]}${user.profile.lastName?.[0] ?? ''}`.toUpperCase()
    : (user?.phone?.[4] ?? 'U').toUpperCase();

  const displayName =
    user?.profile?.firstName && user?.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user?.phone ?? '';

  function startEdit() {
    setForm({
      firstName: user?.profile?.firstName ?? '',
      lastName:  user?.profile?.lastName  ?? '',
      city:      (user?.profile as any)?.city    ?? '',
      country:   (user?.profile as any)?.country ?? '',
    });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile(form);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try { await logout(); } finally { setLoggingOut(false); }
        },
      },
    ]);
  }

  return (
    <View style={styles.safe}>
      <AppHeader />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <Text style={styles.displayName}>{displayName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role ?? 'BUYER'}</Text>
            </View>
            {!editing && (
              <TouchableOpacity onPress={startEdit} style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Edit form */}
          {editing && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Edit Profile</Text>

              <Field
                label="First Name"
                value={form.firstName}
                onChangeText={v => setForm(f => ({...f, firstName: v}))}
                placeholder="Enter first name"
              />
              <Field
                label="Last Name"
                value={form.lastName}
                onChangeText={v => setForm(f => ({...f, lastName: v}))}
                placeholder="Enter last name"
              />
              <Field
                label="City"
                value={form.city}
                onChangeText={v => setForm(f => ({...f, city: v}))}
                placeholder="e.g. Amman"
              />
              <Field
                label="Country"
                value={form.country}
                onChangeText={v => setForm(f => ({...f, country: v}))}
                placeholder="e.g. JO"
              />

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.btnDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.8}>
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={cancelEdit}
                  disabled={saving}
                  activeOpacity={0.8}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Info card */}
          {!editing && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Account Information</Text>
              <InfoRow label="Phone" value={user?.phone ?? '—'} />
              <InfoRow label="Role" value={user?.role ?? '—'} />
              <InfoRow
                label="Status"
                value={user?.status ?? '—'}
                valueStyle={
                  user?.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                }
              />
              {user?.profile?.firstName ? (
                <InfoRow label="First Name" value={user.profile.firstName} />
              ) : null}
              {user?.profile?.lastName ? (
                <InfoRow label="Last Name" value={user.profile.lastName} />
              ) : null}
              {(user?.profile as any)?.city ? (
                <InfoRow label="City" value={(user?.profile as any).city} />
              ) : null}
              {(user?.profile as any)?.country ? (
                <InfoRow label="Country" value={(user?.profile as any).country} />
              ) : null}
            </View>
          )}

          {/* Logout */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={[styles.logoutBtn, loggingOut && styles.btnDisabled]}
              onPress={handleLogout}
              disabled={loggingOut}
              activeOpacity={0.8}>
              {loggingOut ? (
                <ActivityIndicator color="#DC2626" size="small" />
              ) : (
                <Text style={styles.logoutText}>Sign Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function InfoRow({label, value, valueStyle}: {label: string; value: string; valueStyle?: object}) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, valueStyle]}>{value}</Text>
    </View>
  );
}

function Field({label, value, onChangeText, placeholder}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: {marginBottom: 14},
  label: {fontSize: 13, color: '#6B7280', fontWeight: '600', marginBottom: 6},
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
});

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {fontSize: 14, color: '#6B7280', fontWeight: '500'},
  value: {fontSize: 14, color: '#111827', fontWeight: '600', maxWidth: '60%', textAlign: 'right'},
});

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F3F4F6'},
  editBtn: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  editBtnText: {fontSize: 14, fontWeight: '700', color: '#FFFFFF'},
  avatarSection: {
    backgroundColor: PRIMARY,
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitials: {fontSize: 32, fontWeight: '700', color: '#FFFFFF'},
  displayName: {fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8},
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {fontSize: 12, fontWeight: '600', color: '#FFFFFF', letterSpacing: 1},
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  formActions: {gap: 10, marginTop: 6},
  saveBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {color: '#FFFFFF', fontSize: 15, fontWeight: '700'},
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: {color: '#374151', fontSize: 15, fontWeight: '600'},
  btnDisabled: {opacity: 0.6},
  statusActive: {color: '#059669'},
  statusInactive: {color: '#DC2626'},
  logoutSection: {marginTop: 16, marginHorizontal: 16, marginBottom: 32},
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  logoutText: {fontSize: 16, fontWeight: '700', color: '#DC2626'},
});
