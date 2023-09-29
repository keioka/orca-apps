import { useState } from "react"
import { Box, Button, Typography, TextField, Stack, Card } from "@mui/material"
import { sendToBackground } from "@plasmohq/messaging"
import { useFirebase } from "./firebase/hooks"
// import { CheckoutForm } from "./components/CheckoutForm"

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
        <Card>
          <Stack spacing={1} sx={{ width: "100%" }}>
            <Typography variant="h6" component="h6">
              Today
            </Typography>
          </Stack>
        </Card>
        <Button variant="contained" onClick={() => {
          chrome.tabs.create({
            url: "./tabs/index.html"
          })
        }}>
          Open News Feed
        </Button>
        {/* <Button variant="contained" onClick={onLogin}>
          Login
        </Button> */}
        {/* <CheckoutForm /> */}
      </Stack>
    </Box>
  )
}

export default IndexPopup
