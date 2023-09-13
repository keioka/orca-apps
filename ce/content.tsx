import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { Inject } from "components/Inject"
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import cssText from "data-text:~/global.css"

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

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeParam) => ({
        root: {
          backgroundColor: "transparent",
          pointerEvents: "none",
        }
      }),
    },
  },
});

function Root() {
  return (
    <CacheProvider value={styleCache}>
      <ThemeProvider theme={theme}>
        <ScopedCssBaseline
          sx={{
            backgroundColor: "transparent",
            pointerEvents: "none",
          }}
        >
          <Inject />
        </ScopedCssBaseline>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default Root