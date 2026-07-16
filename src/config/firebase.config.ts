import { initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as path from 'path';

let firebaseApp: App;
let firestore: Firestore;
let auth: Auth;

export function initializeFirebase(): App {
  if (firebaseApp) {
    return firebaseApp;
  }

  const serviceAccountPath = path.resolve(
    process.cwd(),
    'serviceAccountKey.json',
  );
  const serviceAccount = require(serviceAccountPath);

  firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  });

  firestore = getFirestore(firebaseApp);
  firestore.settings({ ignoreUndefinedProperties: true });
  auth = getAuth(firebaseApp);

  return firebaseApp;
}

export function getFirestoreInstance(): Firestore {
  if (!firestore) {
    initializeFirebase();
  }
  return firestore;
}

export function getAuthInstance(): Auth {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
}
