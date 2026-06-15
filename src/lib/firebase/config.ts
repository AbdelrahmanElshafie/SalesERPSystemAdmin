// Firebase Configuration
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, createUserWithEmailAndPassword as firebaseCreateUser, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const getEnvValue = (key: string): string | undefined => {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value.trim() : value;
};

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: getEnvValue('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvValue('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvValue('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvValue('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvValue('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvValue('VITE_FIREBASE_APP_ID'),
  measurementId: getEnvValue('VITE_FIREBASE_MEASUREMENT_ID'),
};

// Initialize Firebase only once
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

/**
 * Create a new user without affecting the current session.
 * Uses a secondary Firebase app instance to avoid signing out the admin.
 */
export const createUserWithoutSignIn = async (
  email: string,
  password: string
): Promise<string> => {
  // Create or get a secondary Firebase app for user creation
  const secondaryAppName = 'secondary-auth-app';
  let secondaryApp: FirebaseApp;

  try {
    secondaryApp = getApp(secondaryAppName);
  } catch {
    secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  }

  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await firebaseCreateUser(secondaryAuth, email, password);
    const userId = userCredential.user.uid;

    // Sign out from secondary auth to clean up
    await secondaryAuth.signOut();

    return userId;
  } catch (error) {
    // Sign out from secondary auth on error too
    try {
      await secondaryAuth.signOut();
    } catch {
      // Ignore signout errors
    }
    throw error;
  }
};

/**
 * Send a password reset email to the user.
 */
export const resetUserPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export { app, auth, db, storage };
export default app;
