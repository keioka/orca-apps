import * as firebaseApp from 'firebase/app';
import { initializeAuth } from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getReactNativePersistence } from "firebase/auth/react-native"

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export let firebase: any = null

function init() {
  try {
    if (!firebaseApp) {
      console.error("Firebase error: firebaseApp is null")
    }

    firebase = firebaseApp.initializeApp(firebaseConfig);
    initializeAuth(firebase, {
      persistence: getReactNativePersistence(AsyncStorage)
    });

  } catch (error) {
    console.error(error)
  }
}

init()

