import Constants from 'expo-constants';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

import { localFirebaseCredentials } from './firebaseCredentials';

type FirebaseExtra = {
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
  adminEmailAllowlist?: string[];
  razorpayKeyId?: string;
  paymentVerificationEndpoint?: string;
  paymentOrderEndpoint?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as FirebaseExtra;

const pickValue = (primary?: string, fallback?: string) => {
  if (primary && primary.trim()) {
    return primary;
  }

  if (fallback && !fallback.startsWith('YOUR_')) {
    return fallback;
  }

  return '';
};

const firebaseConfig = {
  apiKey: pickValue(extra.firebaseApiKey, localFirebaseCredentials.firebaseApiKey),
  authDomain: pickValue(extra.firebaseAuthDomain, localFirebaseCredentials.firebaseAuthDomain),
  projectId: pickValue(extra.firebaseProjectId, localFirebaseCredentials.firebaseProjectId),
  storageBucket: pickValue(extra.firebaseStorageBucket, localFirebaseCredentials.firebaseStorageBucket),
  messagingSenderId: pickValue(
    extra.firebaseMessagingSenderId,
    localFirebaseCredentials.firebaseMessagingSenderId,
  ),
  appId: pickValue(extra.firebaseAppId, localFirebaseCredentials.firebaseAppId),
};

export const firebaseConfigStatus = {
  isConfigured: Object.values(firebaseConfig).every(Boolean),
  adminAllowlist: extra.adminEmailAllowlist ?? [],
  razorpayKeyId: pickValue(extra.razorpayKeyId, localFirebaseCredentials.razorpayKeyId),
  paymentVerificationEndpoint: pickValue(
    extra.paymentVerificationEndpoint,
    localFirebaseCredentials.paymentVerificationEndpoint,
  ),
  paymentOrderEndpoint: pickValue(extra.paymentOrderEndpoint, localFirebaseCredentials.paymentOrderEndpoint),
};

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (firebaseConfigStatus.isConfigured) {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  firestoreInstance = getFirestore(appInstance);
  storageInstance = getStorage(appInstance);
}

export const firebaseApp = appInstance;
export const db = firestoreInstance;
export const storage = storageInstance;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
