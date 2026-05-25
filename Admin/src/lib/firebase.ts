import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDJZOb29N5tFPfauXMd4683Tbt3aq5Z7po',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'halaltune-41309.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'halaltune-41309',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'halaltune-41309.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '863902327952',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:863902327952:web:e0efe47977994f1b74e415',
};

console.log("Firebase: Initializing...");

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
