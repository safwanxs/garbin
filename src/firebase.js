import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingConfig.length) {
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let anonymousSignIn;

export function ensureAnonymousAuth() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  if (!anonymousSignIn) {
    anonymousSignIn = signInAnonymously(auth)
      .then((credential) => credential.user)
      .catch((error) => {
        anonymousSignIn = null;
        throw error;
      });
  }

  return anonymousSignIn;
}

export async function getFirebaseAuthHeaders() {
  const user = await ensureAnonymousAuth();
  return { Authorization: `Bearer ${await user.getIdToken()}` };
}

export { app, db, auth };
