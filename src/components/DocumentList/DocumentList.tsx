'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterLuxon } from '@mui/x-date-pickers-pro/AdapterLuxon';
import { useTranslations } from 'next-intl';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import * as React from 'react';

import { DocumentUploadDialog } from '@/components/DocumentUploadDialog';
import type { ColumnItemProps } from '@/components/Table';
import { useGlobalDataStore } from '@/providers/global-data-store-provider';
import { getApiClient } from '@/services/api';
import type { DocumentSearchResults } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import type { SearchFilters } from '@/types';
import { extractErrorMessage, transformSearchFiltersToSearchParams } from '@/utils';

import ErrorPage from '../ErrorPage';
import { OverlaySpinner } from '../Loaders';
import DocumentTable from './DocumentTable';
import DocumentFilters from './DoumentFilters';
import type { DocumentTableSortColumns } from './types';

const WrapperContainer = styled(Container)(() => ({
  paddingBottom: '16px',
  paddingTop: '16px',
}));

const BoxWithDropShadow = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  border: '0.6px solid #9a9a9a',
  filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.25))',
  padding: '16px 16px 6px 16px',
}));

const TitleTypography = styled(Typography)(() => ({
  fontSize: '24px',
  fontWeight: 'bold',
  marginRight: '42px',
}));

// TODO: These need to be mapped to actual status values when filtering with the api
export const filterableDocumentStatuses = ['processing', 'done', 'confirmed', 'error'];

function DocumentList() {
  const t = useTranslations('DocumentList');
  const {
    organizationOptions,
    page,
    resetSearchResults,
    rowsPerPage,
    searchFilters,
    searchResults,
    setPage,
    setRowsPerPage,
    setSearchFilters,
    setSearchResults,
    setSortColumn,
    setSortDirection,
    sortColumn,
    sortDirection,
  } = useGlobalDataStore(state => state);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<DocumentSearchResults | undefined>(
    searchResults[page],
  );
  const [isScanning, setIsScanning] = React.useState<boolean>(false);

  const apiClient = getApiClient();
  const showUploadDialog = organizationOptions.hideASRAlphaUploadUI !== true;

  const loadNewPage = async (filters: any, newPage: number) => {
    const existingData = searchResults[newPage];
    if (existingData) {
      setData(existingData);
      return;
    }

    setIsLoading(true);

    try {
      const sorting = {
        sortBy: sortColumn,
        sortOrder: sortDirection === 'asc' ? 'a' : 'd',
      };

      const newData = await apiClient.searchDocuments(
        filters,
        sorting,
        newPage + 1,
        rowsPerPage,
      );
      setData(newData);
      setSearchResults(newPage + 1, newData);
    } catch (e) {
      enqueueSnackbar({ message: t('errorLoading'), variant: 'error' });

      const errorMessage = extractErrorMessage(e);
      console.warn(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const reloadData = async (
    filters: any,
    newPage: number,
    newRowsPerPage: number,
    newSortColumn: string,
    newSortDirection: string,
  ) => {
    setIsLoading(true);

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
      setData(newData);
      resetSearchResults(newData);
    } catch (e) {
      enqueueSnackbar({ message: t('errorLoading'), variant: 'error' });

      const errorMessage = extractErrorMessage(e);
      console.warn(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshDocument = async () => {
    await reloadData(
      transformSearchFiltersToSearchParams(searchFilters),
      page,
      rowsPerPage,
      sortColumn,
      sortDirection,
    );

    return true;
  };

  const handlePageChange = async (event: null | React.MouseEvent, newPage: number) => {
    setPage(newPage);

    await loadNewPage(transformSearchFiltersToSearchParams(searchFilters), newPage);
  };

  const handleRowsPerPageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    const newPage = 0;

    setRowsPerPage(newRowsPerPage);
    setPage(newPage);

    await reloadData(
      transformSearchFiltersToSearchParams(searchFilters),
      newPage,
      newRowsPerPage,
      sortColumn,
      sortDirection,
    );
  };

  const handleSortingChange = async (column: ColumnItemProps) => {
    const newSortColumn = column.sortName || 'id';
    const didSortColumnChange = sortColumn !== column.sortName;
    const newSortDirection =
      didSortColumnChange || sortDirection === 'desc' ? 'asc' : 'desc';

    setSortColumn(newSortColumn as DocumentTableSortColumns);
    setSortDirection(newSortDirection);

    await reloadData(
      transformSearchFiltersToSearchParams(searchFilters),
      page,
      rowsPerPage,
      newSortColumn,
      newSortDirection,
    );
  };

  const handleDcumentFiltersChanged = async (newSearchFilters: SearchFilters) => {
    setSearchFilters(newSearchFilters);
    setPage(0);

    await reloadData(
      transformSearchFiltersToSearchParams(newSearchFilters),
      0,
      rowsPerPage,
      sortColumn,
      sortDirection,
    );
  };

  if (!data) {
    return <ErrorPage error={new Error(t('errorLoading'))} />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'top' }} />
      <WrapperContainer maxWidth={false}>
        {isScanning && <OverlaySpinner />}
        <BoxWithDropShadow>
          <Box sx={{ alignItems: 'center', display: 'flex', marginBottom: '23px' }}>
            <TitleTypography noWrap>{t('title')}</TitleTypography>
            {showUploadDialog && (
              <DocumentUploadDialog
                refreshDocument={handleRefreshDocument}
                setLoading={setIsScanning}
              />
            )}
          </Box>

          <DocumentFilters
            onFiltersChanged={handleDcumentFiltersChanged}
            searchFilters={searchFilters}
          />

          <DocumentTable
            data={data}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSortingChange={handleSortingChange}
            page={page}
            rowsPerPage={rowsPerPage}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />
        </BoxWithDropShadow>
      </WrapperContainer>
    </LocalizationProvider>
  );
}

export default DocumentList;
export { DocumentList };
