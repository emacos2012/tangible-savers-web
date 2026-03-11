'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import { DeliveryTask, MoverRequest } from '@/lib/types';
import { requestMover } from '@/lib/piPayments';
import Link from 'next/link';

// Sample data for demo (defined outside component)
const sampleDeliveriesData: DeliveryTask[] = [
  {
    id: 'del1',
    orderId: 'ORD-001',
    userId: 'demo',
    pickupAddress: 'Mall Warehouse, Dar es Salaam',
    deliveryAddress: 'Mikocheni, Dar es Salaam',
    status: 'delivered',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: 'del2',
    orderId: 'ORD-002',
    userId: 'demo',
    pickupAddress: 'Electronics Store, Dar es Salaam',
    deliveryAddress: 'Oyster Bay, Dar es Salaam',
    status: 'in_transit',
    estimatedDeliveryTime: new Date('2024-01-20'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
  },
];

const sampleMoverRequestsData: MoverRequest[] = [
  {
    id: 'mover1',
    userId: 'demo',
    fromAddress: 'Old Apartment, Masaki',
    toAddress: 'New House, Mikocheni',
    movingDate: new Date('2024-02-01'),
    status: 'accepted',
    createdAt: new Date('2024-01-10'),
  },
];

const LogisticsPage: React.FC = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryTask[]>([]);
  const [moverRequests, setMoverRequests] = useState<MoverRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMoverForm, setShowMoverForm] = useState(false);
  const [formData, setFormData] = useState({
    fromAddress: '',
    toAddress: '',
    movingDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Memoize sample data to keep reference stable
  const sampleDeliveries = useMemo(() => sampleDeliveriesData, []);
  const sampleMoverRequests = useMemo(() => sampleMoverRequestsData, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setDeliveries(sampleDeliveries);
        setMoverRequests(sampleMoverRequests);
        setLoading(false);
        return;
      }

      try {
        const deliveriesRef = collection(db, 'deliveryTasks');
        const deliveriesQuery = query(deliveriesRef, where('userId', '==', user.uid));
        const deliveriesSnap = await getDocs(deliveriesQuery);
        
        if (deliveriesSnap.empty) {
          setDeliveries(sampleDeliveries);
        } else {
          const deliveriesData = deliveriesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data() as unknown as { createdAt: { toDate: () => Date } }).createdAt?.toDate(),
            updatedAt: (doc.data() as unknown as { updatedAt: { toDate: () => Date } }).updatedAt?.toDate(),
          } as DeliveryTask));
          setDeliveries(deliveriesData);
        }

        const moversRef = collection(db, 'moverRequests');
        const moversQuery = query(moversRef, where('userId', '==', user.uid));
        const moversSnap = await getDocs(moversQuery);
        
        if (moversSnap.empty) {
          setMoverRequests(sampleMoverRequests);
        } else {
          const moversData = moversSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            movingDate: (doc.data() as unknown as { movingDate: { toDate: () => Date } }).movingDate?.toDate(),
            createdAt: (doc.data() as unknown as { createdAt: { toDate: () => Date } }).createdAt?.toDate(),
          } as MoverRequest));
          setMoverRequests(moversData);
        }
      } catch (error) {
        console.error('Error fetching logistics data:', error);
        setDeliveries(sampleDeliveries);
        setMoverRequests(sampleMoverRequests);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, sampleDeliveries, sampleMoverRequests]);

  const handleMoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Demo mode: Request submitted successfully!');
      setMoverRequests([
        ...moverRequests,
        {
          id: 'demo-' + Date.now(),
          userId: 'demo',
          fromAddress: formData.fromAddress,
          toAddress: formData.toAddress,
          movingDate: new Date(formData.movingDate),
          status: 'pending',
          createdAt: new Date(),
        },
      ]);
      setFormData({ fromAddress: '', toAddress: '', movingDate: '' });
      setShowMoverForm(false);
      return;
    }

    try {
      setSubmitting(true);
      const movingDate = new Date(formData.movingDate);

      const moverId = await requestMover(
        user.uid,
        formData.fromAddress,
        formData.toAddress,
        movingDate
      );

      setMoverRequests([
        ...moverRequests,
        {
          id: moverId,
          userId: user.uid,
          fromAddress: formData.fromAddress,
          toAddress: formData.toAddress,
          movingDate: movingDate,
          status: 'pending',
          createdAt: new Date(),
        },
      ]);

      setFormData({ fromAddress: '', toAddress: '', movingDate: '' });
      setShowMoverForm(false);
      alert('Mover request submitted successfully!');
    } catch (error) {
      console.error('Error submitting mover request:', error);
      alert('Failed to submit mover request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'in_transit':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'accepted':
        return '👍';
      case 'in_progress':
        return '🔄';
      case 'completed':
        return '✅';
      default:
        return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <button className="mb-6 bg-[#FFD700] text-[#1A237E] hover:bg-[#FFC700] px-4 py-2 rounded font-semibold transition">
              ← Back to Home
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-[#1A237E] dark:text-[#FFD700] mb-2">Logistics & Delivery</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Track your deliveries and manage relocation</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading logistics data...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-[#1A237E] dark:text-[#FFD700] mb-4">📦 Order Deliveries</h2>

              {deliveries.length > 0 ? (
                <div className="space-y-4">
                  {deliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white">Order {delivery.orderId}</h3>
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(
                            delivery.status
                          )}`}
                        >
                          {getStatusIcon(delivery.status)} {delivery.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <p>
                          <strong>Pickup:</strong> {delivery.pickupAddress}
                        </p>
                        <p>
                          <strong>Delivery:</strong> {delivery.deliveryAddress}
                        </p>
                        {delivery.estimatedDeliveryTime && (
                          <p>
                            <strong>Estimated:</strong>{' '}
                            {new Date(delivery.estimatedDeliveryTime).toLocaleDateString()}
                          </p>
                        )}
                        {delivery.driverId && (
                          <p>
                            <strong>Driver ID:</strong> {delivery.driverId}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded ${
                            delivery.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                          }`}
                        >
                          Pending
                        </span>
                        <span>→</span>
                        <span
                          className={`px-2 py-1 rounded ${
                            delivery.status === 'in_transit'
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}
                        >
                          In Transit
                        </span>
                        <span>→</span>
                        <span
                          className={`px-2 py-1 rounded ${
                            delivery.status === 'delivered'
                              ? 'bg-green-100'
                              : 'bg-gray-100'
                          }`}
                        >
                          Delivered
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-gray-300 dark:border-gray-700 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">No deliveries yet</p>
                  <p className="text-sm text-gray-500 mt-2">Deliveries from your mall orders will appear here</p>
                </div>
              )}
            </div>

            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
              <h2 className="text-2xl font-bold text-[#1A237E] dark:text-[#FFD700] mb-4">🚚 Relocation</h2>

              <button
                onClick={() => setShowMoverForm(!showMoverForm)}
                className="w-full bg-[#1A237E] text-white hover:bg-[#283593] py-3 rounded font-semibold mb-4 transition"
              >
                {showMoverForm ? 'Cancel' : '+ Request Mover'}
              </button>

              {showMoverForm && (
                <form onSubmit={handleMoverSubmit} className="space-y-3 mb-6 p-4 bg-white dark:bg-gray-800 rounded">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      From Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Current address"
                      value={formData.fromAddress}
                      onChange={(e) => setFormData({ ...formData, fromAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      To Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="New address"
                      value={formData.toAddress}
                      onChange={(e) => setFormData({ ...formData, toAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Moving Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.movingDate}
                      onChange={(e) => setFormData({ ...formData, movingDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#FFD700] text-[#1A237E] hover:bg-[#FFC700] py-2 rounded font-semibold transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Request Mover'}
                  </button>
                </form>
              )}

              {moverRequests.length > 0 ? (
                <div className="space-y-3">
                  {moverRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {getStatusIcon(request.status)} {request.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        From: {request.fromAddress}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        To: {request.toAddress}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                  No mover requests yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsPage;

