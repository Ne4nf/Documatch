import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import type { NextPage } from 'next';
import * as React from 'react';

import { DocumentList as DocumentListComponent } from '@/components/DocumentList';

const DocumentList: NextPage = withPageAuthRequired(
  // eslint-disable-next-line @typescript-eslint/require-await
  async () => {
    return <DocumentListComponent />;
  },
  { returnTo: '/document' },
);

export default DocumentList;
