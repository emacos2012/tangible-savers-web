"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface PiContextType {
  piUser: any;
  authenticate: () => Promise<any>;
  isLoaded: boolean;
  error: string | null;
}

const PiContext = createContext<PiContextType | null>(null);

export const PiProvider = ({ children }: { children: React.ReactNode }) => {
  const [piUser, setPiUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Wait for Pi SDK to be ready with retry logic
  const waitForPiSDK = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait

      const checkPi = () => {
        attempts++;
        
        if ((window as any).Pi) {
          resolve();
          return;
        }

        if (attempts >= maxAttempts) {
          reject(new Error('Pi SDK failed to load after 30 seconds'));
          return;
        }

        // Retry after 1 second
        setTimeout(checkPi, 1000);
      };

      checkPi();
    });
  }, []);

  useEffect(() => {
    // Ensure Pi SDK is loaded via script tag in layout.tsx first
    if (typeof window === 'undefined') {
      return;
    }
 
    const initPi = async () => {
      try {
        // Wait for Pi SDK to be available
        await waitForPiSDK();
        
        // Now initialize Pi with version 2.0
        if ((window as any).Pi && !initialized) {
          try {
            await (window as any).Pi.init({ 
              version: "2.0", 
              sandbox: process.env.NODE_ENV !== 'production'
            });
            setInitialized(true);
            setIsLoaded(true);
            setError(null);
          } catch (initErr: any) {
            // If version 2.0 fails, try version 1.5 as fallback
            console.warn('Pi SDK v2.0 init failed, trying v1.5:', initErr);
            try {
              await (window as any).Pi.init({ 
                version: "1.5", 
                sandbox: true 
              });
              setInitialized(true);
              setIsLoaded(true);
              setError(null);
            } catch (fallbackErr) {
              console.error("Failed to initialize Pi SDK (fallback):", fallbackErr);
              setError("Failed to initialize Pi SDK");
            }
          }
        }
      } catch (err: any) {
        console.error("Pi SDK initialization error:", err);
        setError(err.message || "Failed to initialize Pi SDK");
        // Don't set isLoaded to false - allow retry
      }
    };

    // Give the script a moment to load first
    const timeoutId = setTimeout(initPi, 1000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [waitForPiSDK, initialized]);

  const authenticate = async () => {
    // Wait for Pi SDK to be loaded
    if (!isLoaded) {
      // Try to initialize first
      try {
        await waitForPiSDK();
        if ((window as any).Pi) {
          await (window as any).Pi.init({ 
            version: "2.0", 
            sandbox: process.env.NODE_ENV !== 'production'
          });
          setIsLoaded(true);
        }
      } catch (err) {
        throw new Error('Pi SDK not loaded. Please refresh the page and try again.');
      }
    }

    try {
      const scopes = ['payments', 'username'];
      const auth = await (window as any).Pi.authenticate(scopes, onIncompletePaymentFound);
      setPiUser(auth.user);
      setError(null);
      return auth;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Pi Auth failed", err);
      setError(errorMessage);
      throw err;
    }
  };

  const onIncompletePaymentFound = (payment: any) => {
    // Handle logic for incomplete payments found on ledger
    console.log("Incomplete payment found:", payment);
  };

  return (
    <PiContext.Provider value={{ piUser, authenticate, isLoaded, error }}>
      {children}
    </PiContext.Provider>
  );
};

export const usePi = () => {
  const context = useContext(PiContext);
  if (!context) {
    throw new Error('usePi must be used within PiProvider');
  }
  return context;
};
