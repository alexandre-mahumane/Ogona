export const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    'AIzaSyB90XS9PmozAWiTXLlemgaR_d3MPJyR_ts',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'fidli-app.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'fidli-app',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'fidli-app.appspot.com',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '785520883796',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    '1:785520883796:web:dc803604e7c8e9d089d5c1',
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    process.env.EXPO_PUBLIC_MEASUREMENT_ID ||
    'G-TK661R2ZB6',
};
