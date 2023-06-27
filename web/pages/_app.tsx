import '@/styles/base.css';
import type { AppProps } from 'next/app';
import { Inter, Poppins, M_PLUS_Rounded_1c } from 'next/font/google';
import { createTheme, ThemeProvider } from '@mui/material';
import 'reset-css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ["300", "400", "500", "600"],
  subsets: ['latin'],
})

const mPlusRounded1c = M_PLUS_Rounded_1c({
  variable: '--font-m-plus-rounded-1c',
  weight: ["300", "400", "500", "700"],
  subsets: ['latin'],
})

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-poppins)',
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
      <main className={`${poppins.variable} ${mPlusRounded1c.variable}`}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider >
  );
}

export default MyApp;
