import type { PlasmoCSConfig } from "plasmo"
import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { Inject } from "components/Inject"
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import cssText from "data-text:~/global.css"
import { Provider } from "react-redux";
import { PersistGate } from "@plasmohq/redux-persist/integration/react"
import { persistor, store } from '~/redux/store';
import { getTheme } from "~/theme";
import { ErrorBoundary } from "react-error-boundary";
import { useEffect, useMemo } from "react";
import { useAppDispatch } from "~redux/hooks";
import mixpanel from "mixpanel-browser";
import { fetchDeviceId } from '~/utils/fetchDeviceId'
import { Drawer } from "@mui/material";

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

  useEffect(() => {
    console.log("=====================================")
    mixpanel.init(process.env.PLASMO_PUBLIC_MIXPANEL_TOKEN, { track_pageview: false });

    async function setMixpanelUUID() {
      const uuid = await fetchDeviceId()
      console.log({ uuid })
      mixpanel.identify(uuid)
    }

    setMixpanelUUID()
  }, [])

  return (
    <CacheProvider value={styleCache}>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <PersistGate
            loading={null}
            persistor={persistor}
          >
            <ScopedCssBaseline
              sx={{
                backgroundColor: "transparent",
                pointerEvents: "none",
              }}
            >
              <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <Inject />
              </ErrorBoundary>
            </ScopedCssBaseline>
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </CacheProvider >
  )
}

const drawerWidth = 380
function ErrorBoundaryFallback({ error, resetErrorBoundary }): React.JSX.Element {
  const dispatch = useAppDispatch()

  useEffect(() => {
    console.log("ErrorBoundaryFallback")
    console.error(error)
    dispatch({ type: "global/RESET_STATE" });
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
          background: "#fff",
        }
      }}
    >
      <h1>Something went wrong</h1>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </Drawer>
  )
}

// export const getRootContainer = () =>
//   new Promise((resolve) => {
//     const checkInterval = setInterval(() => {
//       const rootContainerParent = document.querySelector(`[href="/docs"]`)
//       if (rootContainerParent) {
//         clearInterval(checkInterval)
//         const rootContainer = document.createElement("div")
//         rootContainerParent.appendChild(rootContainer)
//         resolve(rootContainer)
//       }
//     }, 137)
//   })


// export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
//   createRootContainer
// }) => {
//   const rootContainer = await createRootContainer()
//   const root = createRoot(rootContainer)
//   root.render(<Root />)
// }


export default Root