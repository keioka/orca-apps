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
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

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
      auth.setPersistence(browserLocalPersistence);
      res.send({ error: chrome.runtime.lastError })
      return
    }
    if (token) {
      await storage.set("firebase:token", token)
      res.send({ token })
      const data = await storage.get("firebase:token") // "value"
      // console.log(data)
      // await storage.set("capt", { color: "red" })
      // const data2 = await storage.get("capt") // { color: "red" }
    }

    chrome.runtime.sendMessage({ type: "login", token }, function (response) {
      console.log(response)
    });

  })


  // chrome.identity.getAuthToken({ 'interactive': true }, async (token) => {
  //   const credential = GoogleAuthProvider.credential(null, token);
  //   try {
  //     const { user } = await signInWithCredential(auth, credential)
  //     console.log(`the user object is here! - ${user}`)
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });
}

export default handler