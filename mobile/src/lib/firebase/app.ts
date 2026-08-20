import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  signInAnonymously,
  type Auth,
  type Persistence,
} from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';

import { firebaseConfig } from '@/lib/firebase/config';

const getReactNativePersistence = (
  FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
  }
).getReactNativePersistence;

let nativeAuth: Auth | undefined;

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  if (Platform.OS === 'web') {
    return getAuth(getFirebaseApp());
  }
  if (nativeAuth) return nativeAuth;

  const app = getFirebaseApp();
  try {
    nativeAuth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    nativeAuth = getAuth(app);
  }
  return nativeAuth;
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
    // Anonymous Auth may be off; continue so Storage can still accept the file.
  }
}
