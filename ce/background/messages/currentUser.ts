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

import { app, auth } from "~/firebase"

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