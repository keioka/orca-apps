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
import { useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
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
  const [popupInfo, setPopupInfo] = useState(null)

  const theme = useMemo(() => {
    if (!chrome) return getTheme("en")
    const lang = chrome.i18n.getUILanguage()
    const langCode = lang.split("-")[0]
    const theme = getTheme(langCode)
    return theme
  }, [chrome])

  console.log("Root")

  const handleSelectionChange = (event) => {
    console.log("handleSelectionChange", event)
    event.preventDefault()
    event.stopPropagation()

    const selection = window.getSelection()
    const anchorNode = selection.anchorNode

    console.log({ anchorNode })
    if (anchorNode.nodeName !== "#text") {
      return
    }

    const selectedText = selection.toString().trim()
    if (selectedText.length === 0 || selectedText.length > 40) {
      setPopupInfo(null)
      return
    }
    // Remove existing highlights
    const existingHighlights = document.querySelectorAll(
      ".highlight, .sentence-highlight"
    )
    existingHighlights.forEach((highlight) => highlight.remove())

    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // Add highlight
      const highlight = document.createElement("span")
      highlight.style.backgroundColor = "rgba(255, 255, 0, 0.1)" // yellow with 0.1 opacity
      highlight.style.position = "absolute"
      highlight.style.left = `${rect.left + window.scrollX}px`
      highlight.style.top = `${rect.top + window.scrollY}px`
      highlight.style.width = `${rect.width}px`
      highlight.style.height = `${rect.height}px`
      highlight.classList.add("highlight")
      document.body.appendChild(highlight)

      // Add green highlight to the sentence containing the hovered word
      const sentenceRange = document.createRange()
      // sentenceRange.selectNodeContents(range.startContainer)
      const sentenceText = sentenceRange
        .toString()
        .trim()
        .split(".")
        .filter((sentence) => sentence.includes(selectedText))[0]

      const sentenceRect = sentenceRange.getBoundingClientRect()
      const sentenceHighlight = document.createElement("span")
      sentenceHighlight.style.backgroundColor = "rgba(0, 255, 0, 0.1)" // green with 0.1 opacity
      sentenceHighlight.style.position = "absolute"
      sentenceHighlight.style.left = `${sentenceRect.left + window.scrollX}px`
      sentenceHighlight.style.top = `${sentenceRect.top + window.scrollY}px`
      sentenceHighlight.style.width = `${sentenceRect.width}px`
      sentenceHighlight.style.height = `${sentenceRect.height}px`
      sentenceHighlight.classList.add("sentence-highlight")
      document.body.appendChild(sentenceHighlight)

      console.log({
        selectedText,
        sentenceText,
        range,
        sentenceRange
      })

      const wordInfo = {
        word: selectedText,
        meaning: sentenceText,
        example: sentenceText
      }

      setPopupInfo({
        wordInfo,
        x: rect.right + window.scrollX + 5,
        y: rect.top + window.scrollY + 60
      })
    }
  }

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [])

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

    const handleClosePopup = () => {
      console.log("close popup")
      setPopupInfo(null)
    }
  }, [])

  // function addCardElement(cardInfo) {
  //   const cardElement = document.createElement("div")
  //   cardElement.id = "card-vocab"
  //   cardElement.style.position = "absolute"
  //   cardElement.style.width = "300px"
  //   cardElement.style.left = `${cardInfo.x}px`
  //   cardElement.style.top = `${cardInfo.y}px`
  //   cardElement.style.zIndex = "100000000"
  //   cardElement.style.backgroundColor = "white"
  //   cardElement.style.border = "1px solid #ccc"
  //   cardElement.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
  //   cardElement.style.padding = "10px"
  //   cardElement.style.borderRadius = "4px"

  //   cardElement.addEventListener("click", function () {})

  //   const cardContent = `
  //     <h3>${cardInfo.word}</h3>
  //     <p><strong>Meaning:</strong> ${cardInfo.meaning}</p>
  //     <p><strong>Example:</strong> ${cardInfo.example}</p>
  //   `

  //   cardElement.innerHTML = cardContent
  //   document.body.appendChild(cardElement)
  // }

  // function removeCardElement() {
  //   const cardElement = document.querySelector("#card-vocab")
  //   if (cardElement) {
  //     cardElement.remove()
  //   }
  // }

  // useEffect(() => {
  //   if (!popupInfo) {
  //     removeCardElement()
  //     return
  //   }
  //   addCardElement({
  //     x: 400,
  //     y: 400,
  //     word: popupInfo.word,
  //     meaning: popupInfo.meaning,
  //     example: popupInfo.example
  //   })
  // }, [popupInfo])

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

export const getRootContainer = () =>
  new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const div = document.createElement("div")
      div.id = "orca-root-container"
      // div.style.position = "absolute"
      // div.style.width = "300px"
      // div.style.left = "100px"
      // div.style.top = "100px"
      div.style.zIndex = "100000000"
      document.body.appendChild(div)
      document.head.appendChild(styleElement)
      const rootContainer = div
      if (rootContainer) {
        clearInterval(checkInterval)
        resolve(rootContainer)
      }
    }, 137)
  })

export const render: PlasmoRender = async ({
  anchor, // the observed anchor, OR document.body.
  createRootContainer // This creates the default root container
}) => {
  const rootContainer = await createRootContainer()

  const root = createRoot(rootContainer) // Any root
  root.render(<Root />)
}
