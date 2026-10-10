import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, type Auth, type User } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth;
  const currentUser = currentAuth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let isFirebaseConfigured = false;

// Dynamically check if firebase-applet-config.json is provisioned without failing build if absent
const configModules = import.meta.glob<Record<string, unknown>>(
  '/firebase-applet-config.json',
  { eager: true }
);

interface FirebaseAppletConfig {
  apiKey?: string;
  projectId?: string;
  authDomain?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
  [key: string]: unknown;
}

const rawConfig = (configModules['/firebase-applet-config.json'] as { default?: FirebaseAppletConfig } | undefined)?.default
  || (configModules['/firebase-applet-config.json'] as FirebaseAppletConfig | undefined)
  || null;

if (rawConfig && rawConfig.apiKey && rawConfig.projectId) {
  if (!getApps().length) {
    app = initializeApp(rawConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = rawConfig.firestoreDatabaseId ? getFirestore(app, rawConfig.firestoreDatabaseId) : getFirestore(app);
  isFirebaseConfigured = true;
} else {
  console.info('Firebase project awaiting credentials. Local persistent store activated.');
}

export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<User | null> {
  if (!auth) {
    throw new Error('Подключение к Google Auth в процессе настройки. Ваши данные сохраняются локально.');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign-in error:', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  await fbSignOut(auth);
}
