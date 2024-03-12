import { defineConfig } from "cypress";
import admin from 'firebase-admin';
import { plugin as cypressFirebasePlugin } from 'cypress-firebase';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';
import { attachCustomCommands } from 'cypress-firebase';

const fbConfig = {
  // Your config from Firebase Console
  // apiKey: process.env.PLASMO_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  // authDomain: process.env.PLASMO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // projectId: process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.PLASMO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.PLASMO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  // appId: process.env.PLASMO_PUBLIC_FIREBASE_APP_ID,
  apiKey: "REDACTED_SECRET",
  authDomain: "REDACTED_FIREBASE_API_KEY",
  projectId: "your-projects-name-1234",
  storageBucket: "your-projects-name-1234.appspot.com",
  messagingSenderId: "123456789",
  appId: "REDACTED_SECRET",
  measurementId: "G-1234567"
};

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {

      const serviceAccount = {
        "type": "service_account",
        "project_id": "orca-398204",
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

      on('before:browser:launch', (browser, launchOptions) => {
        // supply the absolute path to an unpacked extension's folder
        // NOTE: extensions cannot be loaded in headless Chrome
        launchOptions.extensions.push('/Users/keioka/Dev/orca/ce/build/chrome-mv3-dev')
        return launchOptions
      })

      return cypressFirebasePlugin(on, config, admin, {
        // Here is where you can pass special options.
        // If you have not set the GCLOUD_PROJECT environment variable, give the projectId here, like so:
        //    projectId: 'some-project',
        // if your databaseURL is not just your projectId plus ".firebaseio.com", then you _must_ give it here, like so:
        //    databaseURL: 'some-project-default-rtdb.europe-west1.firebasedatabase.app',
      });
    },
  },
});
