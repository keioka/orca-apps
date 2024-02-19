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
import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoCSUIProps,
  PlasmoRender
} from "plasmo"
import { createRoot } from "react-dom/client"

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
  const lang = chrome.i18n.getUILanguage()
  const langCode = lang.split("-")[0]
  const theme = getTheme(langCode)

  return (
    <CacheProvider value={styleCache}>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ScopedCssBaseline
              sx={{
                backgroundColor: "transparent",
                pointerEvents: "none",
              }}
            >
              <Inject />
            </ScopedCssBaseline>
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </CacheProvider >
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