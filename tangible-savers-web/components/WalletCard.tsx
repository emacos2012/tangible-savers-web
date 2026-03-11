'use client';

import { useState } from 'react';
import { Wallet, WalletTransaction } from '@/lib/types';

interface WalletCardProps {
  wallet?: Wallet;
  userId?: string;
}

export default function WalletCard({ wallet, userId }: WalletCardProps) {
  const [balance, setBalance] = useState(wallet?.balance || 0);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');

  // Sample transactions with static dates to avoid impure function calls
  const transactions: WalletTransaction[] = [
    {
      id: '1',
      type: 'credit',
      amount: 50,
      description: 'Received from John',
      timestamp: new Date('2025-01-14T10:00:00'),
      status: 'completed',
    },
    {
      id: '2',
      type: 'debit',
      amount: 25.50,
      description: 'Shopping Mall Purchase',
      timestamp: new Date('2025-01-13T14:30:00'),
      status: 'completed',
    },
    {
      id: '3',
      type: 'credit',
      amount: 100,
      description: 'Wallet Top-up',
      timestamp: new Date('2025-01-12T09:15:00'),
      status: 'completed',
    },
  ];

  const handleAddFunds = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0) {
      setBalance(prev => prev + amountNum);
      setAmount('');
      setShowAddFunds(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Wallet Header */}
      <div className="bg-gradient-to-r from-navy to-blue-900 p-6 text-white" style={{ backgroundColor: '#1A237E' }}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-80">Total Balance</p>
            <h2 className="text-4xl font-bold mt-1">
              π {balance.toFixed(2)}
            </h2>
            <p className="text-sm opacity-70 mt-2">Pi Cryptocurrency</p>
          </div>
          <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFD700' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowAddFunds(true)}
            className="flex-1 bg-gold hover:bg-yellow-500 text-gray-900 py-2 px-4 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: '#FFD700' }}
          >
            + Add Funds
          </button>
          <button className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
            Send
          </button>
          <button className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
            QR Pay
          </button>
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add Funds to Wallet</h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in Pi"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gold"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddFunds}
                className="flex-1 bg-gold hover:bg-yellow-500 text-gray-900 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: '#FFD700' }}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowAddFunds(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {tx.type === 'credit' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{tx.description}</p>
                  <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                </div>
              </div>
              <span className={`font-bold ${
                tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {tx.type === 'credit' ? '+' : '-'}π {tx.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 text-center text-gold hover:text-yellow-500 font-medium" style={{ color: '#FFD700' }}>
          View All Transactions
        </button>
      </div>
    </div>
  );
}
