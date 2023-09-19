import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { Inject } from "components/Inject"
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import cssText from "data-text:~/global.css"
import { Provider } from "react-redux";
import { store } from './redux/store';

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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          border: "none",
          borderImage: "none",
          "&:hover:not(.Mui-disabled, .Mui-error):before": {
            borderBottom: "none",
          },
        },
        input: {
          border: "none"
        },
      }
    },
  },
});

function Root() {
  return (
    <CacheProvider value={styleCache}>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ScopedCssBaseline
            sx={{
              backgroundColor: "transparent",
              pointerEvents: "none",
            }}
          >
            <Inject />
          </ScopedCssBaseline>
        </Provider>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default Root