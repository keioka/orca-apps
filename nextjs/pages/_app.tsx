import type { AppProps } from 'next/app';
import { Crimson_Text } from 'next/font/google';
import { createTheme, ThemeProvider } from '@mui/material';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';

import 'reset-css';

const crimsonText = Crimson_Text({
  variable: '--font-crimson-text',
  weight: ["400", "600"],
  subsets: ['latin'],
})

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-crimson-text)',
  },
  palette: {
    primary: {
      main: '#9FD1D5',
    }
  },
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
          }
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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <main className={`${crimsonText.className}`}>
        <Component {...pageProps} />
        {/* <BottomNavigation sx={{ zIndex: 3, width: "100%", position: "fixed", bottom: 0 }}>
          <BottomNavigationAction label="Recents" />
          <BottomNavigationAction label="Favorites" />
          <BottomNavigationAction label="Nearby" />
        </BottomNavigation> */}
      </main>
    </ThemeProvider >
  );
}

export default MyApp;
