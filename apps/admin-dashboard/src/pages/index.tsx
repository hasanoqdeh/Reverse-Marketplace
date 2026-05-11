import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-indigo-600">
              🛍️ Reverse Marketplace
            </div>
            <div className="flex space-x-6">
              <Link href="/admin/auth/login" className="text-gray-700 hover:text-indigo-600 font-medium">
                Admin Dashboard
              </Link>
              <Link href="/api/docs" className="text-gray-700 hover:text-indigo-600 font-medium">
                API Docs
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Connect Buyers with Merchants
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Post your requests and let merchants compete to offer you the best deals
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/api/request" 
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Buying
            </Link>
            <Link 
              href="/admin/auth/login" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-4 text-indigo-600">Post Requests</h3>
              <p className="text-gray-600">
                Buyers post what they need with details and images
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-4 text-indigo-600">Get Bids</h3>
              <p className="text-gray-600">
                Merchants compete with their best offers and prices
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-4 text-indigo-600">Make Deals</h3>
              <p className="text-gray-600">
                Choose the best bid and complete your purchase
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4">
            &copy; 2026 Reverse Marketplace. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/admin/auth/login" className="text-indigo-400 hover:text-indigo-300">
              Admin Dashboard
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/api/docs" className="text-indigo-400 hover:text-indigo-300">
              API Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
