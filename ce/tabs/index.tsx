import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Drawer,
  Stack,
  TextField
} from "@mui/material"
import type { PlasmoCSConfig } from "plasmo"
import { ExpandableMenu } from "~components/ExpandableMenu"
import Parser from 'rss-parser';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
  useNavigate,
} from "react-router-dom";
import { ListVocab } from "~components/ListVocab";
import { SlFeed } from "react-icons/sl"
import { BsGraphUpArrow } from "react-icons/bs"
import vcRSS from "~data/rss/vc.json"
import businessRSS from "~data/rss/business.json"
import { CardCategory } from "~components/CardCategory"
import { CardNewsFeed } from "~components/CardNewsFeed"
import businessImage from "data-base64:~assets/images/business.jpg"
import vcImage from "data-base64:~assets/images/vc.jpg"
import financeImage from "data-base64:~assets/images/finance.jpg"
import worldNewsImage from "data-base64:~assets/images/world_news.jpg"
import scienceImage from "data-base64:~assets/images/science.jpg"

import { BsSearch } from "react-icons/bs"
import { NoteScreen } from "../tabScreens/NoteScreen"
import { Provider } from "react-redux";
import { persistor, store } from '../redux/store';
import { getTheme } from "../theme";
import { ThemeProvider } from '@mui/material/styles';
import { PiNotebookDuotone } from "react-icons/pi"
import { useAppDispatch, useAppSelector } from "~redux/hooks";
import { fetchPublishers } from "~redux/features/publisher"
import { PersistGate } from "@plasmohq/redux-persist/integration/react"
import { useFirebase } from "~firebase/hooks";

import "../font.css"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/"],
  css: ["font.css"]
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
  const { authCheck, onLogout, user } = useFirebase()

  useEffect(() => {
    if (!user) {
      authCheck()
    }
  }, [])

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("================ onMessage ====================")
      console.log(request)
      if (request.name === "logout") {
        console.log("logout")
        onLogout()
      }

      if (request.name === "login") {
        authCheck()
      }
    })
  }, [])

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