import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD7bc74wJSIRi1_BhDqFjEMG2mE3noBm4g',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'halaltune-6c908.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'halaltune-6c908',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'halaltune-6c908.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '159242961546',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:159242961546:web:65bdcd9c3fee61c661e373',
};

console.log("Firebase: Initializing...");

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
