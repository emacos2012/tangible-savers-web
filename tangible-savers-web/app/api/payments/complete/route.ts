import { NextResponse } from 'next/server';
import axios from 'axios';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  const { paymentId, txid } = await request.json();
  const PI_API_KEY = process.env.PI_API_KEY;

  if (!paymentId || !txid) {
    return NextResponse.json({ error: 'Payment ID and Transaction ID are required' }, { status: 400 });
  }

  if (!PI_API_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Skip database operations during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: 'Build mode - skipping payment', txid }, { status: 200 });
  }

  try {
    // Check if payment already completed to prevent duplicate confirmations
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentSnap = await getDoc(paymentRef);

    if (paymentSnap.exists()) {
      const paymentData = paymentSnap.data();
      if (paymentData.status === 'completed') {
        return NextResponse.json({ 
          message: 'Payment already completed', 
          txid: paymentData.txid 
        }, { status: 200 });
      }
    }

    // Complete payment with Pi Network Servers
    await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      { txid },
      { headers: { Authorization: `Key ${PI_API_KEY}` } }
    );

    // Update payment status in Firestore
    await setDoc(paymentRef, {
      status: 'completed',
      txid: txid,
      completedAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ message: 'Completed', txid }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Completion Failed', details: errorMessage }, { status: 500 });
  }
}
