import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithCredential,
} from "firebase/auth"
import { useEffect, useMemo, useState } from "react"
import { app, auth } from "firebase"
import { sendToBackground } from "@plasmohq/messaging"

setPersistence(auth, browserLocalPersistence)

export const useFirebase = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User>(null)

  const onLogout = async () => {
    setIsLoading(true)
    if (user) {
      await auth.signOut()
    }
  }

  // const onLogin = async () => {
  //   console.log({ isLoading, user })
  //   if (isLoading) return
  //   if (user) return

  //   console.log("onLogin")
  //   setIsLoading(true)

  //   try {
  //     const { token, error } = await sendToBackground({
  //       name: "login",
  //     })

  //     console.log({ token, error })

  //     if (error) {
  //       return
  //     }

  //     if (!token) {
  //       return
  //     }

  //     const credential = GoogleAuthProvider.credential(null, token)
  //     console.log({ credential })
  //     await signInWithCredential(auth, credential)
  //   } catch (e) {
  //     console.error("Could not log in. ", e)
  //   }
  // }
  const onLogin = () => {
    console.log("Login")
    setIsLoading(true)
    chrome.identity.getAuthToken({ interactive: true }, async function (token) {
      if (chrome.runtime.lastError || !token) {
        console.error(chrome.runtime.lastError.message)
        setIsLoading(false)
        return
      }
      if (token) {
        console.log({ token })
        const credential = GoogleAuthProvider.credential(null, token)
        console.log({ credential })

        try {
          await signInWithCredential(auth, credential)
        } catch (e) {
          console.error("Could not log in. ", e)
        }
      }
    })
  }

  useEffect(() => {
    setIsLoading(true)
    console.log("onAuthStateChanged")
    onAuthStateChanged(auth, (user) => {
      console.log("orca", { user })
      setIsLoading(false)
      setUser(user)
    })
  }, [])

  return {
    isLoading,
    user,
    onLogin,
    onLogout
  }
}