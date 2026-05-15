import React, {useCallback, useEffect, useRef, useState} from 'react';
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
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AuthStackParamList} from '../../types/navigation';
import {useAuth} from '../../context/AuthContext';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'OTP'>;
  route: RouteProp<AuthStackParamList, 'OTP'>;
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;
const PRIMARY = '#16A34A';
const PRIMARY_DARK = '#15803D';

function OTPScreen({navigation, route}: Props): React.JSX.Element {
  const {phone} = route.params;
  const {verifyOTP, resendOTP, error, clearError} = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const inputRefs = useRef<Array<TextInput | null>>(
    Array(OTP_LENGTH).fill(null),
  );

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // OTP expiry countdown from route param
  const [expirySeconds, setExpirySeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!route.params.otpExpiresAt) {
      return;
    }
    const expiryMs =
      new Date(route.params.otpExpiresAt).getTime() - Date.now();
    if (expiryMs <= 0) {
      return;
    }
    setExpirySeconds(Math.floor(expiryMs / 1000));
    const timer = setInterval(() => {
      setExpirySeconds(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [route.params.otpExpiresAt]);

  function formatSeconds(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const handleDigitChange = useCallback(
    (text: string, index: number) => {
      clearError();
      const char = text.replace(/\D/g, '').slice(-1);
      const newDigits = [...digits];
      newDigits[index] = char;
      setDigits(newDigits);

      if (char && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits, clearError],
  );

  const handleKeyPress = useCallback(
    (
      e: NativeSyntheticEvent<TextInputKeyPressEventData>,
      index: number,
    ) => {
      if (e.nativeEvent.key === 'Backspace') {
        const newDigits = [...digits];
        if (digits[index]) {
          newDigits[index] = '';
          setDigits(newDigits);
        } else if (index > 0) {
          newDigits[index - 1] = '';
          setDigits(newDigits);
          inputRefs.current[index - 1]?.focus();
        }
      }
    },
    [digits],
  );

  async function handleVerify() {
    const otpCode = digits.join('');
    if (otpCode.length !== OTP_LENGTH) {
      return;
    }
    setSubmitting(true);
    try {
      await verifyOTP(phone, otpCode);
    } catch {
      // error set in context; reset inputs
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) {
      return;
    }
    setResending(true);
    clearError();
    try {
      await resendOTP(phone);
      setCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      // error set in context
    } finally {
      setResending(false);
    }
  }

  const otpCode = digits.join('');
  const isComplete = otpCode.length === OTP_LENGTH;

  const maskedPhone = phone.replace(/(\+962)(\d{2})(\d+)(\d{2})/, '$1 $2*****$4');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>✉</Text>
            </View>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to
            </Text>
            <Text style={styles.phone}>{maskedPhone}</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {expirySeconds !== null && expirySeconds > 0 && (
              <View style={styles.expiryRow}>
                <Text style={styles.expiryText}>
                  Code expires in{' '}
                  <Text style={styles.expiryTimer}>
                    {formatSeconds(expirySeconds)}
                  </Text>
                </Text>
              </View>
            )}

            {expirySeconds === 0 && (
              <View style={styles.expiredBox}>
                <Text style={styles.expiredText}>
                  Code has expired. Please resend.
                </Text>
              </View>
            )}

            {/* OTP boxes */}
            <View style={styles.otpRow}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={ref => {
                    inputRefs.current[i] = ref;
                  }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    error && !digit ? styles.otpBoxError : null,
                  ]}
                  value={digit}
                  onChangeText={text => handleDigitChange(text, i)}
                  onKeyPress={e => handleKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={i === 0}
                  textAlign="center"
                  caretHidden
                />
              ))}
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Verify button */}
            <TouchableOpacity
              style={[
                styles.button,
                (!isComplete || submitting) && styles.buttonDisabled,
              ]}
              onPress={handleVerify}
              disabled={!isComplete || submitting}
              activeOpacity={0.8}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            {/* Resend */}
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn't receive it? </Text>
              {cooldown > 0 ? (
                <Text style={styles.resendCooldown}>
                  Resend in {cooldown}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={resending}>
                  {resending ? (
                    <ActivityIndicator
                      color={PRIMARY}
                      size="small"
                      style={styles.resendSpinner}
                    />
                  ) : (
                    <Text style={styles.resendLink}>Resend Code</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flex: {flex: 1},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  phone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  expiryRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  expiryText: {
    fontSize: 13,
    color: '#6B7280',
  },
  expiryTimer: {
    fontWeight: '700',
    color: '#D97706',
  },
  expiredBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#D97706',
  },
  expiredText: {
    fontSize: 13,
    color: '#92400E',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  otpBoxFilled: {
    borderColor: PRIMARY,
    backgroundColor: '#F0FDF4',
    color: PRIMARY,
  },
  otpBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    lineHeight: 18,
  },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: PRIMARY_DARK,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A7F3D0',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendCooldown: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '700',
  },
  resendSpinner: {
    marginLeft: 4,
  },
});

export default OTPScreen;
