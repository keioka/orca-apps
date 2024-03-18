import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Drawer,
  Stack,
  TextField
} from "@mui/material"
import type { PlasmoCSConfig } from "plasmo"
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
  useNavigate,
} from "react-router-dom";
import { NoteScreen } from "../tabScreens/NoteScreen"
import { Provider } from "react-redux";
import { persistor, store } from '../redux/store';
import { getTheme } from "../theme";
import { ThemeProvider } from '@mui/material/styles';
import { PersistGate } from "@plasmohq/redux-persist/integration/react"
import { useFirebase } from "~firebase/hooks";
import { useAppDispatch } from "~redux/hooks";
import mixpanel from "mixpanel-browser";
import { fetchDeviceId } from '~/utils/fetchDeviceId'
import { useAppSelector } from "~redux/hooks";
import { fetchCurrentUser, setMpTrackingId } from '~redux/features/auth';

import "../font.css"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/"],
}

const WIDTH_SIDEBAR = 280
const ROOT_PATH = "/tabs/index.html"

function fetchFavicon(url) {
  // Try fetching favicon.ico from the root domain first
  try {
    const domain = new URL(url).origin;
    const size = 24
    // const faviconUrl = `${domain}/favicon.ico`;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
    return faviconUrl
  } catch (err) {
    return ""
  }
}

function Main() {
  const { authCheck, isCheckingAuth, onLogout, user } = useFirebase()
  const currentUser = useAppSelector((state) => state.auth.currentUser)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!user) {
      authCheck()
    }
  }, [])

  useEffect(() => {
    setMpTrackingIdToUser()
  }, [currentUser])

  async function setMpTrackingIdToUser() {
    const deviceId = await fetchDeviceId()
    if (typeof deviceId !== 'string') {
      console.error("deviceId is not string", deviceId)
      return
    }

    if (currentUser && (!currentUser.mpTrackingId || currentUser.mpTrackingId !== deviceId)) {
      dispatch(setMpTrackingId({ mpTrackingId: deviceId }))
    }
  }

  useEffect(() => {

    console.log("=====================================")
    mixpanel.init(process.env.PLASMO_PUBLIC_MIXPANEL_TOKEN, { track_pageview: false });

    async function setMixpanelUUID() {
      const uuid = await fetchDeviceId()
      console.log({ uuid })
      mixpanel.identify(uuid)
    }

    setMixpanelUUID()

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("================ onMessage ====================")
      console.log(request)
      if (request.name === "logout") {
        console.log("logout")
        onLogout()
        dispatch({ type: "global/RESET_STATE" })
      }

      if (request.name === "login") {
        authCheck()
      }
    })
  }, [])

  if (isCheckingAuth) {
    return <Box>
      <Typography>
        Loading...
      </Typography>
    </Box>
  }

  return (
    <Routes>
      <Route path={`${ROOT_PATH}`} element={<Layout />}>
        <Route index element={<NoteScreen />} />
      </Route>
    </Routes>
  )
}



function Layout() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 8
      }}
    >
      <Outlet />
    </Box >
  );
}

enum Category {
  BUSINESS = "business",
  TECH = "tech",
  MARKETING = "marketing",
  MACHINE_LEARNING = "machine_learning",
  VENTURE_CAPITAL = "venture_capital",
  SCIENCE = "science",
  WORLD_NEWS = "world_news"
}


function App() {
  const lang = chrome.i18n.getUILanguage()
  const langCode = lang.split("-")[0]
  const theme = getTheme(langCode)

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <BrowserRouter>
              <Main />
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </React.StrictMode>
  )
}

export default App