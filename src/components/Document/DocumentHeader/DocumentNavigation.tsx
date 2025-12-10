'use client';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import React from 'react';

import { ToolbarButtonWithTooltip } from '@/components/Buttons';
import { PATHS } from '@/constants';
import { useGlobalDataStore } from '@/providers/global-data-store-provider';
import { getApiClient } from '@/services/api';
import type { DocumentSearchResults } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import { extractErrorMessage, transformSearchFiltersToSearchParams } from '@/utils';

interface DocumentNavigationProps {
  documentId: string;
  setLoading: (loading: boolean) => void;
}

function DocumentNavigation(props: DocumentNavigationProps) {
  const router = useRouter();
  const apiClient = getApiClient();

  const tDocument = useTranslations('Document');

  const { documentId, setLoading } = props;

  // Get search results from global store
  const {
    page,
    rowsPerPage,
    searchFilters,
    searchResults,
    setPage,
    setSearchResults,
    sortColumn,
    sortDirection,
  } = useGlobalDataStore(state => state);

  const pageSearchResults = searchResults[page];

  // Calculate index of this id within the current page of results.
  const currentIndex = pageSearchResults?.results?.findIndex(
    result => result.id === documentId,
  );

  // Check the currentIndex is not at the lower or upper boundary of all
  // paged search results.
  const lowerBoundary = page === 0 && currentIndex === 0;
  const upperBoundary =
    page === searchResults.length - 1 &&
    pageSearchResults &&
    currentIndex === pageSearchResults.results.length - 1;

  const loadNewData = async (
    filters: any,
    newPage: number,
    newRowsPerPage: number,
    newSortColumn: string,
    newSortDirection: string,
  ) => {
    try {
      const sorting = {
        sortBy: newSortColumn,
        sortOrder: newSortDirection === 'asc' ? 'a' : 'd',
      };
      const newData = await apiClient.searchDocuments(
        filters,
        sorting,
        newPage + 1,
        newRowsPerPage,
      );
      setSearchResults(newPage + 1, newData);
      return newData;
    } catch (e) {
      enqueueSnackbar({ message: tDocument('errorLoading'), variant: 'error' });

      const errorMessage = extractErrorMessage(e);
      console.warn(`Error: ${errorMessage}`);
    }
    return null;
  };

  const previousDocument = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (lowerBoundary || currentIndex === undefined) {
      return;
    }
    setLoading(true);

    const newPage = currentIndex === 0 ? page - 1 : page;
    let data: DocumentSearchResults | null | undefined = searchResults[newPage];

    if (!data || !data.results) {
      data = await loadNewData(
        transformSearchFiltersToSearchParams(searchFilters),
        newPage,
        rowsPerPage,
        sortColumn,
        sortDirection,
      );
    }

    const newIndex = currentIndex === 0 ? rowsPerPage - 1 : currentIndex - 1;
    const loadNext = data?.results[newIndex];
    if (loadNext) {
      setPage(newPage);
      router.push(`${PATHS.DOCUMENT}/${loadNext.id}`);
    }
    setLoading(false);
  };

  const nextDocument = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (upperBoundary || currentIndex === undefined) {
      return;
    }
    setLoading(true);

    const newPage = currentIndex === rowsPerPage - 1 ? page + 1 : page;
    let data: DocumentSearchResults | null | undefined = searchResults[newPage];

    if (!data || !data.results) {
      data = await loadNewData(
        transformSearchFiltersToSearchParams(searchFilters),
        newPage,
        rowsPerPage,
        sortColumn,
        sortDirection,
      );
    }

    const newIndex = currentIndex === rowsPerPage - 1 ? 0 : currentIndex + 1;
    const loadNext = data?.results[newIndex];
    if (loadNext) {
      setPage(newPage);
      router.push(`${PATHS.DOCUMENT}/${loadNext.id}`);
    }
    setLoading(false);
  };

  return (
    <>
      <ToolbarButtonWithTooltip
        aria-label={tDocument('navigationPreviousDocument')}
        disabled={currentIndex === -1 || lowerBoundary}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={previousDocument}
        text={tDocument('navigationPreviousDocument')}
      >
        <NavigateBeforeIcon sx={{ fontSize: '32px' }} />
      </ToolbarButtonWithTooltip>
      <ToolbarButtonWithTooltip
        aria-label={tDocument('navigationNextDocument')}
        disabled={currentIndex === -1 || upperBoundary}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={nextDocument}
        text={tDocument('navigationNextDocument')}
      >
        <NavigateNextIcon sx={{ fontSize: '32px' }} />
      </ToolbarButtonWithTooltip>
    </>
  );
}

export default DocumentNavigation;
