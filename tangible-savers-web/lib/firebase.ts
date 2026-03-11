import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth as initAuth, Auth } from 'firebase/auth';
import { getFirestore as initFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase config (use env vars in production). These values were provided
// — you can replace them with environment variables as needed.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCLrxThe1gWXFMhqcbGv7Lo-UVqmBjcm7c",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "tangible-savers-web.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tangible-savers-web",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "tangible-savers-web.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "797116760234",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:797116760234:web:fda956a16fedcce66bd0d3",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-1P2H00J8LV",
};

// Initialize Firebase Client Apps - prevent duplicate initialization
// Only initialize during runtime, not during build
let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firebaseDB: Firestore | undefined;

const initializeFirebase = () => {
  if (firebaseApp) return { app: firebaseApp, auth: firebaseAuth!, db: firebaseDB! };
  
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    firebaseAuth = initAuth(firebaseApp);
    firebaseDB = initFirestore(firebaseApp);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
  
  return { app: firebaseApp, auth: firebaseAuth!, db: firebaseDB! };
};

// Export getters that initialize on demand
export const getFirebaseApp = () => {
  if (!firebaseApp) initializeFirebase();
  return firebaseApp!;
};

export const getFirebaseAuth = (): Auth => {
  if (!firebaseAuth) initializeFirebase();
  return firebaseAuth!;
};

export const getFirebaseDB = (): Firestore => {
  if (!firebaseDB) initializeFirebase();
  return firebaseDB!;
};

// Legacy exports for backward compatibility
export const auth: Auth = {
  currentUser: null,
  // Add other auth properties as needed
} as unknown as Auth;

export const db: Firestore = {
  // Add other firestore properties as needed
} as unknown as Firestore;

// Initialize on first actual use
Object.defineProperty(auth, '_getAuth', {
  get() {
    if (!firebaseAuth) initializeFirebase();
    return firebaseAuth;
  }
});

Object.defineProperty(db, '_getDB', {
  get() {
    if (!firebaseDB) initializeFirebase();
    return firebaseDB;
  }
});

// Re-export for backward compatibility
export { firebaseApp as default };

// Initialize analytics only in the browser (guard for SSR)
// and handle errors gracefully
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  try {
    // Delay analytics initialization to not block the main thread
    setTimeout(() => {
      try {
        const initializedApp = getFirebaseApp();
        analytics = getAnalytics(initializedApp);
      } catch (_err) {
        // Analytics may fail in some environments; ignore silently
        console.warn('Analytics initialization failed:', _err);
      }
    }, 2000);
  } catch (_err) {
    // Analytics may fail in some environments; ignore silently
  }
}

export { analytics };

