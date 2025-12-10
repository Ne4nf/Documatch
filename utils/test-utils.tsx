import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { ReactElement } from 'react';
import React from 'react';
import '@testing-library/jest-dom';

import { makeTheme } from './mockTheme';

async function AllTheProviders({ children }: { children: React.ReactNode }) {
  const theme = createTheme(makeTheme());

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </NextIntlClientProvider>
  );
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
