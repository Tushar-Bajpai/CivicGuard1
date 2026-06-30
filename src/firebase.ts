import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// 1. Retrieve environment variables
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if critical keys are provided
const isConfigured = !!firebaseConfig.apiKey;

if (!isConfigured) {
  console.warn(
    "⚠️ Firebase configuration is missing. " +
    "Please add your Firebase keys to your environment variables (e.g., .env) " +
    "prefixed with VITE_ to connect to Firestore and Auth."
  );
}

// 2. Initialize Firebase services lazily
const app = isConfigured 
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? (env.VITE_FIREBASE_DATABASE_ID ? getFirestore(app, env.VITE_FIREBASE_DATABASE_ID) : getFirestore(app)) : null;
export const storage = app ? getStorage(app) : null;
export const functions = app ? getFunctions(app) : null;

// Error enum and interface per skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * 3. Connection Test Function
 * Writes a test document to a `test` collection and verifies read/write capabilities,
 * logging detailed diagnostic output to the developer console.
 */
export async function testFirestoreConnection() {
  if (!db) {
    console.error("❌ Firestore connection test failed: Firebase is not configured.");
    return false;
  }

  const testDocPath = 'test/connection';
  const testPayload = {
    connectedAt: new Date().toISOString(),
    status: "verified",
    message: "CivicGuard Firebase Integration Test is successful!"
  };

  try {
    console.log("🔄 Starting Firestore connection test...");
    
    // Test Write
    await setDoc(doc(db, testDocPath), testPayload);
    console.log("✅ Firestore write test succeeded! Document written to 'test/connection'.");

    // Test Read from server (bypassing cache to ensure live connectivity)
    const serverSnap = await getDocFromServer(doc(db, testDocPath));
    if (serverSnap.exists()) {
      console.log("✅ Firestore read test succeeded! Retrieved data from server:", serverSnap.data());
      return true;
    } else {
      console.warn("⚠️ Firestore read test returned no data. Check if security rules block read access.");
      return false;
    }
  } catch (error) {
    console.error("❌ Firestore connection test failed with error:");
    // Try to format nicely if it's a permissions error
    if (error instanceof Error && error.message.includes("permission-denied")) {
      console.error("🔒 Security Rules Denied Access: Verify that your Firestore Rules permit writes to the 'test' collection.");
    } else {
      console.error(error);
    }
    
    try {
      handleFirestoreError(error, OperationType.WRITE, testDocPath);
    } catch {
      // Swallowing rethrown error inside connection test helper
    }
    return false;
  }
}

// Automatically execute connection test if configured
if (isConfigured) {
  testFirestoreConnection();
}
