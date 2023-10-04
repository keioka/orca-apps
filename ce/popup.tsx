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
  const { onLogin, user } = useFirebase()
  return (
    <Box
      sx={{
        width: 480,
        display: "flex",
        flexDirection: "column",
      }}
    >

      <Stack spacing={1} sx={{ width: "100%" }}>
        <Typography variant="h6" component="h6">
          {new Date().toLocaleDateString()}
        </Typography>
        {/* <Card>
          <Stack spacing={1} sx={{ width: "100%" }}>
            <Typography variant="h6" component="h6">
              Today
            </Typography>
          </Stack>
        </Card> */}
        <Button
          variant="contained"
          onClick={() => {
            chrome.tabs.create({
              url: "./tabs/index.html"
            })
          }}
          sx={{ color: "#fff" }}
        >
          {chrome.i18n.getMessage("popup_button_open_note")}
        </Button>
        {/* <Button variant="contained" onClick={onLogin}>
          Login
        </Button> */}
        {/* <CheckoutForm /> */}
      </Stack>
    </Box>
  )
}

export default RootPopup
