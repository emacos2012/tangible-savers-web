'use client';

import { useState } from 'react';
import type { SavingsGoal } from '@/lib/types';

interface SavingsGoalProps {
  userId?: string;
}

export default function SavingsGoal({ userId }: SavingsGoalProps) {
  // Use static dates for sample data to avoid impure function calls during render
  const [goals, setGoals] = useState<SavingsGoal[]>([
    {
      id: '1',
      userId: 'user1',
      name: 'New Smartphone',
      targetAmount: 500,
      currentAmount: 250,
      deadline: new Date('2025-03-01'),
      createdAt: new Date('2024-12-01'),
    },
    {
      id: '2',
      userId: 'user1',
      name: 'Emergency Fund',
      targetAmount: 1000,
      currentAmount: 600,
      deadline: new Date('2025-06-01'),
      createdAt: new Date('2024-12-01'),
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '' });

  const createGoal = () => {
    if (newGoal.name && newGoal.targetAmount) {
      const goal: SavingsGoal = {
        id: `goal-${Date.now()}`,
        userId: userId || 'user1',
        name: newGoal.name,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: 0,
        deadline: newGoal.deadline ? new Date(newGoal.deadline) : new Date('2025-03-01'),
        createdAt: new Date(),
      };
      setGoals([...goals, goal]);
      setNewGoal({ name: '', targetAmount: '', deadline: '' });
      setShowCreateModal(false);
    }
  };

  const getProgress = (goal: SavingsGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  // Calculate days left using a fixed reference date for consistency
  const getDaysLeft = (deadline: Date) => {
    const refDate = new Date('2025-01-15');
    const diff = deadline.getTime() - refDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Savings Goals</h2>
          <p className="text-gray-500">Track your financial goals</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gold hover:bg-yellow-500 text-gray-900 py-2 px-4 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: '#FFD700' }}
        >
          + New Goal
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-navy to-blue-900 rounded-xl p-4 mb-6 text-white" style={{ backgroundColor: '#1A237E' }}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Total Saved</p>
            <p className="text-3xl font-bold">π {totalSaved.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Target</p>
            <p className="text-xl font-semibold">π {totalTarget.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-3 bg-white/20 rounded-full h-2">
          <div
            className="bg-gold rounded-full h-2 transition-all"
            style={{ width: `${totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}%`, backgroundColor: '#FFD700' }}
          ></div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-800">{goal.name}</h3>
                <p className="text-sm text-gray-500">{getDaysLeft(goal.deadline)} days left</p>
              </div>
              <span className="text-gold font-bold" style={{ color: '#FFD700' }}>
                π {goal.currentAmount} / π {goal.targetAmount}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>{getProgress(goal).toFixed(0)}% complete</span>
                <span>π {(goal.targetAmount - goal.currentAmount).toFixed(2)} remaining</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gold rounded-full h-3 transition-all"
                  style={{ width: `${getProgress(goal)}%`, backgroundColor: '#FFD700' }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-navy hover:bg-blue-900 text-white py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: '#1A237E' }}>
                Add Funds
              </button>
              <button className="px-4 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">No savings goals yet</h3>
          <p className="text-gray-500 mb-4">Create your first savings goal to start saving!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gold hover:bg-yellow-500 text-gray-900 py-2 px-6 rounded-lg font-semibold"
            style={{ backgroundColor: '#FFD700' }}
          >
            Create Goal
          </button>
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Create Savings Goal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g., New Phone, Vacation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (π)</label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date (optional)</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={createGoal}
                className="flex-1 bg-gold hover:bg-yellow-500 text-gray-900 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: '#FFD700' }}
              >
                Create Goal
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
