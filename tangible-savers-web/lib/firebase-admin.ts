// Server-side only Firebase Admin SDK
// This file should ONLY be imported in server-side code (API routes, getServerSideProps, etc.)
// Do NOT import this file in client components!

import * as admin from 'firebase-admin';
import serviceAccount from './tangible-savers-web-firebase-fbsvc-3b6fdfff5b.json';

// Firebase Admin SDK setup - Server-side only
let adminApp: admin.app.App | null = null;

export const getAdminApp = async () => {
  if (adminApp) {
    return adminApp;
  }
  
  if (!admin.apps.length) {
    try {
      // Use service account JSON file (imported as ES module)
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
    }
  } else {
    adminApp = admin.apps[0];
  }
  
  return adminApp;
};

export const getAdminFirestore = async () => {
  const app = await getAdminApp();
  if (app) {
    return app.firestore();
  }
  return null;
};

export const getAdminAuth = async () => {
  const app = await getAdminApp();
  if (app) {
    return app.auth();
  }
  return null;
};

export default adminApp;


