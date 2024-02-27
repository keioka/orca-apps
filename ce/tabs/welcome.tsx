import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Drawer,
  Stack,
  Grid,
  TextField
} from "@mui/material"
import type { PlasmoCSConfig } from "plasmo"
import {
  BrowserRouter,
} from "react-router-dom";
import { getTheme } from "../theme";
import { ThemeProvider } from '@mui/material/styles';

import "../font.css"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/"],
}

function Main() {
  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4">
          Orcaをインストールしていただきありがとうございます！
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={4}>
              <Stack spacing={2}>
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  background: "#f4f4f4",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              >
                <Stack sx={{ width: "100%", padding: 2, display: "flex", alignItems: "center" }} spacing={1}>
                  <Typography sx={{ fontSize: 16 }}>
                    {chrome.i18n.getMessage("popup_title_feedback")}
                  </Typography>
                  <Typography sx={{ fontSize: 12 }}>
                    {chrome.i18n.getMessage("popup_subtitle_feedback")}
                  </Typography>
                  <Box sx={{ width: 120 }}>
                    <img src="https://qr-official.line.me/gs/M_048rhxeo_GW.png?oat_content=qr" width="120" />
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSeJfIDvI5Vc1QYGljLKi4I8b0mPQqfBtnjImp7PalS1C-U3uw/viewform?embedded=true" width="640" height="1569" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
          </Grid>
        </Grid>

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
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  )
}

export default App