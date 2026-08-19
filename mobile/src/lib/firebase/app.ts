import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

import { firebaseConfig } from '@/lib/firebase/config';

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

/** Storage rules often require a signed-in user; anonymous is enough for uploads. */
export async function ensureFirebaseUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return;
  try {
    await signInAnonymously(auth);
  } catch {
    // Continue unauthenticated if Anonymous Auth is disabled.
  }
}
