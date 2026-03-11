'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import { linkUserToEstate } from '@/lib/piAuth';
import { Estate } from '@/lib/types';
import Link from 'next/link';

// Sample estates for demo (defined outside component)
const sampleEstatesData: Estate[] = [
  {
    id: 'estate1',
    name: 'Sunrise Gardens Estate',
    location: 'Mikocheni, Dar es Salaam',
    description: 'Modern residential estate with excellent amenities',
    monthlyDues: 25,
    currency: 'Pi',
    totalUnits: 120,
    occupiedUnits: 95,
    amenities: ['Security', 'Pool', 'Gym', 'Parking'],
    image: '/IMG-20250709-WA0014.jpg'
  },
  {
    id: 'estate2',
    name: 'Lakeside View Apartments',
    location: 'Oyster Bay, Dar es Salaam',
    description: 'Luxury apartments with lake view',
    monthlyDues: 35,
    currency: 'Pi',
    totalUnits: 80,
    occupiedUnits: 72,
    amenities: ['Security', 'Pool', 'Restaurant', 'Parking'],
    image: '/ChatGPT Image Dec 25, 2025, 10_54_38 AM.png'
  },
  {
    id: 'estate3',
    name: 'Green Valley Residences',
    location: 'Masaki, Dar es Salaam',
    description: 'Family-friendly estate green with large spaces',
    monthlyDues: 20,
    currency: 'Pi',
    totalUnits: 60,
    occupiedUnits: 48,
    amenities: ['Security', 'Garden', 'Kids Play Area', 'Parking'],
    image: '/Gemini_Generated_Image_wonq05wonq05wonq.png'
  },
  {
    id: 'estate4',
    name: 'Downtown Heights',
    location: 'City Center, Dar es Salaam',
    description: 'Urban living in the heart of the city',
    monthlyDues: 40,
    currency: 'Pi',
    totalUnits: 200,
    occupiedUnits: 180,
    amenities: ['Security', 'Gym', 'Rooftop', 'Concierge'],
    image: undefined
  },
];

const HousingPage: React.FC = () => {
  const { user } = useAuth();
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstate, setSelectedEstate] = useState<Estate | null>(null);

  // Memoize sampleEstates to keep reference stable
  const sampleEstates = useMemo(() => sampleEstatesData, []);

  useEffect(() => {
    const fetchEstates = async () => {
      try {
        console.log('Fetching estates from Firestore...');
        const estatesRef = collection(db, 'estates');
        const estatesSnap = await getDocs(estatesRef);
        
        console.log('Estates query result:', estatesSnap.size, 'documents');
        
        if (estatesSnap.empty) {
          console.log('No estates in Firestore, using sample data');
          setEstates(sampleEstates);
        } else {
          const estatesData = estatesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as Estate));
          setEstates(estatesData);
        }
      } catch (error: unknown) {
        console.error('Error fetching estates:', error);
        if (error instanceof Error && (error.message.includes('permission') || error.message.includes('Permission'))) {
          console.warn('Firestore permission error - using sample data. Check Firestore rules.');
        }
        setEstates(sampleEstates);
      } finally {
        setLoading(false);
      }
    };

    fetchEstates();
  }, [sampleEstates]);

  const handleSelectEstate = async (estate: Estate) => {
    setSelectedEstate(estate);
    if (user) {
      try {
        await linkUserToEstate(user.uid, estate.id, estate.location);
      } catch (error) {
        console.error('Error linking estate:', error);
      }
    }
  };

  const handlePayMonthlyDues = async (estate: Estate) => {
    if (!user) {
      alert('Demo Mode: Payment simulation - would pay ' + estate.monthlyDues + ' Pi for ' + estate.name);
      return;
    }
    alert(`Initiating payment of ${estate.monthlyDues} Pi for ${estate.name}`);
  };

  const displayEstateLocation = user?.estateLocation || 'Sunrise Gardens Estate';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A237E] to-[#283593] text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <button className="mb-6 bg-[#FFD700] text-[#1A237E] hover:bg-[#FFC700] px-4 py-2 rounded font-semibold transition">
              ← Back to Home
            </button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Housing & Estates</h1>
          <p className="text-[#FFD700] text-lg">Manage your property and pay monthly dues</p>
        </div>

        {!user && (
          <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 text-sm">
              📌 Demo Mode: You&apos;re viewing sample data. Login to see your real profile.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading estates...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Available Estates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {estates.map((estate) => (
                  <div
                    key={estate.id}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                      selectedEstate?.id === estate.id
                        ? 'border-[#FFD700] bg-[#283593]'
                        : 'border-white/20 hover:border-[#FFD700]'
                    }`}
                    onClick={() => handleSelectEstate(estate)}
                  >
                    <div className="h-32 mb-4 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
                      {estate.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={estate.image} 
                          alt={estate.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">🏠</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{estate.name}</h3>
                    <p className="text-sm mb-3 text-gray-200">{estate.location}</p>
                    <div className="mb-4 text-sm">
                      <p>
                        <strong>Units:</strong> {estate.occupiedUnits}/{estate.totalUnits}
                      </p>
                      <p className="text-[#FFD700]">
                        <strong>Monthly Dues:</strong> {estate.monthlyDues} Pi
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayMonthlyDues(estate);
                        }}
                        className="flex-1 bg-[#FFD700] text-[#1A237E] hover:bg-[#FFC700] py-2 rounded font-semibold transition"
                      >
                        Pay Dues
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectEstate(estate);
                        }}
                        className="flex-1 border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#1A237E] py-2 rounded font-semibold transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-bold mb-4">My Property</h2>
              <div className="space-y-3">
                <p className="text-gray-200">
                  <strong>Estate:</strong> {displayEstateLocation}
                </p>
                <p className="text-gray-200">
                  <strong>Unit:</strong> A-101
                </p>
                <p className="text-gray-200">
                  <strong>Status:</strong> <span className="text-[#FFD700]">Active</span>
                </p>
                <div className="pt-4 space-y-2">
                  <button className="w-full bg-[#FFD700] text-[#1A237E] hover:bg-[#FFC700] py-2 rounded font-semibold transition">
                    View Property Details
                  </button>
                  <button className="w-full border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#1A237E] py-2 rounded font-semibold transition">
                    Request Maintenance
                  </button>
                  <button className="w-full border border-white/30 text-white hover:bg-white/10 py-2 rounded font-semibold transition">
                    Pay Dues (25 Pi)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HousingPage;

