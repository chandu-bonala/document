import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { demoAdminCredentials } from '../config/demoAdmin';
import { auth, db, firebaseConfigStatus } from '../config/firebase';
import { AdminProfile } from '../types';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const canUseAllowlist = (email: string) =>
  firebaseConfigStatus.adminAllowlist.length === 0 ||
  firebaseConfigStatus.adminAllowlist.includes(normalizeEmail(email));

const ensureAdminProfile = async (input: {
  uid: string;
  email: string;
  displayName: string;
  isDemo?: boolean;
}) => {
  if (!db) {
    throw new Error('Admin database is not configured.');
  }

  await setDoc(
    doc(db, 'admins', input.uid),
    {
      uid: input.uid,
      email: normalizeEmail(input.email),
      displayName: input.displayName.trim() || 'Admin',
      role: 'admin',
      isDemo: Boolean(input.isDemo),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const signInAdmin = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Admin email and password are required.');
  }

  const normalizedEmail = normalizeEmail(email);

  const isDemoCredentialPair =
    normalizedEmail === demoAdminCredentials.email &&
    password === demoAdminCredentials.password;

  if (!firebaseConfigStatus.isConfigured || !auth) {
    if (isDemoCredentialPair) {
      return {
        authMode: 'demo' as const,
        uid: 'demo-admin',
        email: demoAdminCredentials.email,
        displayName: demoAdminCredentials.displayName,
      };
    }

    throw new Error('Firebase credentials are missing. Add them in app.json or app config first.');
  }

  let credentials;
  try {
    credentials = await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : '';

    const canBootstrapDemoAdmin =
      isDemoCredentialPair &&
      (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials');

    if (canBootstrapDemoAdmin) {
      try {
        credentials = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(credentials.user, {
          displayName: demoAdminCredentials.displayName,
        });
      } catch (createError) {
        const createCode =
          typeof createError === 'object' && createError !== null && 'code' in createError
            ? String((createError as { code?: unknown }).code ?? '')
            : '';

        // If demo email already exists with a different password, keep local demo access available.
        if (createCode === 'auth/email-already-in-use') {
          return {
            authMode: 'demo' as const,
            uid: 'demo-admin',
            email: demoAdminCredentials.email,
            displayName: demoAdminCredentials.displayName,
          };
        }

        throw createError;
      }
    } else if (isDemoCredentialPair) {
      // Never lock out demo admin panel due to Firebase auth edge cases.
      return {
        authMode: 'demo' as const,
        uid: 'demo-admin',
        email: demoAdminCredentials.email,
        displayName: demoAdminCredentials.displayName,
      };
    } else {
      throw error;
    }
  }

  const userEmail = normalizeEmail(credentials.user.email ?? '');

  if (canUseAllowlist(userEmail)) {
    await ensureAdminProfile({
      uid: credentials.user.uid,
      email: credentials.user.email ?? userEmail,
      displayName:
        credentials.user.displayName ??
        (isDemoCredentialPair ? demoAdminCredentials.displayName : 'Admin'),
      isDemo: isDemoCredentialPair,
    });

    return {
      authMode: 'firebase' as const,
      user: credentials.user,
    };
  }

  if (!db) {
    throw new Error('Admin database is not configured.');
  }

  const adminProfile = await getDoc(doc(db, 'admins', credentials.user.uid));

  if (!adminProfile.exists() || adminProfile.data().role !== 'admin') {
    throw new Error('This account is authenticated but not approved for admin access.');
  }

  await ensureAdminProfile({
    uid: credentials.user.uid,
    email: credentials.user.email ?? userEmail,
    displayName: credentials.user.displayName ?? 'Admin',
  });

  return {
    authMode: 'firebase' as const,
    user: credentials.user,
  };
};

export const signUpAdmin = async (input: {
  email: string;
  password: string;
  displayName: string;
}) => {
  if (!input.email || !input.password || !input.displayName) {
    throw new Error('Display name, email, and password are required.');
  }

  if (!firebaseConfigStatus.isConfigured || !auth || !db) {
    throw new Error('Firebase credentials are missing. Add them in app config first.');
  }

  const credentials = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);

  await updateProfile(credentials.user, {
    displayName: input.displayName.trim(),
  });

  await ensureAdminProfile({
    uid: credentials.user.uid,
    email: input.email,
    displayName: input.displayName,
    isDemo: false,
  });

  return {
    authMode: 'firebase' as const,
    user: credentials.user,
  };
};

export const signOutAdmin = async () => {
  if (!auth) {
    return;
  }

  await signOut(auth);
};

export const getAdmins = async (): Promise<AdminProfile[]> => {
  if (!firebaseConfigStatus.isConfigured || !db) {
    return [
      {
        id: 'demo-admin',
        uid: 'demo-admin',
        email: demoAdminCredentials.email,
        displayName: demoAdminCredentials.displayName,
        role: 'admin',
        isDemo: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  try {
    const snapshot = await getDocs(query(collection(db, 'admins'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map((entry) => {
      const data = entry.data();
      return {
        id: entry.id,
        uid: String(data.uid ?? entry.id),
        email: String(data.email ?? ''),
        displayName: String(data.displayName ?? 'Admin'),
        role: String(data.role ?? 'admin'),
        isDemo: Boolean(data.isDemo ?? false),
        createdAt: new Date().toISOString(),
      };
    });
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : '';

    // Demo login intentionally skips Firebase Auth, so Firestore reads can be denied.
    if (code === 'permission-denied' || code === 'firestore/permission-denied') {
      return [
        {
          id: 'demo-admin',
          uid: 'demo-admin',
          email: demoAdminCredentials.email,
          displayName: demoAdminCredentials.displayName,
          role: 'admin',
          isDemo: true,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    throw error;
  }
};
