'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, AuthContextType, UserRole } from '@/lib/types';
import { authenticateWithPiSDK, authenticateAdminWithPiSDK, syncUserWithFirebase, getUserProfile, updateUserProfile, initializePiSDK } from '@/lib/piAuth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Listen for Firebase auth state changes
  useEffect(() => {
    // Wait for Pi SDK to be ready before initializing
    let checkInterval: ReturnType<typeof setInterval> | null = null;
    
    const initPiWhenReady = () => {
      // Check if Pi SDK is already ready
      if ((window as any).__PI_SDK_READY__ || (window as any).Pi) {
        initializePiSDK().catch(err => console.error('Failed to initialize Pi SDK:', err));
      } else {
        // Wait for the script to set the flag
        checkInterval = setInterval(() => {
          if ((window as any).__PI_SDK_READY__ || (window as any).Pi) {
            if (checkInterval) clearInterval(checkInterval);
            initializePiSDK().catch(err => console.error('Failed to initialize Pi SDK:', err));
          }
        }, 500);
      }
    };
    
    // Give the script a moment to load first
    const timeoutId = setTimeout(initPiWhenReady, 1000);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('Firebase user authenticated:', firebaseUser.uid);
          // Get user profile from Firestore
          try {
            const userProfile = await getUserProfile(firebaseUser.uid);
            if (userProfile) {
              setUser(userProfile);
            }
          } catch (profileErr) {
            console.warn('Error fetching user profile (may be permission issue):', profileErr);
            // Continue even if profile fetch fails - user might not exist yet
          }
        } else {
          // No Firebase user - user needs to login
          console.log('No Firebase user authenticated');
          setUser(null);
        }
      } catch (err: any) {
        console.error('Auth state error:', err);
        // Check if it's a permission error
        if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
          setError('Firebase permission error. Please check Firestore rules.');
        } else {
          setError(err instanceof Error ? err.message : 'Authentication error');
        }
      } finally {
        setLoading(false);
        setAuthReady(true);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  // No auto-login - users must authenticate

  const loginWithPi = async () => {
    try {
      setLoading(true);
      setError(null);

      // Authenticate with Pi SDK
      const { piUid, username } = await authenticateWithPiSDK();

      // Sign in anonymously to Firebase (or use custom auth)
      const firebaseUser = await signInAnonymously(auth);

      // Sync with Firebase and Firestore
      const userProfile = await syncUserWithFirebase(firebaseUser.user, piUid, username);
      setUser(userProfile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithAdmin = async (apiKey: string) => {
    try {
      setLoading(true);
      setError(null);

      // Authenticate with Pi SDK and validate admin API key
      const { piUid, username, isValid } = await authenticateAdminWithPiSDK(apiKey);

      if (!isValid) {
        throw new Error('Invalid admin API key');
      }

      // Sign in anonymously to Firebase
      const firebaseUser = await signInAnonymously(auth);

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', firebaseUser.user.uid);
      const userSnap = await getDoc(userRef);

      // Create or update admin user in Firestore
      const userData: User = {
        uid: firebaseUser.user.uid,
        email: firebaseUser.user.email || '',
        username: username,
        piUid: piUid,
        role: 'admin' as UserRole,
        estateLocation: '',
        savedAssets: [],
        createdAt: userSnap.exists() ? (userSnap.data() as any).createdAt : new Date(),
        updatedAt: new Date(),
      };

      await setDoc(userRef, userData, { merge: true });
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Admin login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      await updateUserProfile(user.uid, data);
      setUser({ ...user, ...data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    loginWithPi,
    loginWithAdmin,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

