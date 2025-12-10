'use client';

import { createTheme } from '@mui/material/styles';
import { Noto_Sans_JP as NotoSansJP } from 'next/font/google';

const notoSansJP = NotoSansJP({
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

const theme = createTheme({
  components: {
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === 'info' && {
            backgroundColor: '#c7ae9c',
          }),
        }),
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (min-width: 600px)': {
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          height: '30px',
        },
      },
    },
  },
  palette: {
    common: {
      black: '#000000',
      white: '#ffffff',
    },
    error: {
      light: '#f01c36', // light red
      main: '#c30d23', // dark red
    },
    mode: 'light',
    primary: {
      main: '#03a9f4',
    },
    secondary: {
      main: '#4fc3f7',
    },
  },
  typography: {
    fontFamily: notoSansJP.style.fontFamily,
  },
});

export default theme;
export { notoSansJP, theme };
