import { User as FirebaseUser } from 'firebase/auth';
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from './types';

// Wait for Pi SDK to be ready
export const waitForPiSDK = (timeout: number = 30000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Pi) {
      resolve();
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 500;
      if ((window as any).Pi) {
        clearInterval(interval);
        resolve();
      } else if (attempts >= timeout) {
        clearInterval(interval);
        reject(new Error('Pi SDK failed to load'));
      }
    }, 500);
  });
};

export const isPiSDKReady = (): boolean => {
  return !!(window as any).__PI_SDK_READY__ || !!(window as any).Pi;
};

export const initializePiSDK = async (): Promise<void> => {
  try {
    // Wait for Pi SDK to be available first
    await waitForPiSDK();
    
    const pi = (window as any).Pi;
    if (!pi) {
      throw new Error('Pi SDK not available');
    }
    await pi.init({ version: '2.0', appName: 'Tangible Savers' });
  } catch (error) {
    console.error('Failed to initialize Pi SDK:', error);
    // Don't throw - allow retry on authentication
  }
};

export const authenticateWithPiSDK = async (): Promise<{ piUid: string; username: string }> => {
  try {
    // Wait for Pi SDK to be ready first
    await waitForPiSDK(10000);
  } catch (error) {
    throw new Error('Pi SDK is taking too long to load. Please check your internet connection and refresh the page.');
  }

  const pi = (window as any).Pi;
  
  if (!pi) {
    throw new Error('Pi SDK is not available. Please refresh the page and try again.');
  }

  try {
    // Initialize if not already done
    try {
      await pi.init({ version: '2.0', appName: 'Tangible Savers' });
    } catch (initError) {
      // Already initialized or version mismatch - continue with auth
    }

    const piAuth = await pi.authenticate(['username']);
    
    return {
      piUid: piAuth.accessToken || piAuth.user?.uid || String(Math.random()),
      username: piAuth.user?.username || 'PiUser',
    };
  } catch (error: any) {
    console.error('Pi authentication error:', error);
    if (error.message?.includes('network') || error.message?.includes('offline')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw error;
  }
};

export const syncUserWithFirebase = async (
  firebaseUser: FirebaseUser,
  piUid: string,
  username: string
): Promise<User> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  const userData: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: username,
    piUid: piUid,
    estateLocation: '',
    savedAssets: [],
    createdAt: userSnap.exists() ? (userSnap.data() as any).createdAt : new Date(),
    updatedAt: new Date(),
  };

  await setDoc(userRef, userData, { merge: true });
  return userData;
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as User;
  } catch (error) {
    return null;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const linkUserToEstate = async (uid: string, estateId: string, estateLocation: string): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    estateLocation: estateLocation,
    updatedAt: new Date(),
  });

  const propertyRef = doc(db, `users/${uid}/properties`, estateId);
  await setDoc(propertyRef, {
    estateId,
    linkedAt: new Date(),
  });
};

const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY;

export const validateAdminApiKey = (apiKey: string): boolean => {
  if (!ADMIN_API_KEY) {
    return false;
  }
  return apiKey === ADMIN_API_KEY;
};

export const authenticateAdminWithPiSDK = async (apiKey: string): Promise<{ piUid: string; username: string; isValid: boolean }> => {
  if (!validateAdminApiKey(apiKey)) {
    throw new Error('Invalid admin API key');
  }

  const pi = (window as any).Pi;
  
  if (!pi) {
    throw new Error('Pi SDK is still loading. Please try again in a moment.');
  }

  await pi.init({ version: '2.0', appName: 'Tangible Savers' });
  const piAuth = await pi.authenticate(['username']);
  
  return {
    piUid: piAuth.accessToken || piAuth.user?.uid || String(Math.random()),
    username: piAuth.user?.username || 'PiAdmin',
    isValid: true,
  };
};

