import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  TextField,
  Chip
} from "@mui/material"
import { Card, CardContent, CardMedia } from "@mui/material";
import moment from "moment";
import type { PlasmoCSConfig } from "plasmo"
import {
  BrowserRouter,
} from "react-router-dom";
import { getTheme } from "../theme";
import { ThemeProvider } from '@mui/material/styles';
import { Setting } from "~/components/Setting";
import "../font.css"
import mixpanel from "mixpanel-browser";
import { fetchDeviceId } from '~/utils/fetchDeviceId'

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/"],
}

function Main() {

  useEffect(() => {
    console.log("=====================================")
    mixpanel.init(process.env.PLASMO_PUBLIC_MIXPANEL_TOKEN, { track_pageview: false });
    async function setMixpanelUUID() {
      const uuid = await fetchDeviceId()
      mixpanel.identify(uuid)
    }

    setMixpanelUUID()
  }, [])

  return (
    <Box sx={{ p: 12 }}>
      <Stack spacing={4}>
        <Typography variant="h4">
          設定
        </Typography>
        <Setting />
      </Stack>
    </Box >
  )
}

function App() {
  const lang = chrome.i18n.getUILanguage()
  const langCode = lang.split("-")[0]
  const theme = getTheme(langCode)

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  )
}

export default App