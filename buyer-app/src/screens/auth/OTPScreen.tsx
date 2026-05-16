import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
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
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAuth} from '../../context/AuthContext';
import {AuthStackParamList} from '../../types/navigation';

type OTPRouteProp = RouteProp<AuthStackParamList, 'OTP'>;
type OTPNavProp = StackNavigationProp<AuthStackParamList, 'OTP'>;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OTPScreen() {
  const navigation = useNavigation<OTPNavProp>();
  const route = useRoute<OTPRouteProp>();
  const {phone} = route.params;

  const {verifyOTP, sendOTP, otpExpiresAt, error, clearError} = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [expirySeconds, setExpirySeconds] = useState<number | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>(
    Array(OTP_LENGTH).fill(null),
  );

  // OTP expiry countdown
  useEffect(() => {
    if (!otpExpiresAt) {
      return;
    }
    const expiry = new Date(otpExpiresAt).getTime();
    const updateExpiry = () => {
      const remaining = Math.max(
        0,
        Math.floor((expiry - Date.now()) / 1000),
      );
      setExpirySeconds(remaining);
    };
    updateExpiry();
    const interval = setInterval(updateExpiry, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }
    const timer = setTimeout(
      () => setResendCooldown(prev => Math.max(0, prev - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleDigitChange = useCallback(
    (text: string, index: number) => {
      // Allow only single digit
      const digit = text.replace(/\D/g, '').slice(-1);
      const newDigits = [...digits];
      newDigits[index] = digit;
      setDigits(newDigits);

      if (error) {
        clearError();
      }

      // Auto-advance to next input
      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits, error, clearError],
  );

  const handleKeyPress = useCallback(
    (
      event: NativeSyntheticEvent<TextInputKeyPressEventData>,
      index: number,
    ) => {
      if (event.nativeEvent.key === 'Backspace') {
        if (!digits[index] && index > 0) {
          // Move to previous input and clear it
          const newDigits = [...digits];
          newDigits[index - 1] = '';
          setDigits(newDigits);
          inputRefs.current[index - 1]?.focus();
        }
      }
    },
    [digits],
  );

  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH;

  const handleVerify = async () => {
    if (!isComplete || isVerifying) {
      return;
    }
    clearError();
    setIsVerifying(true);
    try {
      await verifyOTP(phone, otp);
    } catch {
      // Error already set in context — clear the digits so user can retry
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) {
      return;
    }
    clearError();
    setIsResending(true);
    try {
      await sendOTP(phone);
      setResendCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeNumber = () => {
    clearError();
    navigation.goBack();
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const maskedPhone = phone.replace(/(\+962)(\d{2})(\d+)(\d{2})/, '$1 $2****$4');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleChangeNumber}
              activeOpacity={0.7}>
              <Text style={styles.backButtonText}>{'← Back'}</Text>
            </TouchableOpacity>

            {/* Lock icon */}
            <View style={styles.iconArea}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🔒</Text>
              </View>
            </View>

            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to
            </Text>
            <Text style={styles.phoneDisplay}>{maskedPhone}</Text>

            {/* OTP digit inputs */}
            <View style={styles.otpRow}>
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    error ? styles.otpBoxError : null,
                  ]}
                  value={digit}
                  onChangeText={text => handleDigitChange(text, index)}
                  onKeyPress={event => handleKeyPress(event, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {/* Expiry timer */}
            {expirySeconds !== null && expirySeconds > 0 ? (
              <Text style={styles.expiryText}>
                Code expires in{' '}
                <Text style={styles.expiryCountdown}>
                  {formatTime(expirySeconds)}
                </Text>
              </Text>
            ) : expirySeconds === 0 ? (
              <Text style={[styles.expiryText, styles.expiryExpired]}>
                Code has expired — please resend
              </Text>
            ) : null}

            {/* Error message */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Verify button */}
            <TouchableOpacity
              style={[
                styles.button,
                (!isComplete || isVerifying) && styles.buttonDisabled,
              ]}
              onPress={handleVerify}
              disabled={!isComplete || isVerifying}
              activeOpacity={0.8}>
              {isVerifying ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>

            {/* Resend */}
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn't receive a code? </Text>
              {resendCooldown > 0 ? (
                <Text style={styles.resendCooldown}>
                  Resend in {resendCooldown}s
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={isResending}
                  activeOpacity={0.7}>
                  {isResending ? (
                    <ActivityIndicator color="#2563EB" size="small" />
                  ) : (
                    <Text style={styles.resendLink}>Resend Code</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Change number */}
            <TouchableOpacity
              onPress={handleChangeNumber}
              activeOpacity={0.7}
              style={styles.changeNumberButton}>
              <Text style={styles.changeNumberText}>Change phone number</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  iconArea: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 4,
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
    borderRadius: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  otpBoxFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  otpBoxError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  expiryText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  expiryCountdown: {
    color: '#2563EB',
    fontWeight: '600',
  },
  expiryExpired: {
    color: '#DC2626',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
    color: '#2563EB',
    fontWeight: '600',
  },
  changeNumberButton: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  changeNumberText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
});
