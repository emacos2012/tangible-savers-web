
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/authContext';
import WalletCard from '@/components/WalletCard';
import InvestmentCard from '@/components/InvestmentCard';

export default function Home() {
  const { user, loginWithPi, loading, error } = useAuth();
  const [loginAttempting, setLoginAttempting] = useState(false);

  const handlePiLogin = async () => {
    setLoginAttempting(true);
    try {
      await loginWithPi();
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoginAttempting(false);
    }
  };

  const categories = [
    {
      name: 'Housing & Estates',
      icon: '🏠',
      color: 'bg-gradient-to-br from-[#1A237E] to-[#283593]',
      ctaColor: 'bg-[#FFD700]',
      href: '/housing',
      description: 'Manage properties and pay estate dues with Pi',
      image: '/IMG-20250709-WA0014.jpg'
    },
    {
      name: 'Shopping Mall',
      icon: '🛍️',
      color: 'bg-gradient-to-br from-pink-500 to-red-500',
      ctaColor: 'bg-pink-600',
      href: '/mall',
      description: 'Browse & shop with Pi payment',
      image: '/ChatGPT Image Dec 25, 2025, 10_54_38 AM.png'
    },
    {
      name: 'Logistics',
      icon: '📦',
      color: 'bg-gradient-to-br from-green-500 to-teal-500',
      ctaColor: 'bg-green-600',
      href: '/logistics',
      description: 'Track deliveries & request movers',
      image: '/Gemini_Generated_Image_wonq05wonq05wonq.png'
    },
    {
      name: 'Transportation',
      icon: '🚗',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      ctaColor: 'bg-blue-600',
      href: '/transportation',
      description: 'Get transportation deals & discounts',
      image: null
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-950 pb-24">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-[#1A237E] dark:text-white mb-4">
            Save Money on Everything
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover deals on housing, shopping, logistics, and more. Pay with Pi cryptocurrency and save big!
          </p>

          {!user ? (
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handlePiLogin}
                disabled={loginAttempting || loading}
                className="inline-block bg-gradient-to-r from-[#1A237E] to-[#283593] hover:opacity-90 text-white px-8 py-4 rounded-lg font-bold text-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                <span>🥧</span>
                <span>{loginAttempting || loading ? 'Connecting...' : 'Login with Pi'}</span>
              </button>
              <Link href="/housing">
                <button className="inline-block bg-[#FFD700] hover:bg-[#FFC700] text-[#1A237E] px-8 py-4 rounded-lg font-bold text-lg transition">
                  🏠 Explore Housing
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/housing">
                <button className="inline-block bg-[#FFD700] hover:bg-[#FFC700] text-[#1A237E] px-8 py-4 rounded-lg font-bold text-lg transition">
                  🏠 Explore Housing
                </button>
              </Link>
              <Link href="/mall">
                <button className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition">
                  🛍️ Shop Now
                </button>
              </Link>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded max-w-md mx-auto">
              {error}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-[#FFD700]">1000+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Deals</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-[#1A237E] dark:text-white">650K</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Users Saved</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-[#1A237E] dark:text-white">$50M+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Saved Together</div>
          </div>
        </div>
      </section>

      {/* Wallet & Investments Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user ? (
            <>
              <WalletCard userId={user.uid} />
              <InvestmentCard userId={user.uid} />
            </>
          ) : (
            <>
              {/* Login Prompt Card */}
              <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">💰 My Wallet</h3>
                </div>
                <div className="mb-4">
                  <p className="text-white/70 text-sm mb-2">Available Balance</p>
                  <p className="text-3xl font-bold">Login to view</p>
                </div>
                <p className="text-sm text-white/70 mb-4">
                  Connect with Pi to access your wallet and track savings
                </p>
                <button
                  onClick={handlePiLogin}
                  disabled={loginAttempting || loading}
                  className="w-full bg-white text-[#1A237E] py-3 rounded-lg font-bold hover:bg-gray-100 transition disabled:opacity-50"
                >
                  {loginAttempting || loading ? 'Connecting...' : 'Login with Pi'}
                </button>
              </div>

              {/* Login Prompt for Investments */}
              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">📈 Investments</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-white/70 mb-4">
                    Track your savings and investments in one place
                  </p>
                  <button
                    onClick={handlePiLogin}
                    disabled={loginAttempting || loading}
                    className="w-full bg-white text-green-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    {loginAttempting || loading ? 'Connecting...' : 'Login with Pi'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Main Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-[#1A237E] dark:text-[#FFD700] mb-8 text-center">
          Our Modules
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, idx) => (
            <Link key={idx} href={cat.href}>
              <div
                className={`${cat.color} p-8 rounded-lg text-white cursor-pointer hover:shadow-xl transform hover:scale-105 transition`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="text-5xl mb-4">{cat.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                    <p className="mb-6 text-white/90">{cat.description}</p>
                    <button className={`${cat.ctaColor} text-white hover:opacity-90 px-6 py-2 rounded font-semibold transition`}>
                      Explore →
                    </button>
                  </div>
                  {cat.image && (
                    <div className="w-32 h-32 bg-white/20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image 
                        src={cat.image} 
                        alt={cat.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-800 mt-12">
        <h2 className="text-3xl font-bold text-[#1A237E] dark:text-[#FFD700] mb-8 text-center">
          Why Choose Tangible Savers?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Secure Payments
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              3-way handshake authentication with Pi blockchain ensures maximum security
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Real Savings
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Save up to 50% on housing, shopping, and logistics with our exclusive deals
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Instant Transactions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fast, seamless Pi payments with instant order tracking and delivery
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 mt-12">
        <div className="bg-gradient-to-r from-[#1A237E] to-[#FFD700] rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Save?</h2>
          <p className="text-lg mb-6 text-white/90">
            Join thousands of Tanzanians saving money on everyday purchases
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!user ? (
              <button
                onClick={handlePiLogin}
                disabled={loginAttempting || loading}
                className="bg-white text-[#1A237E] hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition disabled:opacity-50"
              >
                {loginAttempting || loading ? 'Connecting...' : 'Login with Pi'}
              </button>
            ) : (
              <Link href="/housing">
                <button className="bg-white text-[#1A237E] hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition">
                  Start Saving Now
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
