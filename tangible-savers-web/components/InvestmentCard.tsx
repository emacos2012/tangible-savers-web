'use client';

import { useState } from 'react';
import type { Investment } from '@/lib/types';

interface InvestmentCardProps {
  userId?: string;
}

export default function InvestmentCard({ userId }: InvestmentCardProps) {
  // Use static dates for sample data to avoid impure function calls during render
  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: '1',
      userId: 'user1',
      name: 'Pi Network Mining',
      type: 'crypto',
      amount: 100,
      expectedReturn: 15,
      currentValue: 115,
      riskLevel: 'medium',
      status: 'active',
      purchasedAt: new Date('2024-12-01'),
    },
    {
      id: '2',
      userId: 'user1',
      name: 'Real Estate Fund',
      type: 'real_estate',
      amount: 500,
      expectedReturn: 8,
      currentValue: 520,
      riskLevel: 'low',
      status: 'active',
      purchasedAt: new Date('2024-10-01'),
    },
  ]);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturns = totalValue - totalInvested;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crypto': return '₿';
      case 'stocks': return '📈';
      case 'bonds': return '💵';
      case 'real_estate': return '🏠';
      default: return '💰';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Investments</h2>
          <p className="text-gray-500">Grow your wealth</p>
        </div>
        <button
          className="bg-gold hover:bg-yellow-500 text-gray-900 py-2 px-4 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: '#FFD700' }}
        >
          + Invest
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Invested</p>
          <p className="text-xl font-bold text-gray-800">π {totalInvested.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Current Value</p>
          <p className="text-xl font-bold text-gray-800">π {totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Returns</p>
          <p className={`text-xl font-bold ${totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalReturns >= 0 ? '+' : ''}π {totalReturns.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Investment List */}
      <div className="space-y-4">
        {investments.map((investment) => (
          <div key={investment.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                  {getTypeIcon(investment.type)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{investment.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{investment.type.replace('_', ' ')}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(investment.riskLevel)}`}>
                {investment.riskLevel} risk
              </span>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Invested</p>
                <p className="font-semibold">π {investment.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Value</p>
                <p className="font-semibold">π {investment.currentValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expected Return</p>
                <p className="font-semibold text-green-600">+{investment.expectedReturn}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Profit/Loss</p>
                <p className={`font-semibold ${investment.currentValue - investment.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {investment.currentValue - investment.amount >= 0 ? '+' : ''}π {(investment.currentValue - investment.amount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {investments.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📈</span>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">No investments yet</h3>
          <p className="text-gray-500 mb-4">Start investing to grow your wealth!</p>
          <button
            className="bg-gold hover:bg-yellow-500 text-gray-900 py-2 px-6 rounded-lg font-semibold"
            style={{ backgroundColor: '#FFD700' }}
          >
            Start Investing
          </button>
        </div>
      )}
    </div>
  );
}
