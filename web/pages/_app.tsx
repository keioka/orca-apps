import '@/styles/base.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { createTheme, ThemeProvider } from '@mui/material';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const theme = createTheme({
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
    }
  }
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <main className={inter.variable}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
}

export default MyApp;
