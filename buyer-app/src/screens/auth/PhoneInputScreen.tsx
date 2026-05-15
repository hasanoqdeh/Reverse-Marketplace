import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAuth} from '../../context/AuthContext';
import {AuthStackParamList} from '../../types/navigation';

type PhoneInputNavProp = StackNavigationProp<AuthStackParamList, 'PhoneInput'>;

const COUNTRY_CODE = '+962';

export default function PhoneInputScreen() {
  const navigation = useNavigation<PhoneInputNavProp>();
  const {sendOTP, loginStep, error, clearError} = useAuth();
  const [localNumber, setLocalNumber] = useState('');
  const [isSending, setIsSending] = useState(false);

  // When loginStep switches to 'otp', navigate to OTP screen
  useEffect(() => {
    if (loginStep === 'otp') {
      navigation.navigate('OTP', {phone: COUNTRY_CODE + localNumber});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginStep]);

  const handleSendCode = async () => {
    if (localNumber.length < 9) {
      return;
    }
    clearError();
    setIsSending(true);
    try {
      await sendOTP(COUNTRY_CODE + localNumber);
    } finally {
      setIsSending(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    // Allow only digits
    const digits = text.replace(/\D/g, '');
    setLocalNumber(digits);
    if (error) {
      clearError();
    }
  };

  const isButtonDisabled = localNumber.length < 9 || isSending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* Logo / Brand area */}
            <View style={styles.brandArea}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>M</Text>
              </View>
            </View>

            {/* Header */}
            <Text style={styles.title}>Welcome to Marketplace</Text>
            <Text style={styles.subtitle}>
              Enter your phone number to continue
            </Text>

            {/* Phone input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>{COUNTRY_CODE}</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={localNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="numeric"
                  maxLength={9}
                  placeholder="7XXXXXXXX"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="done"
                  onSubmitEditing={handleSendCode}
                  autoFocus
                />
              </View>
            </View>

            {/* Error message */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Send code button */}
            <TouchableOpacity
              style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={isButtonDisabled}
              activeOpacity={0.8}>
              {isSending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Send Code</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
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
    paddingVertical: 40,
    justifyContent: 'center',
  },
  brandArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  prefixBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 14,
    letterSpacing: 1,
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
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
