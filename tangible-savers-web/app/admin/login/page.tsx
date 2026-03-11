'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';

export default function AdminLoginPage() {
  const { loginWithPi, loginWithAdmin, loading, error, user } = useAuth();
  const [loginAttempting, setLoginAttempting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const router = useRouter();

  const handleAdminLogin = async () => {
    if (!apiKey.trim()) {
      alert('Please enter your admin API key');
      return;
    }
    setLoginAttempting(true);
    try {
      // Login with admin - validates API key
      await loginWithAdmin(apiKey);
      router.push('/admin');
    } catch (err) {
      console.error('Admin login failed:', err);
    } finally {
      setLoginAttempting(false);
    }
  };

  const handlePiLogin = async () => {
    setLoginAttempting(true);
    try {
      await loginWithPi();
      router.push('/');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoginAttempting(false);
    }
  };

  // If user is already logged in as admin, redirect to admin dashboard
  if (user?.role === 'admin') {
    router.push('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#FFD700] mb-4">
            🛡️ Admin Portal
          </h1>
          <p className="text-gray-300">
            Login with your Pi account and admin API key to access the admin dashboard
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
          {!showApiKeyInput ? (
            <>
              <button
                onClick={() => setShowApiKeyInput(true)}
                disabled={loginAttempting || loading}
                className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA000] hover:from-[#FFA000] hover:to-[#FFD700] text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <span>🥧</span>
                <span>{loginAttempting || loading ? 'Authenticating...' : 'Admin Login with Pi'}</span>
              </button>

              <div className="mt-6 text-center text-sm text-gray-400">
                <p>Authorized administrators only.</p>
                <p className="mt-2">Contact support if you need admin access.</p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Admin API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your admin API key"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              <button
                onClick={handleAdminLogin}
                disabled={loginAttempting || loading || !apiKey.trim()}
                className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA000] hover:from-[#FFA000] hover:to-[#FFD700] text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <span>🥧</span>
                <span>{loginAttempting || loading ? 'Authenticating...' : 'Login as Admin'}</span>
              </button>

              <button
                onClick={() => {
                  setShowApiKeyInput(false);
                  setApiKey('');
                }}
                className="w-full mt-3 text-gray-400 hover:text-white text-sm"
              >
                ← Back
              </button>
            </>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 text-red-400 rounded border border-red-800">
              {error}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-[#FFD700] hover:underline">
            ← Back to User Login
          </Link>
          <span className="mx-2 text-gray-500">|</span>
          <Link href="/" className="text-gray-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
