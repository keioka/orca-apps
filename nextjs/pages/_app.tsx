import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import "reset-css";
import { crimsonText, outfit } from '@/font';
import { createTheme, ThemeProvider } from '@mui/material';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { useAppDispatch } from '@/redux/hooks';
import { getAuth } from "firebase/auth";
import { setSession, fetchCurrentUser } from '@/redux/features/auth';
import { firebase } from '../firebase/client'

const themeLang = {
  en: {
    typography: {
      fontFamily: "Open Sans",
    },
  },
  ja: {
    typography: {
      fontFamily: "ZenMaruGothic",
    },
  }
}


const themeBase = {
  palette: {
    primary: {
      main: '#2FABE8',
    },
    secondary: {
      main: '#6BD3F4',
    },
    customPalette: {
      yellow: '#FFD744',
      red: '#FF8A60',
      lightBlue: '#DFEDF2',
      darkBlue: '#2852A4',
    },
  },
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
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          fontSize: 12,
          fontWeight: 600,
        },
      }
    },
    MuiModal: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-outfit)',
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
          fontSize: 12,
          border: "none"
        },
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: 12,
          fontWeight: 600,
          boxShadow: "none",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-outfit)',
        }
      }
    }
  },
}


const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-crimson-text)',
    button: {
      fontFamily: 'var(--font-outfit)',
      fontWeight: 400,
    },
  },
  palette: themeBase.palette,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          fontFamily: 'var(--font-outfit)',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          boxShadow: 'none',
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: "12px !important",
          padding: "8px 12px !important",
          "&.Mui-selected": {
            borderRadius: "4px",
            background: "#9FD1D5",
            color: "#fff",
            borderBottom: "none",
            padding: "4px 8px",
            border: "none"
          },
          "MuiButton": {
            border: "none"
          }
        }
      }
    }
  }
})

function AppCore({ Component, pageProps }: AppProps) {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [isInit, setIsInit] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const auth = getAuth(firebase);
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          let accessToken = user.accessToken

          dispatch(setSession({
            accessToken: accessToken,
            uid: user.uid,
          }))
          dispatch(fetchCurrentUser({
            accessToken: accessToken,
          }))

        } else {
          dispatch(setSession(null))
          // dispatch(resetStateAction())
        }
        setIsLoading(false)
        setIsInit(true)
      })
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }, [])

  return (
    <main className={`${crimsonText.className} ${outfit.className}`}>
      <Component {...pageProps} />
    </main>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <AppCore Component={Component} pageProps={pageProps} />
      </Provider>
    </ThemeProvider >
  );
}

export default MyApp;
