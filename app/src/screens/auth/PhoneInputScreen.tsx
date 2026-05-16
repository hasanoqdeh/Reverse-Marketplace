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

type NavProp = StackNavigationProp<AuthStackParamList, 'PhoneInput'>;

const COUNTRY_CODE = '+962';
const ACCENT = '#2563EB';

export default function PhoneInputScreen() {
  const navigation = useNavigation<NavProp>();
  const {sendOTP, loginStep, error, clearError} = useAuth();

  const [localNumber, setLocalNumber] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (loginStep === 'otp') {
      navigation.navigate('OTP', {phone: COUNTRY_CODE + localNumber});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginStep]);

  const handleSendCode = async () => {
    if (localNumber.length < 9) {return;}
    clearError();
    setIsSending(true);
    try {
      await sendOTP(COUNTRY_CODE + localNumber);
    } finally {
      setIsSending(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    setLocalNumber(digits);
    if (error) {clearError();}
  };

  const isDisabled = localNumber.length < 9 || isSending;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>

            {/* Logo */}
            <View style={styles.logoArea}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>RM</Text>
              </View>
              <Text style={styles.logoName}>Reverse Marketplace</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Enter your phone number</Text>
            <Text style={styles.subtitle}>
              We'll send you a verification code. New users will be guided through a quick setup.
            </Text>

            {/* Phone input */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[styles.phoneRow, localNumber.length >= 9 && styles.phoneRowFilled]}>
                <View style={styles.prefix}>
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

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* CTA */}
            <TouchableOpacity
              style={[styles.btn, isDisabled && styles.btnDisabled]}
              onPress={handleSendCode}
              disabled={isDisabled}
              activeOpacity={0.8}>
              {isSending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.btnText}>Continue</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.terms}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  flex: {flex: 1},
  scroll: {flexGrow: 1, justifyContent: 'center'},
  container: {flex: 1, paddingHorizontal: 24, paddingVertical: 32, justifyContent: 'center'},

  logoArea: {alignItems: 'center', marginBottom: 40},
  logoCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoText: {color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: 1},
  logoName: {fontSize: 15, fontWeight: '600', color: '#374151', letterSpacing: 0.3},

  title: {fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 8, letterSpacing: -0.3},
  subtitle: {fontSize: 14, color: '#6B7280', marginBottom: 32, lineHeight: 21},

  inputWrap: {marginBottom: 16},
  inputLabel: {fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8},
  phoneRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, overflow: 'hidden',
  },
  phoneRowFilled: {borderColor: ACCENT},
  prefix: {
    backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 14,
    borderRightWidth: 1.5, borderRightColor: '#D1D5DB',
  },
  prefixText: {fontSize: 16, fontWeight: '600', color: '#374151'},
  phoneInput: {flex: 1, fontSize: 16, color: '#111827', paddingHorizontal: 14, paddingVertical: 14, letterSpacing: 1},

  errorBox: {
    backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 16, borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: {color: '#DC2626', fontSize: 14, lineHeight: 20},

  btn: {
    backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: ACCENT, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: {backgroundColor: '#93C5FD', shadowOpacity: 0, elevation: 0},
  btnText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5},

  terms: {fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 24, lineHeight: 18},
});
