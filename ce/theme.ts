import { createTheme } from '@mui/material/styles';

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
  },
}

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


export function getTheme(lang: string) {
  return createTheme({
    ...themeBase,
    ...themeLang[lang]
  })
}