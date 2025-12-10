'use client';

import type { CallbackResult, RawDocument } from '@netsmile/page-edit-component';
import PageEditComponent from '@netsmile/page-edit-component';
import type { BoundingBox, TableRowDetectionStatus } from '@nstypes/templateless';
import { useLocale, useTranslations } from 'next-intl';
import type { TranslationValues } from 'next-intl';
import type { VariantType } from 'notistack';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import React, { useState } from 'react';

import DocumentHeader from '@/components/Document/DocumentHeader';
import { OverlaySpinner, Spinner } from '@/components/Loaders';
import { SIZES, TABLE_ROW_DETECTION_STATUS } from '@/constants';
import { useWindowSize } from '@/hooks';
import { useGlobalDataStore } from '@/providers/global-data-store-provider';
import { getApiClient } from '@/services/api';
import type { ConflictError } from '@/services/api/errors';
import type {
  BoundingBoxWithId,
  TableRowDetectionPayload,
} from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import { extractErrorMessage } from '@/utils';

interface DetectedTableRes {
  detectionResults?: object[];
  errorMessage?: string;
  status: TableRowDetectionStatus;
  tableId?: string;
}

interface DocumentProps {
  data: RawDocument;
}

interface DocumentToPoll {
  documentId: null | string;
  documentPageId: null | string;
}

interface RequestTableRowDetectionResponse {
  error?: string;
  requestId?: string;
}

const { CANCELLED, DONE, ERROR, PENDING } = TABLE_ROW_DETECTION_STATUS;

function Document(props: DocumentProps) {
  const locale = useLocale();
  const tDocument = useTranslations('Document');
  const tError = useTranslations('Errors');
  const tRowDetection = useTranslations('TableRowDetection');

  const [loading, setLoading] = useState(false);
  const [activeRequestStatus, setActiveRequestStatus] =
    useState<TableRowDetectionStatus>(null);
  const [activeRequestId, setActiveRequestId] = useState<string>('');
  const [rawDocument, _setRawDocument] = useState(props.data);

  const pollResultsForDocument = React.useRef<DocumentToPoll | null>(null);

  const windowSize = useWindowSize();
  const apiClient = getApiClient();

  const { definitions } = useGlobalDataStore(state => state);

  const licenseKey = process.env.NEXT_PUBLIC_MUI_X_LICENSE_KEY || '';

  const showSnackbarOnFirstReply = (
    variant: VariantType,
    translationKey: string,
    args?: TranslationValues,
  ) => {
    if (pollResultsForDocument.current) {
      enqueueSnackbar({
        message: tRowDetection(translationKey, args),
        variant,
      });
    }
    pollResultsForDocument.current = null;
  };

  const handlePollRowDetectionResults = async () => {
    const { documentId, documentPageId } = pollResultsForDocument.current || {};

    if (!documentId || !documentPageId) {
      return [];
    }

    const { detectionResults, errorMessage, status, tableId }: DetectedTableRes =
      await apiClient.getTableRowDetectionStatus(documentId, documentPageId).catch(_ => ({
        errorMessage: tError('connectionError'),
        status: null,
      }));

    if (status === PENDING) {
      return [];
    }

    if (!detectionResults || !tableId) {
      showSnackbarOnFirstReply('warning', 'detectionResultsEmpty');
      setActiveRequestStatus(DONE);
      return [];
    }

    switch (status) {
      case CANCELLED:
        showSnackbarOnFirstReply('warning', 'alreadyCancelled');
        break;
      case DONE:
        showSnackbarOnFirstReply('success', 'done');
        break;
      case ERROR:
      default:
        showSnackbarOnFirstReply('error', 'failure', { errorMessage });
    }

    setActiveRequestStatus(status);

    return detectionResults as any;
  };

  const handleSave = async (
    correctedDocumentId: string,
    correctedDocument: RawDocument,
  ): CallbackResult => {
    try {
      setLoading(true);

      for (const pageToSave of correctedDocument.pages) {
        const corrections = {
          correctedFields: pageToSave.correctedItems,
          correctedTables: pageToSave.correctedTables,
        };

        await apiClient.savePageCorrections(
          correctedDocumentId,
          pageToSave.id,
          corrections,
        );
      }

      enqueueSnackbar({
        message: tDocument('saveSuccess'),
        variant: 'success',
      });

      return {
        ok: true,
      };
    } catch (e) {
      const errorMessage = extractErrorMessage(e);
      enqueueSnackbar({
        message: `${tDocument('saveFailure')}: ${errorMessage}`,
        variant: 'error',
      });

      return {
        errors: [errorMessage],
        ok: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTableRowDetection = async (
    documentId: string,
    documentPageId: string,
    table: BoundingBox,
    rowsNoId: BoundingBox[],
    tableId: string,
  ): Promise<RequestTableRowDetectionResponse> => {
    let requestId = '';
    let error;

    try {
      setLoading(true);

      const rows: BoundingBoxWithId[] = rowsNoId.map((r, i) => ({
        ...r,
        boxId: `row_${String(i + 1).padStart(4, '0')}`,
      }));
      const payload: TableRowDetectionPayload = { rows, table, tableId };

      await apiClient
        .requestTableRowDetection(documentId, documentPageId, payload)
        .then(res => {
          requestId = res.activeRowDetectionRequestId as string;
          pollResultsForDocument.current = { documentId, documentPageId };
        });
    } catch (e) {
      const errorMessage = extractErrorMessage(e);
      setActiveRequestStatus(null);
      showSnackbarOnFirstReply('error', 'failure', { errorMessage });
      error = errorMessage;
    } finally {
      setActiveRequestId(requestId);
      setLoading(false);
    }
    return { error, requestId };
  };

  const handleCancelRowDetection = async (documentId: string, documentPageId: string) => {
    try {
      setLoading(true);

      await apiClient.cancelTableRowDetection(
        documentId,
        documentPageId,
        activeRequestId,
      );

      showSnackbarOnFirstReply('success', 'cancelled');
      setActiveRequestStatus(CANCELLED);
    } catch (e: unknown) {
      if ((e as ConflictError).isRequestForCancelledDetection) {
        showSnackbarOnFirstReply('warning', 'alreadyCancelled');
        setActiveRequestStatus(CANCELLED);
      } else {
        const errorMessage = extractErrorMessage(e);
        showSnackbarOnFirstReply('error', 'failure', { errorMessage });
        setActiveRequestStatus(ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!windowSize.width || !windowSize.height) {
    return <Spinner />;
  }

  const height =
    windowSize.height -
    SIZES.HEADER_HEIGHT -
    SIZES.DOCUMENT_HEADER_HEIGHT -
    SIZES.FOOTER_HEIGHT +
    1; // This hides the 1 pixel black border at the bottom,
  // which blends better with the footer

  return (
    <>
      {loading && <OverlaySpinner />}
      <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'top' }} />
      <DocumentHeader data={rawDocument} setLoading={setLoading} />
      <PageEditComponent
        activeRequestStatus={activeRequestStatus}
        definitions={definitions}
        enableTableSupport
        height={height}
        key={`${rawDocument.id}-${rawDocument.definitionId}`}
        licenseKey={licenseKey}
        locale={locale}
        onCancelRowDetection={handleCancelRowDetection}
        onNavigate={() => {}}
        onRequestRowDetection={handleRequestTableRowDetection}
        onSave={handleSave}
        pollRowDetectionResults={handlePollRowDetectionResults}
        rawDocument={rawDocument}
        setActiveRequestStatus={setActiveRequestStatus}
      />
    </>
  );
}

export default Document;
