import { useState } from "react"
import { Box, Button, Typography, TextField, Stack, Card } from "@mui/material"
import { sendToBackground } from "@plasmohq/messaging"
import { ThemeProvider } from '@mui/material/styles';
import { useFirebase } from "./firebase/hooks"
// import { CheckoutForm } from "./components/CheckoutForm"
import { getTheme } from "./theme";

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/"],
  css: ["font.css"]
}
function RootPopup() {
  const lang = chrome.i18n.getUILanguage()
  const langCode = lang.split("-")[0]
  const theme = getTheme(langCode)
  return (
    <ThemeProvider theme={theme}>
      <IndexPopup />
    </ThemeProvider>
  )
}

function IndexPopup() {
  const { onLogin, onLogout, user, isLoading } = useFirebase()
  return (
    <Box
      sx={{
        width: 320,
        display: "flex",
        flexDirection: "column",
      }}
    >

      <Stack spacing={1} sx={{ width: "100%" }}>
        <Typography variant="h6" component="h6">
          {new Date().toLocaleDateString()}
        </Typography>
        {isLoading &&
          <Typography variant="body2" component="span">
            Loading
          </Typography>
        }

        {!isLoading && user && <Typography variant="body2" component="span">
          {chrome.i18n.getMessage("popup_greeting_start")}{user.displayName}{chrome.i18n.getMessage("popup_greeting_end")}
        </Typography>}
        {/* <Card>
          <Stack spacing={1} sx={{ width: "100%" }}>
            <Typography variant="h6" component="h6">
              Today
            </Typography>
          </Stack>
        </Card> */}
        {!isLoading && !user && <Button
          variant="contained"
          onClick={onLogin}
          sx={{ color: "#fff" }}
        >
          {chrome.i18n.getMessage("button_login")}
        </Button>}

        {!isLoading && user && <Button
          variant="contained"
          onClick={() => {
            chrome.tabs.create({
              url: "./tabs/index.html"
            })
          }}
          sx={{ color: "#fff" }}
        >
          {chrome.i18n.getMessage("popup_button_open_note")}
        </Button>}
        {/* <Button variant="contained" onClick={onLogin}>
          Login
        </Button> */}
        {/* <CheckoutForm /> */}
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
        {!isLoading && user &&
          <Button
            variant="outlined"
            sx={(theme) => ({
              color: theme.palette.primary.main
            })}
            onClick={onLogout}
          >
            {chrome.i18n.getMessage("button_logout")}
          </Button>
        }
      </Stack>
    </Box>
  )
}

export default RootPopup
