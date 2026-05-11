'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Shield, Eye, EyeOff, Lock, Mail, Smartphone } from 'lucide-react';
import { apiService, API_ENDPOINTS } from '@/services/api';
import { UserRole } from '@/types';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const router = useRouter();

  useEffect(() => {
    // Clear any existing auth data on mount
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REQUEST_OTP, {
        phoneNumber,
      });

      if (response.success) {
        // Generate OTP for testing (in development)
        const testOtp = '123456'; // Default test OTP
        setGeneratedOtp(testOtp);
        setShowOtp(true);
        setStep('otp');
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while requesting OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('OTP verification started', { phoneNumber, otp });
    setIsLoading(true);
    setError('');

    try {
      console.log('Making API call to:', API_ENDPOINTS.AUTH.VERIFY_OTP);
      const response = await apiService.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        phoneNumber,
        otp,
      });
      console.log('API response:', response);

      if (response.success && response.data) {
        // Store token and user data
        const data = response.data as any;
        localStorage.setItem('admin_token', data.accessToken);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(response.message || 'OTP verification failed');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'An error occurred during OTP verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-admin-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure OTP Authentication System
          </p>
        </div>

        {/* Phone Number Form */}
        {step === 'phone' && (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOtp}>
            <div className="space-y-4">
              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Smartphone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-admin-500 focus:border-admin-500 sm:text-sm"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-admin-600 hover:bg-admin-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    </div>
                    <span className="pl-10">Sending OTP...</span>
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          </form>
        )}

        {/* OTP Form */}
        {step === 'otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div className="space-y-4">
              {/* Testing OTP Display */}
              {showOtp && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Testing OTP (Development Mode)
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Use this OTP for testing: <span className="font-mono font-bold text-lg">{generatedOtp}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP Code
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 pr-20 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-admin-500 focus:border-admin-500 sm:text-sm text-center text-lg font-mono"
                    placeholder="123456"
                  />
                  <button
                    type="button"
                    onClick={() => setOtp(generatedOtp)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-admin-600 hover:text-admin-700 text-sm font-medium"
                  >
                    Auto-fill
                  </button>
                </div>
              </div>

              {/* Phone Number Display */}
              <div className="text-sm text-gray-600">
                <p>OTP sent to: <span className="font-medium">{phoneNumber}</span></p>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-admin-600 hover:bg-admin-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    </div>
                    <span className="pl-10">Verifying...</span>
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-500"
              >
                Back to Phone Number
              </button>
            </div>
          </form>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Accounts Info */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-3">All Test Accounts:</h3>
          
          {/* Admin Accounts */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-admin-600 mb-2">🔧 Admin Accounts:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>+96895000001</strong> - System Administrator (Trust: 100)</p>
              <p><strong>+96895000002</strong> - Support Manager (Trust: 95)</p>
            </div>
          </div>

          {/* Buyer Accounts */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-blue-600 mb-2">🛍️ Buyer Accounts:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>+96892100001</strong> - Ahmed Al-Mansoori (Trust: 85)</p>
              <p><strong>+96892100002</strong> - Fatima Al-Harthy (Trust: 92)</p>
              <p><strong>+96892100003</strong> - Mohammed Al-Balushi (Trust: 75) ❌</p>
              <p><strong>+96892100004</strong> - Aisha Al-Rashdi (Trust: 88)</p>
              <p><strong>+96892100005</strong> - Khalid Al-Maawali (Trust: 90)</p>
            </div>
          </div>

          {/* Merchant Accounts */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-green-600 mb-2">🏪 Merchant Accounts:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>+96892300001</strong> - Oman Electronics Store (Trust: 95)</p>
              <p><strong>+96892300002</strong> - Muscat Auto Parts (Trust: 88)</p>
              <p><strong>+96892300003</strong> - Salalah Furniture Hub (Trust: 92)</p>
              <p><strong>+96892300004</strong> - Sohar Custom Solutions (Trust: 70) ❌</p>
              <p><strong>+96892300005</strong> - Nizwa Electronics (Trust: 85)</p>
            </div>
          </div>

          {/* Login Info */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600"><strong>Test OTP:</strong> 123456 (development mode)</p>
            <p className="text-xs text-gray-500 mt-1">❌ = Not Verified | ✅ = Verified</p>
          </div>
        </div>
      </div>
  );
}
