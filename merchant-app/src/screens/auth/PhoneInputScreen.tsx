import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../types/navigation';
import {useAuth} from '../../context/AuthContext';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'PhoneInput'>;
};

const PRIMARY = '#16A34A';
const PRIMARY_DARK = '#15803D';

function PhoneInputScreen({navigation}: Props): React.JSX.Element {
  const {sendOTP, error, clearError, isLoading} = useAuth();
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handlePhoneChange(text: string) {
    clearError();
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 9) {
      setPhone(digits);
    }
  }

  async function handleSendOTP() {
    const trimmed = phone.trim();
    if (trimmed.length < 9) {
      return;
    }

    setSubmitting(true);
    try {
      const fullPhone = `+962${trimmed}`;
      await sendOTP(fullPhone);
      navigation.navigate('OTP', {phone: fullPhone});
    } catch {
      // error already set in context
    } finally {
      setSubmitting(false);
    }
  }

  const isValid = phone.length === 9 && phone.startsWith('7');
  const busy = submitting || isLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          {/* Logo / Brand area */}
          <View style={styles.brandArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <Text style={styles.title}>Merchant Portal</Text>
            <Text style={styles.subtitle}>
              Enter your registered phone number
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.label}>Phone Number</Text>

            <View style={styles.inputRow}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixFlag}>🇯🇴</Text>
                <Text style={styles.prefixText}>+962</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="7XXXXXXXX"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={9}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSendOTP}
              />
            </View>

            <Text style={styles.hint}>
              9-digit number starting with 7 (e.g., 79XXXXXXX)
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                (!isValid || busy) && styles.buttonDisabled,
              ]}
              onPress={handleSendOTP}
              disabled={!isValid || busy}
              activeOpacity={0.8}>
              {busy ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            For merchants only. Buyers use the buyer app.
          </Text>
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
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brandArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#16A34A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  prefixBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1.5,
    borderRightColor: '#D1D5DB',
    gap: 6,
  },
  prefixFlag: {
    fontSize: 18,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    color: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 14,
    letterSpacing: 1.5,
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 4,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
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
    marginTop: 20,
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
    letterSpacing: 0.3,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PhoneInputScreen;
