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

const ACCENT = '#2563EB';
const TOTAL_STEPS = 3;

const STEPS = [
  {
    step: 1,
    emoji: '👤',
    title: "What's your name?",
    subtitle: 'Help merchants know who they are talking to.',
  },
  {
    step: 2,
    emoji: '📍',
    title: 'Where are you based?',
    subtitle: 'We use this to show you relevant offers near you.',
  },
  {
    step: 3,
    emoji: '🎉',
    title: "You're all set!",
    subtitle: 'Your profile is ready. Start posting requests and get the best deals.',
  },
];

export default function ProfileSetupScreen() {
  const navigation = useNavigation<NavProp>();
  const {updateProfile, user} = useAuth();

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const transitionToStep = (next: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {toValue: 0, duration: 150, useNativeDriver: true}),
      Animated.timing(fadeAnim, {toValue: 1, duration: 200, useNativeDriver: true}),
    ]).start();
    setStep(next);
  };

  const handleNext = async () => {
    setError(null);

    if (step === 1) {
      if (!firstName.trim()) {
        setError('Please enter your first name.');
        return;
      }
      transitionToStep(2);
      return;
    }

    if (step === 2) {
      if (!city.trim()) {
        setError('Please enter your city.');
        return;
      }
      setIsSaving(true);
      try {
        await updateProfile({
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          city: city.trim(),
          country: country.trim() || undefined,
        });
        transitionToStep(3);
      } catch {
        setError('Failed to save your profile. Please try again.');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (step === 3) {
      navigation.reset({index: 0, routes: [{name: 'App'}]});
    }
  };

  const current = STEPS[step - 1];
  const isLastStep = step === TOTAL_STEPS;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            {Array.from({length: TOTAL_STEPS}).map((_, i) => (
              <View key={i} style={styles.progressSegmentWrap}>
                <View
                  style={[
                    styles.progressSegment,
                    i < step ? styles.progressSegmentDone : styles.progressSegmentPending,
                  ]}
                />
              </View>
            ))}
          </View>

          <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
            {/* Emoji icon */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>{current.emoji}</Text>
            </View>

            {/* Step label */}
            <Text style={styles.stepLabel}>
              {isLastStep ? 'Done' : `Step ${step} of ${TOTAL_STEPS - 1}`}
            </Text>

            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.subtitle}>{current.subtitle}</Text>

            {/* Step 1 — Name */}
            {step === 1 && (
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
            )}

            {/* Step 2 — Location */}
            {step === 2 && (
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
            )}

            {/* Step 3 — Confirmation */}
            {step === 3 && (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Name  </Text>
                  <Text style={styles.summaryVal}>
                    {[firstName, lastName].filter(Boolean).join(' ')}
                  </Text>
                </Text>
                {city ? (
                  <Text style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>City  </Text>
                    <Text style={styles.summaryVal}>
                      {[city, country].filter(Boolean).join(', ')}
                    </Text>
                  </Text>
                ) : null}
                <Text style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Phone  </Text>
                  <Text style={styles.summaryVal}>{user?.phone}</Text>
                </Text>
              </View>
            )}

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* CTA button */}
            <TouchableOpacity
              style={[styles.btn, isSaving && styles.btnDisabled]}
              onPress={handleNext}
              disabled={isSaving}
              activeOpacity={0.85}>
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>
                  {step === 1 ? 'Continue →' : step === 2 ? 'Save & Continue →' : 'Go to App →'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Back link (steps 2 only) */}
            {step === 2 && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => transitionToStep(1)}
                activeOpacity={0.7}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  flex: {flex: 1},
  scroll: {flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32},

  progressContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
    gap: 6,
  },
  progressSegmentWrap: {flex: 1},
  progressSegment: {
    height: 4,
    borderRadius: 2,
  },
  progressSegmentDone: {backgroundColor: ACCENT},
  progressSegmentPending: {backgroundColor: '#E5E7EB'},

  content: {alignItems: 'center'},

  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconEmoji: {fontSize: 40},

  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },

  fields: {width: '100%', gap: 16, marginBottom: 24},
  fieldGroup: {width: '100%'},
  label: {fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6},
  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 11,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },

  summaryBox: {
    width: '100%',
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 20,
    marginBottom: 28,
    gap: 10,
  },
  summaryRow: {fontSize: 15, lineHeight: 22},
  summaryKey: {fontWeight: '600', color: '#374151'},
  summaryVal: {color: '#2563EB', fontWeight: '500'},

  errorBox: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {color: '#DC2626', fontSize: 14, textAlign: 'center'},

  btn: {
    width: '100%',
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {backgroundColor: '#93C5FD', shadowOpacity: 0, elevation: 0},
  btnText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3},

  backBtn: {marginTop: 14, paddingVertical: 8},
  backText: {fontSize: 15, color: '#6B7280', fontWeight: '500'},
});
