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

export const useFirebase = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [user, setUser] = useState(null)
  const [session, setSession] = useState<{
    accessToken: string,
    uid: string
  }>(null)

  const onLogout = async () => {
    setIsLoading(true)
    await auth.signOut()
    const { success } = await sendToBackground({
      name: "logout",
    })

  }

  const authCheck = async () => {
    setIsCheckingAuth(true)
    console.log("authCheck")
    try {
      const { token } = await sendToBackground({
        name: "authCheck",
      })

      if (!token) {
        console.warn("No token found")
        throw new Error("No token found")
      }

      const credential = GoogleAuthProvider.credential(null, token)
      await signInWithCredential(auth, credential)
      setIsCheckingAuth(false)
    } catch (e) {
      console.error("Could not log in. ", e)
      setIsCheckingAuth(false)
    }
  }

  const onLoginBackground = async () => {
    if (isLoading) return
    // if (user) return

    console.log("onLogin")
    setIsLoading(true)

    try {
      const { token, error } = await sendToBackground({
        name: "login",
      })

      if (error) {
        console.error(error)
        return
      }

      if (!token) {
        console.error("No token found")
        return
      }

      const credential = GoogleAuthProvider.credential(null, token)

      const userCred = await signInWithCredential(auth, credential)
      console.log("===============>>", { userCred })
      setIsLoading(false)
      return userCred.user
    } catch (e) {
      console.error("Could not log in. ", e)
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

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
        const credential = GoogleAuthProvider.credential(null, token)

        try {
          await signInWithCredential(auth, credential)
          setSession({
            accessToken: token,
            uid: user.uid
          })
        } catch (e) {
          console.error("Could not log in. ", e)
        }
      }
    })
  }

  useEffect(() => {
    setIsLoading(true)

    onAuthStateChanged(auth, async (user) => {
      // await setPersistence(auth, browserLocalPersistence)

      if (!user) {
        setIsLoading(false)
        setUser(null)
        setSession(null)
        return
      }
      setIsLoading(false)
      setUser(user)
      setSession({
        accessToken: user.accessToken,
        uid: user.uid
      })
    })
  }, [])

  return {
    isLoading,
    isCheckingAuth,
    user,
    session,
    authCheck,
    onLogin,
    onLoginBackground,
    onLogout
  }
}