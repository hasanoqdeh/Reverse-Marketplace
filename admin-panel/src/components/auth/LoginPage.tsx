'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Phone, Lock, AlertCircle, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatPhoneNumber, validatePhoneNumber, validateOTP, formatOTP } from '@/lib/auth'

export default function LoginPage() {
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

  const [phone, setPhone] = useState('')
  const [countryCode] = useState('JO')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Handle OTP expiry countdown
  useEffect(() => {
    if (!otpExpiresAt) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expiry = new Date(otpExpiresAt).getTime()
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000))
      setTimeRemaining(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        resetLoginFlow()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [otpExpiresAt, resetLoginFlow])

  // Handle resend cooldown
  useEffect(() => {
    if (!otpSent) return

    const cooldownTime = 60 // 60 seconds cooldown
    setResendCooldown(cooldownTime)

    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [otpSent])

  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()

    // For validation, use the cleaned raw phone number (9 digits)
    const cleanRawPhone = phone.replace(/\D/g, '')
    
    // Format phone number with country code for API call
    const formattedPhone = phone.startsWith('+') ? phone : `+962${cleanRawPhone}`
    
    console.log('🔧 LoginPage Debug:', {
      rawPhone: phone,
      cleanRawPhone,
      formattedPhone,
      countryCode,
      isValid: validatePhoneNumber(cleanRawPhone)
    });
    
    // Validate the raw Jordan phone number (9 digits)
    if (!validatePhoneNumber(cleanRawPhone)) {
      console.log('❌ Phone validation failed');
      return
    }

    console.log('🚀 Calling phoneLogin with:', { formattedPhone, countryCode });
    
    try {
      await phoneLogin(formattedPhone, countryCode)
      console.log('✅ phoneLogin completed successfully');
    } catch (error) {
      console.log('❌ phoneLogin error:', error);
      // Error is handled by auth context
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()

    const fullOTP = otpCode.join('')
    if (!validateOTP(fullOTP)) {
      return
    }

    try {
      await verifyOTP(phone, fullOTP)
    } catch (error) {
      // Error is handled by the auth context
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return

    try {
      await resendOTP(phone)
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

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement
      nextInput?.focus()
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement
      prevInput?.focus()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Panel
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your phone number
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Phone Login Form */}
        {loginStep === 'phone' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Phone Login
              </CardTitle>
              <CardDescription>
                Enter your phone number to receive a verification code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
                      <span className="text-sm text-gray-500">+962</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="rounded-l-none"
                      maxLength={12}
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter your Jordanian phone number
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !validatePhoneNumber(phone)}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* OTP Verification Form */}
        {loginStep === 'otp' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Verify Code
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to {phone.startsWith('+') ? phone : `+962${phone.replace(/\D/g, '')}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                {/* OTP Input Fields */}
                <div className="space-y-2">
                  <Label>Verification Code</Label>
                  <div className="flex justify-between space-x-2">
                    {otpCode.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleOTPKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg"
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                {/* Timer */}
                {timeRemaining > 0 && (
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    Code expires in {formatTime(timeRemaining)}
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || otpCode.some(digit => digit === '')}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>

                {/* Resend Option */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => handleResendOTP()}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-sm"
                  >
                    {resendCooldown > 0 
                      ? `Resend code in ${resendCooldown}s` 
                      : "Didn't receive the code? Resend"
                    }
                  </Button>
                </div>

                {/* Change Phone Number */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={resetLoginFlow}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    Use different phone number
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500">
          <p>This is a secure admin portal. All login attempts are logged.</p>
          <p className="mt-1">For assistance, contact the system administrator.</p>
        </div>
      </div>
    </div>
  )
}
