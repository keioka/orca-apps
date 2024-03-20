import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Drawer,
  Stack,
  Grid,
  TextField,
  Alert
} from "@mui/material"
import type { PlasmoCSConfig } from "plasmo"
import {
  BrowserRouter,
} from "react-router-dom";
import { getTheme } from "../theme";
import { ThemeProvider } from '@mui/material/styles';
import { Setting } from "~/components/Setting";
import mixpanel from "mixpanel-browser";
import { fetchDeviceId } from '~/utils/fetchDeviceId'
import { useFirebase } from "~firebase/hooks"
import { ButtonGoogleAuth } from "~components/ButtonGoogleAuth"
import { store } from '~redux/store';
import { signup, clearError } from "~/redux/features/auth";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "~redux/hooks";

import "../font.css"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/"],
}

function Main() {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { session: sessionFB, onLoginBackground, onLogout } = useFirebase()
  const errorSignupMessage = useAppSelector((state) => state.auth.errorSignupMessage)
  const currentUser = useAppSelector(state => { return state.auth.currentUser })
  const dispatch = useAppDispatch()

  useEffect(() => {
    console.log("=====================================")
    mixpanel.init(process.env.PLASMO_PUBLIC_MIXPANEL_TOKEN, { track_pageview: false });

    async function setMixpanelUUID() {
      const uuid = await fetchDeviceId()
      console.log({ uuid })
      mixpanel.identify(uuid)
    }

    setMixpanelUUID()
    dispatch(clearError())
  }, [])

  const handleClickSubmit = () => {
    setIsSubmit(true)
  }

  async function handleSignup() {
    mixpanel.track("ACT:signup")
    const userCred = await onLoginBackground()
    dispatch(signup({ accessToken: userCred.accessToken, uid: userCred.uid }))
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={4}>

        <Stack spacing={4}>
          {!isSubmit &&
            <>
              <Typography variant="h6">
                Orcaをインストールしていただきありがとうございます！
              </Typography>
              <Typography variant="h5">
                興味のあるカテゴリーの設定や学習の通知設定をして、学習を習慣化していきましょう！
              </Typography>
              <Setting onSubmit={handleClickSubmit} />
            </>
          }
          {isSubmit &&
            <Stack spacing={2}>
              <Stack sx={{ background: "#f4f4f4", padding: 4, borderRadius: 2 }} spacing={2}>
                <Typography variant="h6">
                  設定完了されました！サインアップして設定を保存しましょう！
                </Typography>
                {errorSignupMessage && <Alert severity="error">{errorSignupMessage}</Alert>}
                {currentUser && <Alert severity="success">サインアップ完了しました！</Alert>}
                {!currentUser && <ButtonGoogleAuth onClick={handleSignup} isSignup />}
              </Stack>

              <Stack sx={{ background: "#f4f4f4", padding: 4, borderRadius: 2 }} spacing={2}>
                <Typography variant="h5">
                  はじめにこちらの使い方説明動画をご覧ください。
                </Typography>
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/WhdaWtxW8eg?si=no7hlmI_rr4gL_7_"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen>
                </iframe>
              </Stack>
            </Stack>
          }
        </Stack>
      </Stack>
    </Box>
  )
}

function App() {
  const lang = chrome.i18n.getUILanguage()
  const langCode = lang.split("-")[0]
  const theme = getTheme(langCode)

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <BrowserRouter>
            <Main />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>
    </React.StrictMode>
  )
}

export default App