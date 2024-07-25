import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { Drawer } from "@mui/material"
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { Inject } from "components/Inject"
import { InjectVocab } from "components/InjectVocab"
import cssText from "data-text:~/global.css"
import mixpanel from "mixpanel-browser"
import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoMountShadowHost,
  PlasmoRender
} from "plasmo"
import { useEffect, useMemo } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Provider } from "react-redux"

import { PersistGate } from "@plasmohq/redux-persist/integration/react"

import { persistor, store } from "~/redux/store"
import { getTheme } from "~/theme"
import { fetchDeviceId } from "~/utils/fetchDeviceId"
import { LocaleProvider } from "~hooks/locale"
import { useAppDispatch } from "~redux/hooks"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/"],
  css: ["font.css"]
}

const styleElement = document.createElement("style")
styleElement.textContent = styleElement + "" + cssText

const styleCache = createCache({
  key: "orca-ui",
  prepend: false,
  container: styleElement
})

export const getStyle = () => {
  return styleElement
}

function Root() {
  const theme = useMemo(() => {
    if (!chrome) return getTheme("en")
    const lang = chrome.i18n.getUILanguage()
    const langCode = lang.split("-")[0]
    const theme = getTheme(langCode)
    return theme
  }, [chrome])

  console.log("Root")
  useEffect(() => {
    console.log("=====================================")
    mixpanel.init(process.env.PLASMO_PUBLIC_MIXPANEL_TOKEN, {
      track_pageview: false
    })

    async function setMixpanelUUID() {
      const uuid = await fetchDeviceId()
      mixpanel.identify(uuid)
    }
    setMixpanelUUID()
  }, [])

  return (
    <CacheProvider value={styleCache}>
      <LocaleProvider>
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <ScopedCssBaseline
                sx={{
                  backgroundColor: "transparent",
                  pointerEvents: "none"
                }}>
                <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                  <InjectVocab />
                </ErrorBoundary>
              </ScopedCssBaseline>
            </PersistGate>
          </Provider>
        </ThemeProvider>
      </LocaleProvider>
    </CacheProvider>
  )
}

const drawerWidth = 380
function ErrorBoundaryFallback({
  error,
  resetErrorBoundary
}): React.JSX.Element {
  const dispatch = useAppDispatch()

  useEffect(() => {
    console.log("ErrorBoundaryFallback")
    console.error(error)
    dispatch({ type: "global/RESET_STATE" })
  }, [])

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={true}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        pointerEvents: "auto",
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "#fff"
        }
      }}>
      <h1>Something went wrong</h1>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </Drawer>
  )
}

export default Root
