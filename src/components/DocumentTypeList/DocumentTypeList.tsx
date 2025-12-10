'use client';

import AddIcon from '@mui/icons-material/Add';
import { Container, type SelectChangeEvent } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterLuxon } from '@mui/x-date-pickers-pro/AdapterLuxon';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import React, { useEffect, useState } from 'react';

import { useDisclosure } from '@/hooks/useDisclosure';
import { useDocumentTypeStore } from '@/providers/document-type-store-provider';
import { getApiClient } from '@/services/api';
import type { PromptSearchResults } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import type { AutocompleteOption, DocumentTypeSearchFilters } from '@/types';
import { extractErrorMessage, transformPromptFiltersToPromptParams } from '@/utils';

import type { ColumnItemProps } from '../DocumentTypeForm/FieldView';
import ErrorPage from '../ErrorPage';
import DocumentTypeFilters from './DocumentTypeFilters';
import DocumentTypeTable from './DocumentTypeTable';
import CreateDocumentTypeFromPresetModal from './Modals/CreateDocumentTypeFromPresetModal';
import CreateDocumentTypeFromScratchModal from './Modals/CreateDocumentTypeFromScratchModal';
import SelectPresetDocumentTypeModal from './Modals/SelectPresetDocumentTypeModal';
import type { DocumentTypeTableSortColumns } from './types';

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

const ButtonContainer = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  gap: '16px',
  height: '64px',
  marginBottom: '12px',
}));

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: '2px',
  color: theme.palette.common.white,
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '22px',
  padding: '8px 10px 8px 15px',
  textTransform: 'none',
}));

function DocumentTypeListComponent({ refreshId }: { refreshId?: string }) {
  const router = useRouter();
  const tDocumentType = useTranslations('DocumentTypeList');
  const {
    documentTypeSearchFilters,
    page,
    presetPrompts,
    resetSearchResults,
    rowsPerPage,
    searchResults,
    setDocumentTypeSearchFilters,
    setPage,
    setRowsPerPage,
    setSearchResults,
    setSortColumn,
    setSortDirection,
    sortColumn,
    sortDirection,
    users,
  } = useDocumentTypeStore(state => state);
  const apiClient = getApiClient();

  const {
    close: closeSelectPresetDocumentTypeModal,
    isOpen: isSelectPresetDocumentTypeModalOpen,
    open: openSelectPresetDocumentTypeModal,
  } = useDisclosure(false);
  const {
    close: closeCreateFromScratchModal,
    isOpen: isCreateFromScratchModalOpen,
    open: openCreateFromScratchModal,
  } = useDisclosure(false);
  const {
    close: closeCreateFromPresetModal,
    isOpen: isCreateFromPresetModalOpen,
    open: openCreateFromPresetModal,
  } = useDisclosure(false);

  const [documentType, setDocumentType] = useState<AutocompleteOption | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = React.useState<PromptSearchResults | undefined>(
    searchResults[page],
  );

  const promptId = typeof documentType !== 'string' && documentType?.value;

  const presetPromptsOptions = presetPrompts?.map(item => ({
    label: item.name,
    value: item.id,
  }));

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

      const newData = await apiClient.searchPrompts(
        filters,
        sorting,
        newPage + 1,
        newRowsPerPage,
      );
      setData(newData);
      resetSearchResults(newData);
    } catch (e) {
      const errorMessage = extractErrorMessage(e);
      console.warn(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

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

      const newData = await apiClient.searchPrompts(
        filters,
        sorting,
        newPage + 1,
        rowsPerPage,
      );
      setData(newData);
      setSearchResults(newPage + 1, newData);
    } catch (e) {
      enqueueSnackbar({ message: tDocumentType('errorLoading'), variant: 'error' });

      const errorMessage = extractErrorMessage(e);
      console.warn(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (event: null | React.MouseEvent, newPage: number) => {
    setPage(newPage);

    await loadNewPage(
      transformPromptFiltersToPromptParams(documentTypeSearchFilters),
      newPage,
    );
  };

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    const newPage = 0;
    setRowsPerPage(newRowsPerPage);
    setPage(newPage);

    await reloadData(
      transformPromptFiltersToPromptParams(documentTypeSearchFilters),
      newPage,
      newRowsPerPage,
      sortColumn,
      sortDirection,
    );
  };

  const handleSortingChange = async (column: ColumnItemProps) => {
    const newSortColumn = column.sortName || 'name';
    const didSortColumnChange = sortColumn !== column.sortName;
    const newSortDirection =
      didSortColumnChange || sortDirection === 'desc' ? 'asc' : 'desc';

    setSortColumn(newSortColumn as DocumentTypeTableSortColumns);
    setSortDirection(newSortDirection);

    await reloadData(
      transformPromptFiltersToPromptParams(documentTypeSearchFilters),
      page,
      rowsPerPage,
      newSortColumn,
      newSortDirection,
    );
  };

  const handleFilter = async (newSearchFilters: DocumentTypeSearchFilters) => {
    setDocumentTypeSearchFilters(newSearchFilters);
    setPage(0);
    await reloadData(
      transformPromptFiltersToPromptParams(newSearchFilters),
      0,
      rowsPerPage,
      sortColumn,
      sortDirection,
    );
  };

  const handleOnSelectPreset = () => {
    if (promptId) {
      closeSelectPresetDocumentTypeModal();
      openCreateFromPresetModal();
    }
  };

  const handleReload = () => {
    return reloadData(
      transformPromptFiltersToPromptParams(documentTypeSearchFilters),
      0,
      10,
      sortColumn,
      sortDirection,
    );
  };

  useEffect(() => {
    if (refreshId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleReload();
      router.replace('/document-type', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshId]);

  if (!data) {
    return <ErrorPage error={new Error(tDocumentType('errorLoading'))} />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'top' }} />
      <WrapperContainer maxWidth={false}>
        <BoxWithDropShadow>
          <ButtonContainer>
            <TitleTypography>{tDocumentType('documentTypeList')}</TitleTypography>

            <CustomButton
              onClick={openCreateFromScratchModal}
              startIcon={
                <AddIcon
                  style={{
                    fontSize: '24px',
                  }}
                />
              }
              variant="contained"
            >
              {tDocumentType('newFromScratch')}
            </CustomButton>

            <CustomButton
              onClick={openSelectPresetDocumentTypeModal}
              startIcon={
                <AddIcon
                  style={{
                    fontSize: '24px',
                  }}
                />
              }
              variant="contained"
            >
              {tDocumentType('newFromPresetDocumentType')}
            </CustomButton>
          </ButtonContainer>

          <DocumentTypeFilters
            onFiltersChanged={handleFilter}
            searchFilters={documentTypeSearchFilters}
            users={users}
          />
          <DocumentTypeTable
            data={data}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSortingChange={handleSortingChange}
            page={page}
            rowsPerPage={rowsPerPage}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            users={users}
          />
        </BoxWithDropShadow>
        <SelectPresetDocumentTypeModal
          data={presetPromptsOptions || []}
          documentType={documentType}
          isOpen={isSelectPresetDocumentTypeModalOpen}
          onClose={closeSelectPresetDocumentTypeModal}
          onSelect={handleOnSelectPreset}
          setDocumentType={setDocumentType}
        />
        <CreateDocumentTypeFromScratchModal
          isOpen={isCreateFromScratchModalOpen}
          onClose={closeCreateFromScratchModal}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          reloadData={handleReload}
        />
        {promptId && (
          <CreateDocumentTypeFromPresetModal
            isCopyPreset
            isOpen={isCreateFromPresetModalOpen}
            onClose={closeCreateFromPresetModal}
            promptId={String(promptId)}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            reloadData={handleReload}
          />
        )}
      </WrapperContainer>
    </LocalizationProvider>
  );
}

export default DocumentTypeListComponent;
export { DocumentTypeListComponent };
