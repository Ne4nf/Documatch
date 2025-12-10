import { UserProvider } from '@auth0/nextjs-auth0/client';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import * as React from 'react';

import { ErrorPage } from '@/components/ErrorPage';
import { MuiXLicense } from '@/components/MuiLicense';
import { PageLayout } from '@/components/PageLayout';
import {
  loadPresetPrompts,
  preloadFirstDocumentTypePage,
} from '@/load-document-type-data';
import {
  loadDefinitions,
  loadPermissionsAndOptions,
  loadPrompts,
  loadUsers,
  preloadFirstDocumentSearchPage,
} from '@/load-global-data';
import { DocumentTypeStoreProvider } from '@/providers/document-type-store-provider';
import { GlobalDataStoreProvider } from '@/providers/global-data-store-provider';
import { getServerApiClient, getServerUserServiceApiClient } from '@/services/api';
import theme from '@/theme';

function ErrorLayout(props: { children: React.ReactNode; locale: string }) {
  return (
    <html lang={props.locale}>
      <body>{props.children}</body>
    </html>
  );
}

async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  const apiClient = await getServerApiClient();
  const userApiClient = await getServerUserServiceApiClient();

  // Load global data that should be available in all pages
  // Note that RootLayout is shared by all pages, including pages that do not require
  // auth. For these pages, the user may be unauthenticated, and the global data will not
  // be loaded. After logging in, a hard refresh will happen, so RootLayout will be
  // re-rendered guaranteeing that we can always load the global data when the user is
  // authenticated.
  const {
    errorComponent: permissionsErrorComponent,
    organizationOptions,
    userInfo,
  } = await loadPermissionsAndOptions(userApiClient);

  if (permissionsErrorComponent) {
    return <ErrorLayout locale={locale}>{permissionsErrorComponent}</ErrorLayout>;
  }

  if (userInfo.accessList) {
    const hasAccessToUI = userInfo.accessList.some(access => access === 'asr-alpha-ui');

    if (!hasAccessToUI) {
      return (
        <ErrorLayout locale={locale}>
          <ErrorPage error={new Error('権限が不十分です。Insufficient permissions')} />
        </ErrorLayout>
      );
    }
  }

  // The initial version of ASR Alpha will only support LLM scanning, so we don't
  // actually need the definitions, but we do want to add back support for standard
  // scanning after initial delivery so let us keep loading definitions
  const { definitions, errorComponent } = await loadDefinitions(apiClient);

  if (errorComponent) {
    return <ErrorLayout locale={locale}>{errorComponent}</ErrorLayout>;
  }

  const { errorComponent: promptsErrorComponent, prompts } = await loadPrompts(apiClient);

  if (promptsErrorComponent) {
    return <ErrorLayout locale={locale}>{promptsErrorComponent}</ErrorLayout>;
  }

  const { errorComponent: firstSearchPageErrorComponent, firstSearchPage } =
    await preloadFirstDocumentSearchPage(apiClient);

  if (firstSearchPageErrorComponent) {
    return <ErrorLayout locale={locale}>{firstSearchPageErrorComponent}</ErrorLayout>;
  }

  const { errorComponent: presetPromptsErrorComponent, presetPrompts } =
    await loadPresetPrompts(apiClient);

  if (presetPromptsErrorComponent) {
    return <ErrorLayout locale={locale}>{presetPromptsErrorComponent}</ErrorLayout>;
  }

  const { errorComponent: firstDocumentTypePageErrorComponent, firstDocumentTypePage } =
    await preloadFirstDocumentTypePage(apiClient);

  if (firstDocumentTypePageErrorComponent) {
    return (
      <ErrorLayout locale={locale}>{firstDocumentTypePageErrorComponent}</ErrorLayout>
    );
  }

  const { errorComponent: usersErrorComponent, users } = await loadUsers(
    userApiClient,
    userInfo.organizationId,
  );

  if (usersErrorComponent) {
    return <ErrorLayout locale={locale}>{usersErrorComponent}</ErrorLayout>;
  }

  return (
    <html lang={locale}>
      <body>
        <UserProvider>
          <NextIntlClientProvider messages={messages}>
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
              <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and
                simple baseline to build upon. */}
                <CssBaseline />
                <PageLayout>
                  <GlobalDataStoreProvider
                    definitions={definitions}
                    firstSearchResultsPage={firstSearchPage}
                    organizationOptions={organizationOptions}
                    prompts={prompts}
                    userInfo={userInfo}
                    users={users}
                  >
                    <DocumentTypeStoreProvider
                      firstDocumentTypePage={firstDocumentTypePage}
                      presetPrompts={presetPrompts}
                      users={users}
                    >
                      {props.children}
                    </DocumentTypeStoreProvider>
                  </GlobalDataStoreProvider>
                  <MuiXLicense />
                </PageLayout>
              </ThemeProvider>
            </AppRouterCacheProvider>
          </NextIntlClientProvider>
        </UserProvider>
      </body>
    </html>
  );
}

export default RootLayout;
