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
  apiKey: process.env.PLASMO_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.PLASMO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PLASMO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PLASMO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PLASMO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.PLASMO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {

      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Stored with literal \n escapes in the environment.
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
