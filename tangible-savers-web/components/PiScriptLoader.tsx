"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const PiScriptLoader: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if Pi SDK is already loaded
    const checkPiSDK = () => {
      if ((window as any).Pi) {
        setIsReady(true);
        (window as any).__PI_SDK_READY__ = true;
        return true;
      }
      return false;
    };

    // Initial check
    if (!checkPiSDK()) {
      // Poll for Pi SDK to load
      const interval = setInterval(() => {
        if (checkPiSDK()) {
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, []);

  return (
    <>
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Wait for Pi to be available
          const waitForPi = () => {
            if ((window as any).Pi) {
              (window as any).__PI_SDK_READY__ = true;
              setIsReady(true);
            } else {
              setTimeout(waitForPi, 100);
            }
          };
          waitForPi();
        }}
        onError={(e) => {
          console.error("Failed to load Pi SDK:", e);
        }}
      />
      {/* Fallback: also try loading from alternative CDN */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@pihub/pi-sdk@latest/dist/pi-sdk.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if ((window as any).Pi) {
            (window as any).__PI_SDK_READY__ = true;
            setIsReady(true);
          }
        }}
      />
    </>
  );
};

export default PiScriptLoader;
