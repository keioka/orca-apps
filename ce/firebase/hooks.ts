// import {
//   browserLocalPersistence,
//   GoogleAuthProvider,
//   onAuthStateChanged,
//   setPersistence,
//   signInWithCredential,
// } from "firebase/auth"
import { useEffect, useMemo, useState } from "react"
// import { app, auth } from "firebase"
import { sendToBackground } from "@plasmohq/messaging"

// setPersistence(auth, browserLocalPersistence)

export const useFirebase = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User>(null)

  const onLogout = async () => {
    // setIsLoading(true)
    // if (user) {
    //   await auth.signOut()
    // }
  }

  const onLogin = async () => {
    // console.log({ isLoading, user })
    // if (isLoading) return
    // if (user) return

    // console.log("onLogin")
    // setIsLoading(true)

    // try {
    //   const { token, error } = await sendToBackground({
    //     name: "login",
    //   })

    //   console.log({ token, error })

    //   if (error) {
    //     return
    //   }

    //   if (!token) {
    //     return
    //   }

    //   const credential = GoogleAuthProvider.credential(null, token)
    //   console.log({ credential })
    //   await signInWithCredential(auth, credential)
    // } catch (e) {
    //   console.error("Could not log in. ", e)
    // }
  }

  useEffect(() => {
    // console.log("useEffect")
    // onAuthStateChanged(auth, (user) => {
    //   console.log("orca", { user })
    //   setIsLoading(false)
    //   setUser(user)
    // })
  }, [])

  return {
    isLoading,
    user,
    // firestore,
    onLogin,
    onLogout
  }
}