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
import { removeAll, store } from "~/redux/store"

const storage = new Storage()
const reduxStorage = new Storage({
  "area": "session"
})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("logout message received")
  try {
    await reduxStorage.setItem("persist:orca-storage", null)
    await storage.setItem("firebase:token", null)
    const data = await reduxStorage.getAll()
    const data2 = await storage.getAll()

    await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "logout" }, function (response) {
        console.log(response)
        resolve(response)
      })
    })

    res.send({ success: true, data, data2 })
  } catch (e) {
    console.error(e)
    res.send({ error: e })
    return
  }
}

export default handler