import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import type { NextPage } from 'next';
import * as React from 'react';

import DocumentTypeDetailComponent from '@/components/DocumentTypeDetail';
import { PATHS } from '@/constants';

const DocumentTypeDetail: NextPage = withPageAuthRequired(
  // eslint-disable-next-line @typescript-eslint/require-await
  async ({ params }) => {
    const { id } = params as { id: string };
    return <DocumentTypeDetailComponent promptId={id} />;
  },
  { returnTo: PATHS.DOCUMENT_TYPE_ID },
);

export default DocumentTypeDetail;
