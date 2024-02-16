import type { PlasmoMessaging } from "@plasmohq/messaging"
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithCredential,
} from "firebase/auth"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "REDACTED_FIREBASE_API_KEY",
  authDomain: "orca-398204.firebaseapp.com",
  projectId: "orca-398204",
  storageBucket: "orca-398204.appspot.com",
  messagingSenderId: "119738105912",
  appId: "1:119738105912:web:bcd2b83f14e575e57b66cd"
};

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

setPersistence(auth, browserLocalPersistence)

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("login message received")
  chrome.identity.getAuthToken({ interactive: false }, async function (token) {
    if (chrome.runtime.lastError || !token) {
      console.error(chrome.runtime.lastError.message)
      res.send({ error: chrome.runtime.lastError })
      return
    }
    if (token) {
      res.send({ token })
    }
  })
}

export default handler