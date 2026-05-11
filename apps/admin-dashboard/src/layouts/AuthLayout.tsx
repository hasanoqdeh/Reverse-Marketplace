'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Shield } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title = 'Admin Login - Reverse Marketplace'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Back to Home Link */}
        <div className="absolute top-4 left-4">
          <Link 
            href="/" 
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <Shield className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>
        
        {/* Auth Content */}
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
      </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2026 Reverse Marketplace. All rights reserved.</p>
        </div>
    </>
  );
};

export default AuthLayout;
