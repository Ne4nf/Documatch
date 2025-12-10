import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import type { NextPage } from 'next';
import * as React from 'react';

import DocumentTypeListComponent from '@/components/DocumentTypeList';
import { PATHS } from '@/constants';

const DocumentTypeList: NextPage = withPageAuthRequired(
  // eslint-disable-next-line @typescript-eslint/require-await
  async ({ searchParams }) => {
    const { refreshId } = searchParams as { refreshId: string };

    return <DocumentTypeListComponent refreshId={refreshId} />;
  },

  { returnTo: PATHS.DOCUMENT_TYPE },
);

export default DocumentTypeList;
