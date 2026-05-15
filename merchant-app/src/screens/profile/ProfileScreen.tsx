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
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../../context/AuthContext';

const PRIMARY = '#16A34A';

const STATUS_COLORS: Record<string, {bg: string; text: string}> = {
  ACTIVE:    {bg: '#DCFCE7', text: '#15803D'},
  INACTIVE:  {bg: '#F3F4F6', text: '#6B7280'},
  PENDING:   {bg: '#FEF9C3', text: '#A16207'},
  SUSPENDED: {bg: '#FEE2E2', text: '#DC2626'},
};

function ProfileScreen(): React.JSX.Element {
  const {user, logout, updateProfile} = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [form, setForm] = useState({
    firstName: (user?.profile as any)?.firstName ?? '',
    lastName:  (user?.profile as any)?.lastName  ?? '',
    city:      (user?.profile as any)?.city      ?? '',
    country:   (user?.profile as any)?.country   ?? '',
  });

  const phone = user?.phone ?? 'Unknown';
  const role = user?.role ?? 'MERCHANT';
  const status = user?.status ?? 'ACTIVE';
  const statusColors = STATUS_COLORS[status] ?? STATUS_COLORS.ACTIVE;

  const firstName = (user?.profile as any)?.firstName ?? '';
  const lastName  = (user?.profile as any)?.lastName  ?? '';
  const initials  = firstName
    ? `${firstName[0]}${lastName?.[0] ?? ''}`.toUpperCase()
    : 'M';
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : phone;

  function startEdit() {
    setForm({
      firstName: (user?.profile as any)?.firstName ?? '',
      lastName:  (user?.profile as any)?.lastName  ?? '',
      city:      (user?.profile as any)?.city      ?? '',
      country:   (user?.profile as any)?.country   ?? '',
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

  async function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try { await logout(); } finally { setLoggingOut(false); }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Profile</Text>
            {!editing && (
              <TouchableOpacity onPress={startEdit} style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.displayName}>{displayName}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{role}</Text>
              </View>
              <View style={[styles.statusBadge, {backgroundColor: statusColors.bg}]}>
                <View style={[styles.statusDot, {backgroundColor: statusColors.text}]} />
                <Text style={[styles.statusText, {color: statusColors.text}]}>{status}</Text>
              </View>
            </View>
          </View>

          {/* Edit form */}
          {editing && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Edit Profile</Text>
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
              <Text style={styles.cardLabel}>Account Information</Text>
              <InfoRow label="Phone Number" value={phone} />
              <View style={styles.divider} />
              <InfoRow label="Role" value={role} />
              <View style={styles.divider} />
              <InfoRow label="Account Status" value={status} valueColor={statusColors.text} />
              {firstName ? (
                <>
                  <View style={styles.divider} />
                  <InfoRow label="First Name" value={firstName} />
                </>
              ) : null}
              {lastName ? (
                <>
                  <View style={styles.divider} />
                  <InfoRow label="Last Name" value={lastName} />
                </>
              ) : null}
              {(user?.profile as any)?.city ? (
                <>
                  <View style={styles.divider} />
                  <InfoRow label="City" value={(user?.profile as any).city} />
                </>
              ) : null}
              {(user?.profile as any)?.country ? (
                <>
                  <View style={styles.divider} />
                  <InfoRow label="Country" value={(user?.profile as any).country} />
                </>
              ) : null}
            </View>
          )}

          {/* Logout */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={[styles.logoutButton, loggingOut && styles.btnDisabled]}
              onPress={handleLogout}
              disabled={loggingOut}
              activeOpacity={0.8}>
              {loggingOut ? (
                <ActivityIndicator color="#DC2626" size="small" />
              ) : (
                <Text style={styles.logoutText}>Log Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InfoRow({label, value, valueColor}: {label: string; value: string; valueColor?: string}) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.key}>{label}</Text>
      <Text style={[infoStyles.value, valueColor ? {color: valueColor} : undefined]}>{value}</Text>
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
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4},
  key: {fontSize: 14, color: '#6B7280'},
  value: {fontSize: 14, fontWeight: '600', color: '#111827'},
});

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB'},
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pageTitle: {fontSize: 22, fontWeight: '700', color: '#111827'},
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  editBtnText: {fontSize: 14, fontWeight: '700', color: PRIMARY},
  avatarSection: {alignItems: 'center', paddingVertical: 32},
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {fontSize: 34, fontWeight: '700', color: '#FFFFFF'},
  displayName: {fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12},
  badgeRow: {flexDirection: 'row', gap: 8},
  roleBadge: {backgroundColor: '#1D4ED8', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20},
  roleBadgeText: {fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5},
  statusBadge: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, gap: 5},
  statusDot: {width: 7, height: 7, borderRadius: 4},
  statusText: {fontSize: 12, fontWeight: '700'},
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  divider: {height: 1, backgroundColor: '#F3F4F6', marginVertical: 12},
  formActions: {gap: 10, marginTop: 6},
  saveBtn: {backgroundColor: PRIMARY, borderRadius: 10, paddingVertical: 14, alignItems: 'center'},
  saveBtnText: {color: '#FFFFFF', fontSize: 15, fontWeight: '700'},
  cancelBtn: {borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 10, paddingVertical: 13, alignItems: 'center'},
  cancelBtnText: {color: '#374151', fontSize: 15, fontWeight: '600'},
  btnDisabled: {opacity: 0.6},
  logoutSection: {paddingHorizontal: 20, marginBottom: 32},
  logoutButton: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  logoutText: {fontSize: 15, fontWeight: '700', color: '#DC2626'},
});

export default ProfileScreen;
