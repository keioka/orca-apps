import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import "reset-css";
import { crimsonText, outfit } from '@/font';
import { createTheme, Modal, Box, ThemeProvider, Typography, Stack, Button } from '@mui/material';
import { BottomNavigation, BottomNavigationAction, } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAuth } from "firebase/auth";
import { setSession, fetchCurrentUser } from '@/redux/features/auth';
import { fetchPayments, clearPaymentRequiredAlert } from '@/redux/features/payment';
import { firebase } from '../firebase/client'
import { useRouter } from 'next/router';
import { clear } from 'console';
import { ContentPremiumPlan } from '@/components/ContentPremiumPlan';
import mixpanel from "mixpanel-browser";
import LogRocket from 'logrocket'
import setupLogRocketReact from 'logrocket-react';
import { appWithTranslation } from 'next-i18next'

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
  typography: {
    allVariants: {
      color: "#191c29",
    }
  },
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
      black: '#191c29',
    },
  },
  components: {
    MuiTypography: {
      root: {
        color: "#191c29"
      }
    },
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
          fontFamily: 'var(--font-outfit) !important',
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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isInit, setIsInit] = useState(false)
  const [error, setError] = useState(null)
  const paymentRequiredAlert = useAppSelector((state) => state.payment.paymentRequiredAlert)

  const handleClickPayment = () => {
    router.push("/plan")
  }

  const handleClosePaymentRequiredModal = () => {
    dispatch(clearPaymentRequiredAlert())
  }

  const handleUpgrade = () => {
    window.open(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK, "_blank")
  }

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
          dispatch(fetchPayments())

          mixpanel.identify(user.uid);
          mixpanel.track("Session", {
            uid: user.uid,
          });

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
      <Modal
        open={!!paymentRequiredAlert}
        onClose={handleClosePaymentRequiredModal}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24
        }}
        className={outfit.className}
      >
        <Stack
          sx={{
            background: "#fff",
            borderRadius: 8,
            height: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 4,
          }}
          spacing={2}
        >
          <Typography>{paymentRequiredAlert}</Typography>
          <ContentPremiumPlan
            handleUpgrade={handleUpgrade}
          />
          {/* <Button variant="contained" onClick={handleClickPayment} sx={{ color: "#fff" }}>プレミアムプランに加入する</Button> */}
        </Stack>
      </Modal>
      <Component {...pageProps} />
    </main>
  )
}

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, { track_pageview: true });

function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (process.env.APP_ENV === "production") {
        LogRocket.init('taiheyyo/orca-news-prod');
        // plugins should also only be initialized when in the browser
        setupLogRocketReact(LogRocket);
      }
      mixpanel.track("Visit Website");
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <AppCore Component={Component} pageProps={pageProps} />
      </Provider>
    </ThemeProvider >
  );
}

export default appWithTranslation(MyApp)
