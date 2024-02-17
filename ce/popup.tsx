import { useEffect, useState } from "react"
import { Alert, Box, Snackbar, Button, Typography, TextField, Stack, Card, FormControlLabel, Switch } from "@mui/material"
import { sendToBackground } from "@plasmohq/messaging"
import { ThemeProvider } from '@mui/material/styles';
import { useFirebase } from "./firebase/hooks"
// import { CheckoutForm } from "./components/CheckoutForm"
import { getTheme } from "./theme";
import { CheckoutForm } from "~components/CheckoutForm"
import { Provider } from "react-redux";
import { PersistGate } from "@plasmohq/redux-persist/integration/react"
import { persistor, store } from './redux/store';
import { MdWorkspacePremium } from "react-icons/md"
import { fetchPayments, initState as initStatePayment } from "~redux/features/payment";
import { toggleDisable } from "~redux/features/ui";
import { useAppDispatch, useAppSelector } from "~redux/hooks";
// https://stripe.com/docs/testing?testing-method=card-numbers#cards
import { login, signupGoogle, checkAuthStatus, clearError, logout } from "~redux/features/auth";
import "./font.css"

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
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <IndexPopup />
        </PersistGate>
      </Provider>
    </ThemeProvider>
  )
}

function IndexPopup() {
  const { onLogin, onLogout, user: currentUserFB, session } = useFirebase()
  const payment = useAppSelector(state => state.payment)
  const uiDisabled = useAppSelector(state => { return state.ui.disabled })
  const { currentUser, loadingCurrentUser, error } = useAppSelector(state => state.auth)

  const dispatch = useAppDispatch()

  const { isValidSubscription, loadingCurrentUser: loadingCurrentUserSubsc, status } = payment

  console.log({ currentUserFB, currentUser })
  // useEffect(() => {
  //   dispatch(checkAuthStatus())
  // }, [])

  useEffect(() => {
    if (currentUser) {
      console.log("dispatch fetch payments")
      dispatch(fetchPayments({ email: currentUser.email }))
    }
  }, [currentUser])

  function handleToggleDisable() {
    dispatch(toggleDisable())
  }

  function handleSignout() {
    console.log("dispatch initStatePayment")
    dispatch(logout())
    onLogout()
    dispatch(initStatePayment())
  }

  function handleSignup() {
    dispatch(signupGoogle())
  }

  function handleSignin() {
    dispatch(login())
  }

  function handleCloseError() {
    dispatch(clearError())
  }

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 320,
        maxWidth: 640,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >

      <Stack spacing={1} sx={{
        width: "100%",
        minWidth: 320,
        maxWidth: 640,
      }}>

        <Stack spacing={1} sx={{ width: "100%", borderBottom: "1px solid #f4f4f4", paddingBottom: 2 }}>

          <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" component="h6">
              {new Date().toLocaleDateString()}
            </Typography>
            <FormControlLabel
              sx={{
                fontSize: 12,
                fontWeight: 600
              }}
              control={
                <Switch
                  size="small"
                  checked={uiDisabled}
                  onChange={handleToggleDisable}
                />
              }
              label={chrome.i18n.getMessage("toggle_disable")}
            />

          </Stack>
          {loadingCurrentUser &&
            <Typography variant="body2" component="span">
              Loading
            </Typography>
          }

          {
            !loadingCurrentUser && currentUser && (
              <Typography variant="body2" component="span">
                {chrome.i18n.getMessage("popup_greeting_start")}{currentUser.username}{chrome.i18n.getMessage("popup_greeting_end")}
              </Typography>
            )
          }

        </Stack>
        {/* <Card>
          <Stack spacing={1} sx={{ width: "100%" }}>
            <Typography variant="h6" component="h6">
              Today
            </Typography>
          </Stack>
        </Card> */}
        {/* {!loadingCurrentUser && !currentUser && <ButtonGoogleAuth onClick={handleSignin} />} */}
        {/* {!loadingCurrentUser && !currentUser && <ButtonGoogleAuth onClick={handleSignup} />} */}

        <Snackbar
          open={error}
          autoHideDuration={3000}
          onClose={handleCloseError}
          sx={{
            position: "relative"
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
        >
          <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
        </Snackbar>


        {/* {!loadingCurrentUser && currentUser && ( */}
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
        {/* )} */}

        {!loadingCurrentUser && currentUser && !loadingCurrentUserSubsc && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              background: "#f4f4f4",
              width: "100%",
              boxSizing: "border-box"
            }}
            p={2}
          >
            {!isValidSubscription && (
              <a href={`${process.env.PLASMO_PUBLIC_STRIPE_PAYMENT_LINK}?prefilled_email=${currentUser.email}&client_reference_id=${currentUser.uid}`} target="_blank" style={{ width: "100%" }}>
                <Button
                  color="primary"
                  variant="contained"
                  sx={{
                    color: "#fff",
                    width: "100%"
                  }}
                >
                  <MdWorkspacePremium size={18} style={{ marginRight: 4 }} />
                  {chrome.i18n.getMessage("button_payment_link")}
                </Button>
              </a>
            )}
            {isValidSubscription &&
              <Stack spacing={1} sx={{ width: "100%" }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#a4a4a4" }}>
                  {status === "trialing" && chrome.i18n.getMessage("popup_payment_status_trialing")}
                </Typography>
                <a href={process.env.PLASMO_PUBLIC_STRIPE_BILLING_LINK} target="_blank" style={{ width: "100%" }}>
                  <Button
                    color="primary"
                    variant="outlined"
                    sx={{
                      width: "100%",
                      background: "#fff",
                    }}
                  >
                    <MdWorkspacePremium size={18} style={{ marginRight: 4 }} />
                    {chrome.i18n.getMessage("button_payment_manage_link")}
                  </Button>
                </a>
              </Stack>
            }
          </Box>
        )}
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
        {!loadingCurrentUser && currentUser &&
          <Button
            variant="outlined"
            sx={(theme) => ({
              color: theme.palette.primary.main
            })}
            onClick={handleSignout}
          >
            {chrome.i18n.getMessage("button_logout")}
          </Button>
        }
      </Stack>
    </Box >
  )
}

export default RootPopup
