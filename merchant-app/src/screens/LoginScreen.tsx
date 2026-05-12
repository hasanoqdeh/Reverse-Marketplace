import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal, ScrollView, TouchableHighlight } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../contexts/AuthContext'
import { formatJordanianPhone, validateLocalJordanianPhone } from '../lib/phoneUtils'

export default function LoginScreen() {
  const { 
    phoneLogin, 
    verifyOTP, 
    resendOTP, 
    isLoading, 
    error, 
    clearError, 
    otpSent, 
    otpExpiresAt,
    loginStep,
    resetLoginFlow 
  } = useAuth()

  const [phone, setPhone] = React.useState('')
  const [otpCode, setOtpCode] = React.useState(['', '', '', '', '', ''])

  const handlePhoneSubmit = async () => {
    try {
      clearError()
      
      // Format phone number to Jordan format +962XXXXXXXXX
      const formattedPhone = formatJordanianPhone(phone)
      
      await phoneLogin(formattedPhone, 'JO')
    } catch (error) {
      // Error is handled by the auth context
    }
  }

  const handleOTPSubmit = async () => {
    try {
      clearError()
      
      const fullOTP = otpCode.join('')
      
      // Format phone number to international format before sending to API
      const formattedPhone = formatJordanianPhone(phone)
      
      await verifyOTP(formattedPhone, fullOTP)
    } catch (error) {
      // Error is handled by the auth context
    }
  }

  const handleResendOTP = async () => {
    try {
      clearError()
      
      // Format phone number to international format before sending to API
      const formattedPhone = formatJordanianPhone(phone)
      
      await resendOTP(formattedPhone)
      setOtpCode(['', '', '', '', '', ''])
    } catch (error) {
      // Error is handled by the auth context
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newOTP = [...otpCode]
    newOTP[index] = value
    setOtpCode(newOTP)
  }

  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🏪</Text>
          </View>
          <Text style={styles.title}>Reverse Marketplace</Text>
          <Text style={styles.subtitle}>Merchant Portal</Text>
        </View>

        {/* Error Alert */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Phone Login Form */}
        {loginStep === 'phone' && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Enter Your Phone Number</Text>
            <Text style={styles.formSubtitle}>
              We'll send you a verification code
            </Text>

            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+962</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="7XXXXXXXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={9}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, !validateLocalJordanianPhone(phone) && styles.buttonDisabled]}
              onPress={handlePhoneSubmit}
              disabled={isLoading || !validateLocalJordanianPhone(phone)}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>Sending...</Text>
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* OTP Verification Form */}
        {loginStep === 'otp' && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Enter Verification Code</Text>
            <Text style={styles.formSubtitle}>
              Code sent to +962 {phone}
            </Text>

            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              {otpCode.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.otpInput}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(index, value)}
                  editable={!isLoading}
                />
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.button, otpCode.some(digit => digit === '') && styles.buttonDisabled]}
              onPress={handleOTPSubmit}
              disabled={isLoading || otpCode.some(digit => digit === '')}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>Verifying...</Text>
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            {/* Resend Option */}
            <View style={styles.resendContainer}>
              <TouchableOpacity 
                onPress={handleResendOTP}
                disabled={isLoading}
                style={styles.resendButton}
              >
                <Text style={styles.resendButtonText}>
                  Didn't receive the code? Resend
                </Text>
              </TouchableOpacity>
            </View>

            {/* Change Phone Number */}
            <TouchableOpacity 
              onPress={resetLoginFlow}
              disabled={isLoading}
              style={styles.changePhoneButton}
            >
              <Text style={styles.changePhoneButtonText}>
                Use different phone number
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityNoticeText}>
            This is a secure merchant portal. All login attempts are logged.
          </Text>
          <Text style={styles.securityNoticeText}>
            For assistance, contact support.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    border: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  countryCode: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  countryName: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendButton: {
    paddingVertical: 8,
  },
  resendButtonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  changePhoneButton: {
    paddingVertical: 8,
  },
  changePhoneButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  securityNotice: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  securityNoticeText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  countryList: {
    maxHeight: 300,
  },
  countryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  countryItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryItemName: {
    fontSize: 16,
    color: '#1f2937',
  },
  countryItemCode: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
})
