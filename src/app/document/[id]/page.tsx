import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import type { RawDocument } from '@netsmile/page-edit-component';
import type { NextPage } from 'next';
import * as React from 'react';

import { DocumentViewer } from '@/components/DocumentViewer';
import { ErrorPage } from '@/components/ErrorPage';
import { PATHS } from '@/constants';
import { DocumentDataStoreProvider } from '@/providers/document-data-store-provider';
import { getServerApiClient } from '@/services/api';
import { ApiCallError } from '@/services/api/errors';

const Document: NextPage = withPageAuthRequired(
  async ({ params }) => {
    const { id } = params as { id: string };
    const apiClient = await getServerApiClient();
    let data: RawDocument | undefined;

    try {
      data = await apiClient.getDocument(id);
    } catch (e) {
      return <ErrorPage error={e as Error} />;
    }

    if (!data) {
      const customError = new ApiCallError();
      return <ErrorPage error={customError} />;
    }

    return (
      <DocumentDataStoreProvider initialDocument={data}>
        <DocumentViewer />
      </DocumentDataStoreProvider>
    );
  },
  { returnTo: PATHS.DOCUMENT },
);

export default Document;
