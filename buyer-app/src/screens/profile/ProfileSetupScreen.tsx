import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../../context/AuthContext';
import {RootStackParamList} from '../../types/navigation';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>;
type Role = 'BUYER' | 'MERCHANT';

const BUYER_ACCENT = '#2563EB';
const MERCHANT_ACCENT = '#16A34A';
const TOTAL_STEPS = 4;

const ROLE_OPTIONS: {value: Role; emoji: string; label: string; desc: string; color: string; bg: string; light: string}[] = [
  {
    value: 'BUYER',
    emoji: '🛒',
    label: 'Buyer',
    desc: 'Post requests and receive competitive offers from merchants.',
    color: BUYER_ACCENT,
    bg: '#EFF6FF',
    light: '#DBEAFE',
  },
  {
    value: 'MERCHANT',
    emoji: '🏪',
    label: 'Merchant',
    desc: 'Browse buyer requests and place bids to grow your business.',
    color: MERCHANT_ACCENT,
    bg: '#F0FDF4',
    light: '#DCFCE7',
  },
];

export default function ProfileSetupScreen() {
  const navigation = useNavigation<NavProp>();
  const {updateProfile, user} = useAuth();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>('BUYER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const ACCENT = role === 'MERCHANT' ? MERCHANT_ACCENT : BUYER_ACCENT;
  const ICON_BG = role === 'MERCHANT' ? '#F0FDF4' : '#EFF6FF';

  const fade = (next: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {toValue: 0, duration: 140, useNativeDriver: true}),
      Animated.timing(fadeAnim, {toValue: 1, duration: 200, useNativeDriver: true}),
    ]).start();
    setError(null);
    setStep(next);
  };

  const handleNext = async () => {
    setError(null);

    if (step === 1) {
      fade(2);
      return;
    }

    if (step === 2) {
      if (!firstName.trim()) {
        setError('Please enter your first name.');
        return;
      }
      fade(3);
      return;
    }

    if (step === 3) {
      if (!city.trim()) {
        setError('Please enter your city.');
        return;
      }
      setIsSaving(true);
      try {
        await updateProfile({
          role,
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          city: city.trim(),
          country: country.trim() || undefined,
        });
        fade(4);
      } catch {
        setError('Failed to save your profile. Please try again.');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (step === 4) {
      navigation.reset({index: 0, routes: [{name: 'App'}]});
    }
  };

  const stepLabel =
    step === TOTAL_STEPS ? 'Done' : `Step ${step} of ${TOTAL_STEPS - 1}`;

  const btnLabel =
    step === 1 ? 'Continue →'
    : step === 2 ? 'Continue →'
    : step === 3 ? 'Save Profile →'
    : 'Go to App →';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Progress */}
          <View style={styles.progressRow}>
            {Array.from({length: TOTAL_STEPS}).map((_, i) => (
              <View key={i} style={styles.segWrap}>
                <View style={[styles.seg, i < step ? {backgroundColor: ACCENT} : styles.segPending]} />
              </View>
            ))}
          </View>

          <Animated.View style={[styles.content, {opacity: fadeAnim}]}>

            {/* ──────────── STEP 1 — ROLE ──────────── */}
            {step === 1 && (
              <>
                <Text style={[styles.stepLabel, {color: ACCENT}]}>{stepLabel}</Text>
                <Text style={styles.title}>What's your role?</Text>
                <Text style={styles.subtitle}>
                  Choose how you'll use the marketplace. You can only have one role per account.
                </Text>

                <View style={styles.roleList}>
                  {ROLE_OPTIONS.map(r => {
                    const selected = role === r.value;
                    return (
                      <TouchableOpacity
                        key={r.value}
                        style={[
                          styles.roleCard,
                          selected && {borderColor: r.color, backgroundColor: r.bg},
                        ]}
                        onPress={() => setRole(r.value)}
                        activeOpacity={0.8}>
                        <View style={[styles.roleIconCircle, {backgroundColor: selected ? r.light : '#F3F4F6'}]}>
                          <Text style={styles.roleEmoji}>{r.emoji}</Text>
                        </View>
                        <View style={styles.roleBody}>
                          <Text style={[styles.roleLabel, selected && {color: r.color}]}>{r.label}</Text>
                          <Text style={styles.roleDesc}>{r.desc}</Text>
                        </View>
                        <View style={[styles.radio, selected && {borderColor: r.color}]}>
                          {selected && <View style={[styles.radioDot, {backgroundColor: r.color}]} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* ──────────── STEP 2 — NAME ──────────── */}
            {step === 2 && (
              <>
                <View style={[styles.iconCircle, {backgroundColor: ICON_BG}]}>
                  <Text style={styles.iconEmoji}>👤</Text>
                </View>
                <Text style={[styles.stepLabel, {color: ACCENT}]}>{stepLabel}</Text>
                <Text style={styles.title}>What's your name?</Text>
                <Text style={styles.subtitle}>
                  {role === 'BUYER'
                    ? 'Help merchants know who they are talking to.'
                    : 'Let buyers know who is sending them offers.'}
                </Text>
                <View style={styles.fields}>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>First Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Ahmad"
                      placeholderTextColor="#9CA3AF"
                      value={firstName}
                      onChangeText={v => {setFirstName(v); setError(null);}}
                      autoFocus
                      returnKeyType="next"
                    />
                  </View>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Al-Hassan (optional)"
                      placeholderTextColor="#9CA3AF"
                      value={lastName}
                      onChangeText={setLastName}
                      returnKeyType="done"
                      onSubmitEditing={handleNext}
                    />
                  </View>
                </View>
              </>
            )}

            {/* ──────────── STEP 3 — LOCATION ──────────── */}
            {step === 3 && (
              <>
                <View style={[styles.iconCircle, {backgroundColor: ICON_BG}]}>
                  <Text style={styles.iconEmoji}>📍</Text>
                </View>
                <Text style={[styles.stepLabel, {color: ACCENT}]}>{stepLabel}</Text>
                <Text style={styles.title}>Where are you based?</Text>
                <Text style={styles.subtitle}>
                  We use this to show you relevant {role === 'BUYER' ? 'offers' : 'requests'} near you.
                </Text>
                <View style={styles.fields}>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>City *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Amman"
                      placeholderTextColor="#9CA3AF"
                      value={city}
                      onChangeText={v => {setCity(v); setError(null);}}
                      autoFocus
                      returnKeyType="next"
                    />
                  </View>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Country</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Jordan (optional)"
                      placeholderTextColor="#9CA3AF"
                      value={country}
                      onChangeText={setCountry}
                      returnKeyType="done"
                      onSubmitEditing={handleNext}
                    />
                  </View>
                </View>
              </>
            )}

            {/* ──────────── STEP 4 — DONE ──────────── */}
            {step === 4 && (
              <>
                <View style={[styles.iconCircle, {backgroundColor: ICON_BG}]}>
                  <Text style={styles.iconEmoji}>🎉</Text>
                </View>
                <Text style={[styles.stepLabel, {color: ACCENT}]}>{stepLabel}</Text>
                <Text style={styles.title}>You're all set!</Text>
                <Text style={styles.subtitle}>
                  Your {role === 'BUYER' ? 'buyer' : 'merchant'} profile is ready.{' '}
                  {role === 'BUYER'
                    ? 'Start posting requests and get the best deals.'
                    : 'Browse requests and start placing bids.'}
                </Text>

                <View style={[styles.summaryBox, {borderColor: ACCENT + '40'}]}>
                  <SummaryRow label="Role" value={role === 'BUYER' ? '🛒  Buyer' : '🏪  Merchant'} color={ACCENT} />
                  <SummaryRow label="Name" value={[firstName, lastName].filter(Boolean).join(' ')} color={ACCENT} />
                  {city ? <SummaryRow label="City" value={[city, country].filter(Boolean).join(', ')} color={ACCENT} /> : null}
                  <SummaryRow label="Phone" value={user?.phone ?? ''} color={ACCENT} />
                </View>
              </>
            )}

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* CTA */}
            <TouchableOpacity
              style={[styles.btn, {backgroundColor: ACCENT, shadowColor: ACCENT}, isSaving && styles.btnDisabled]}
              onPress={handleNext}
              disabled={isSaving}
              activeOpacity={0.85}>
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>{btnLabel}</Text>
              )}
            </TouchableOpacity>

            {/* Back */}
            {step === 2 && (
              <TouchableOpacity style={styles.backBtn} onPress={() => fade(1)} activeOpacity={0.7}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            )}
            {step === 3 && (
              <TouchableOpacity style={styles.backBtn} onPress={() => fade(2)} activeOpacity={0.7}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SummaryRow({label, value, color}: {label: string; value: string; color: string}) {
  return (
    <View style={summaryStyles.row}>
      <Text style={summaryStyles.key}>{label}</Text>
      <Text style={[summaryStyles.val, {color}]}>{value}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'},
  key: {fontSize: 14, color: '#6B7280', fontWeight: '500'},
  val: {fontSize: 14, fontWeight: '700', maxWidth: '60%', textAlign: 'right'},
});

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  flex: {flex: 1},
  scroll: {flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40},

  progressRow: {flexDirection: 'row', marginTop: 16, marginBottom: 28, gap: 6},
  segWrap: {flex: 1},
  seg: {height: 4, borderRadius: 2},
  segPending: {backgroundColor: '#E5E7EB'},

  content: {alignItems: 'center'},

  stepLabel: {fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8},
  title: {fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8, letterSpacing: -0.3},
  subtitle: {fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 4},

  iconCircle: {width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 20},
  iconEmoji: {fontSize: 40},

  /* Role step */
  roleList: {width: '100%', gap: 14, marginBottom: 28},
  roleCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 16,
    padding: 16, backgroundColor: '#FAFAFA',
  },
  roleIconCircle: {width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 14},
  roleEmoji: {fontSize: 26},
  roleBody: {flex: 1},
  roleLabel: {fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 3},
  roleDesc: {fontSize: 12, color: '#9CA3AF', lineHeight: 17},
  radio: {width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center'},
  radioDot: {width: 10, height: 10, borderRadius: 5},

  /* Form fields */
  fields: {width: '100%', gap: 16, marginBottom: 24},
  fieldGroup: {width: '100%'},
  label: {fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6},
  input: {
    borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 11,
    fontSize: 16, color: '#111827', backgroundColor: '#F9FAFB',
  },

  /* Summary */
  summaryBox: {
    width: '100%', borderWidth: 1, borderRadius: 16, padding: 20, marginBottom: 28,
    backgroundColor: '#FAFAFA',
  },

  /* Error */
  errorBox: {
    width: '100%', backgroundColor: '#FEF2F2', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: {color: '#DC2626', fontSize: 14, textAlign: 'center'},

  /* Buttons */
  btn: {
    width: '100%', borderRadius: 14, paddingVertical: 17, alignItems: 'center',
    shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: {opacity: 0.5, shadowOpacity: 0, elevation: 0},
  btnText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3},

  backBtn: {marginTop: 14, paddingVertical: 8},
  backText: {fontSize: 15, color: '#6B7280', fontWeight: '500'},
});
