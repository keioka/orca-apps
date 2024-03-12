// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';
import { attachCustomCommands } from 'cypress-firebase';
import admin from 'firebase-admin';

const fbConfig = {
  // Your config from Firebase Console
  // apiKey: process.env.PLASMO_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  // authDomain: process.env.PLASMO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // projectId: process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.PLASMO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.PLASMO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  // appId: process.env.PLASMO_PUBLIC_FIREBASE_APP_ID,
  apiKey: "REDACTED_FIREBASE_API_KEY",
  authDomain: "REDACTED_FIREBASE_API_KEY",
  projectId: "your-projects-name-1234",
  storageBucket: "your-projects-name-1234.appspot.com",
  messagingSenderId: "123456789",
  appId: "REDACTED_SECRET",
  measurementId: "G-1234567"
};



// FIREBASE_PROJECT_ID=orca-398204
// FIREBASE_PRIVATE_KEY_ID=c60e4119f37d0fe38b60e6671c73eb18070a9683
// FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nREDACTED_PRIVATE_KEY-----END PRIVATE KEY-----\n"
// FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fqs9d@orca-398204.iam.gserviceaccount.com"
// FIREBASE_CLIENT_ID=106126659807302477322
// FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
// FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
// FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
// FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fqs9d%40orca-398204.iam.gserviceaccount.com
// FIREBASE_UNIVERSE_DOMAIN=googleapis.com

const serviceAccount = {
  "type": "service_account",
  "project_id": "orca-398204",
  "apiKey": "REDACTED_FIREBASE_API_KEY",
  "private_key_id": "c60e4119f37d0fe38b60e6671c73eb18070a9683",
  "private_key": "-----BEGIN PRIVATE KEY-----\nREDACTED_PRIVATE_KEY-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fqs9d@orca-398204.iam.gserviceaccount.com",
  "client_id": "106126659807302477322",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fqs9d%40orca-398204.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

// const app = admin.initializeApp({
//   // Add your Firebase Admin SDK configuration here
//   credential: admin.credential.cert(serviceAccount),
// });

firebase.initializeApp({
  // Add your Firebase Admin SDK configuration here
  credential: admin.credential.cert(serviceAccount),
});

attachCustomCommands({ Cypress, cy, firebase });


// indexedDB.deleteDatabase('firebaseLocalStorageDb');
