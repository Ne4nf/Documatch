'use client';

import { Stack, Typography } from '@mui/material';
import 'split-pane-react/esm/themes/default.css';
import type { CallbackResult, Page } from '@netsmile/page-edit-component';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';

import Loading from '@/app/loading';
import { useDocumentDataStore } from '@/providers/document-data-store-provider';
import { getApiClient } from '@/services/api';
import { extractErrorMessage } from '@/utils';

import DocumentHeader from '../Document/DocumentHeader';
import ResultData from '../ResultData';
import type { CorrectedItemWithId } from '../ResultData/types';
import ScanStatusIcon from '../ScanStatusIcon';
import DocumentPageView from './DocumentPageView';
import DocumentThumbnails from './DocumentThumbnails';

const SplitPane = dynamic(() => import('split-pane-react'), { ssr: false });
const Pane = dynamic(() => import('split-pane-react').then(mod => mod.Pane), {
  ssr: false,
});
const THUMBNAIL_WIDTH = 240;
const DOCUMENT_WIDTH_PERCENTAGE = '45%';
const TABLE_WIDTH_PERCENTAGE = '40%';
const THUMBNAIL_MAX_WIDTH = 300;
const CONTENT_MIN_WIDTH_PERCENTAGE = '33%';
export const DOCUMENT_BACKGROUND_COLOR = '#f4f4f4';
export interface GroupedThumbnail {
  groupId: string;
  imageUrls: string[];
  pages: number[];
  thumbnailUrl?: string;
}

export default function DocumentViewer() {
  const rawDocument = useDocumentDataStore(state => state.rawDocument);

  const createInitialPageGroups = () => {
    const pageGroups = rawDocument?.pageGroups;
    if (pageGroups?.length > 0) {
      const newPageGroups = pageGroups?.map((pageGroup: any) => {
        return {
          ...pageGroup,
          correctedItems: !pageGroup?.correctedItems
            ? pageGroup?.extractedItems
            : pageGroup?.correctedItems,
          correctedTables: !pageGroup?.correctedTables
            ? pageGroup?.extractedTables
            : pageGroup?.correctedTables,
        };
      });
      return newPageGroups;
    }
    return pageGroups;
  };

  const [currentGroupId, setCurrentGroupId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [pageGroups, setPageGroups] = useState<any>(createInitialPageGroups);
  const [isReadyToSave, setIsReadyToSave] = useState<boolean>(false);

  const tDocument = useTranslations('Document');
  const tDocumentStatus = useTranslations('DocumentStatus');
  const apiClient = getApiClient();

  const removeIdsFromCorrectedItems = (correctedItems: CorrectedItemWithId[]) => {
    return correctedItems.map(({ id: _, ...rest }) => rest);
  };

  const handleSaveGroupsCorrections = async (
    correctedDocumentId: string,
  ): CallbackResult => {
    try {
      setLoading(true);

      for (const groupToSave of pageGroups) {
        const corrections = {
          correctedFields: removeIdsFromCorrectedItems(groupToSave.correctedItems),
          correctedTables: groupToSave.correctedTables,
        };

        await apiClient.saveGroupCorrections(
          correctedDocumentId,
          groupToSave.id,
          corrections,
        );
      }

      setIsReadyToSave(false);
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

  const [sizes, setSizes] = useState([
    THUMBNAIL_WIDTH,
    DOCUMENT_WIDTH_PERCENTAGE,
    TABLE_WIDTH_PERCENTAGE,
  ]);

  const layoutCSS = {
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
  };

  const renderSash = (_index: number): React.ReactNode => {
    return <div style={{ background: `${DOCUMENT_BACKGROUND_COLOR}` }} />;
  };

  useEffect(() => {
    if (rawDocument?.pageGroups && rawDocument?.pageGroups?.length > 0) {
      setCurrentGroupId(rawDocument?.pageGroups[0]?.id);
    }
  }, [rawDocument?.pageGroups]);

  const thumbs: GroupedThumbnail[] = [];
  let singlePages = rawDocument.pages;

  if (pageGroups) {
    for (const group of pageGroups) {
      const usedPages = rawDocument.pages.filter((page: Page) =>
        group.pageIds.includes(page.id),
      );

      const pageNumbers = usedPages.map((page: Page) => page.pageNumber);
      singlePages = singlePages.filter(
        (page: Page) => !pageNumbers.includes(page.pageNumber),
      );

      thumbs.push({
        groupId: group.id,
        imageUrls: usedPages.map((page: Page) => page.imageUrl),
        pages: pageNumbers,
        thumbnailUrl: usedPages[0]?.thumbnailUrl,
      });
    }
  }

  if (singlePages) {
    for (const page of singlePages) {
      thumbs.push({
        groupId: `single-page-${page.pageNumber}`,
        imageUrls: [page.imageUrl],
        pages: [page.pageNumber],
        thumbnailUrl: page.thumbnailUrl,
      });
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'top' }} />

      <DocumentHeader
        data={rawDocument}
        handleSaveGroupsCorrections={handleSaveGroupsCorrections}
        isReadyToSave={isReadyToSave}
        setLoading={setLoading}
      />
      {rawDocument.status !== 'scanned' && rawDocument.status !== 'processed' ? (
        <Stack
          alignItems="center"
          bgcolor={DOCUMENT_BACKGROUND_COLOR}
          flexDirection="row"
          gap="16px"
          height="100vh"
          justifyContent="center"
        >
          <ScanStatusIcon status={rawDocument.status} />
          <Typography fontSize="40px">
            {tDocumentStatus(`${rawDocument?.status}`)}
          </Typography>
        </Stack>
      ) : (
        <div style={{ height: 'calc(100vh)' }}>
          <SplitPane
            onChange={setSizes}
            sashRender={renderSash}
            sizes={sizes}
            split="vertical"
          >
            <Pane maxSize={THUMBNAIL_MAX_WIDTH} minSize={THUMBNAIL_WIDTH}>
              <div style={{ ...layoutCSS, background: `${DOCUMENT_BACKGROUND_COLOR}` }}>
                <DocumentThumbnails
                  currentGroupId={currentGroupId}
                  handleChangeGroupId={setCurrentGroupId}
                  thumbs={thumbs}
                />
              </div>
            </Pane>
            <Pane minSize={CONTENT_MIN_WIDTH_PERCENTAGE}>
              <div style={{ ...layoutCSS, position: 'relative' }}>
                <Stack alignItems="center" width="100%">
                  <DocumentPageView currentGroupId={currentGroupId} thumbs={thumbs} />
                </Stack>
              </div>
            </Pane>
            <Pane minSize={CONTENT_MIN_WIDTH_PERCENTAGE}>
              <div style={{ ...layoutCSS, background: `${DOCUMENT_BACKGROUND_COLOR}` }}>
                <ResultData
                  currentGroupId={currentGroupId}
                  documentId={rawDocument?.id}
                  pageGroups={pageGroups}
                  setIsReadyToSave={setIsReadyToSave}
                  setPageGroups={setPageGroups}
                />
              </div>
            </Pane>
          </SplitPane>
        </div>
      )}
    </>
  );
}
