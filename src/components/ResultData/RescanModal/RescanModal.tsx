/* eslint-disable @typescript-eslint/no-misused-promises */

'use client';

import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  styled,
  Typography,
} from '@mui/material';
import type { Prompt } from '@nstypes/templateless';
import { useTranslations } from 'next-intl';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import CustomAutocomplete from '@/components/CustomAutocomplete/CustomAutoComplete';
import CustomModal from '@/components/CustomModal/CustomModal';
import { getApiClient } from '@/services/api';
import type { AutocompleteOption } from '@/types';
import { extractErrorMessage } from '@/utils';

const ModalBodyTitle = styled(Typography)(() => ({
  color: '#242222',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '14px',
  marginBottom: '12px',
}));

const ButtonGroup = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
}));

const RescanButton = styled(Button)(() => ({
  backgroundColor: '#03A9F4',
  borderRadius: '2px',
  color: 'white',
  fontSize: '14px',
  fontWeight: 500,
  padding: '10px 20px',
  textTransform: 'none',
  width: '110px',
}));

const CancelButton = styled(Button)(() => ({
  backgroundColor: 'white',
  border: '1px solid #03A9F4',
  borderRadius: '2px',
  color: '#0D8DC7',
  fontSize: '14px',
  fontWeight: 500,
  padding: '10px 18px',
  textTransform: 'none',
}));

type RescanModalBodyProps = {
  checked: boolean;
  documentType: AutocompleteOption | null;
  documentTypes: Prompt[];
  handleRescan: () => Promise<void>;
  isError: boolean;
  setChecked: (value: boolean) => void;
  setDocumentType: (value: AutocompleteOption | null) => void;
  setIsError: (value: boolean) => void;
};

type RescanModalFooterProps = {
  handleCloseModal: () => void;
  handleRescan: () => Promise<void>;
  isRescanning: boolean;
};

type RescanModalProps = {
  currentGroupId: string;
  documentId: string;
  documentTypes: Prompt[];
  handleCloseModal: () => void;
  isModalOpen: boolean;
};

export function RescanModal({
  currentGroupId,
  documentId,
  documentTypes,
  handleCloseModal,
  isModalOpen,
}: RescanModalProps) {
  const tDocumentRescan = useTranslations('DocumentRescan');
  const [checked, setChecked] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [documentType, setDocumentType] = useState<AutocompleteOption | null>(null);
  const [isRescanning, setIsRescanning] = useState<boolean>(false);

  const apiClient = getApiClient();

  const handleRescan = async () => {
    if (!documentType) {
      setIsError(true);
      return;
    }

    setIsRescanning(true);

    try {
      const response = await apiClient.rescanDocumentPageGroup(
        documentId,
        currentGroupId,
        typeof documentType === 'string' ? documentType : documentType?.value,
        checked,
      );

      if (response?.message === 'ok' && window !== undefined) {
        handleCloseModal();
        enqueueSnackbar({
          message: tDocumentRescan('rescanSuccess'),
          variant: 'success',
        });
        window.location.reload();
      }
    } catch (e) {
      const errorMessage = extractErrorMessage(e);

      enqueueSnackbar({
        message: `${tDocumentRescan('rescanFailure')}: ${errorMessage}`,
        variant: 'error',
      });
      handleCloseModal();
    } finally {
      setIsRescanning(false);
    }
  };

  return (
    <CustomModal
      bodyContent={
        <RescanModalBody
          checked={checked}
          documentType={documentType}
          documentTypes={documentTypes}
          handleRescan={handleRescan}
          isError={isError}
          setChecked={setChecked}
          setDocumentType={setDocumentType}
          setIsError={setIsError}
        />
      }
      footerContent={
        <RescanModalFooter
          handleCloseModal={handleCloseModal}
          handleRescan={handleRescan}
          isRescanning={isRescanning}
        />
      }
      handleCloseModal={handleCloseModal}
      isModalOpen={isModalOpen}
      title={tDocumentRescan('rescan')}
      titleSize="medium"
      width={451}
    />
  );
}

function RescanModalBody({
  checked,
  documentType,
  documentTypes,
  handleRescan,
  isError,
  setChecked,
  setDocumentType,
  setIsError,
}: RescanModalBodyProps) {
  const tDocumentRescan = useTranslations('DocumentRescan');

  return (
    <Box>
      <ModalBodyTitle>{tDocumentRescan('selectDocumentType')}</ModalBodyTitle>

      <CustomAutocomplete
        isError={isError}
        onChange={(e, value: AutocompleteOption | null | string) => {
          if (typeof value !== 'string') {
            setIsError(false);
            setDocumentType(value);
          }
        }}
        onKeyDownAction={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            handleRescan();
          }
        }}
        options={documentTypes?.map((item: Prompt) => ({
          label: item.name,
          value: item.id,
        }))}
        placeholder={tDocumentRescan('searchDocumentType')}
        value={documentType}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setChecked(event.target.checked);
            }}
            sx={{
              padding: '4px 8px',
            }}
          />
        }
        label={
          <Typography color="#242222" fontSize={14}>
            {tDocumentRescan('addOcrResult2')}
          </Typography>
        }
        sx={{ marginTop: '8px' }}
      />
    </Box>
  );
}

function RescanModalFooter({
  handleCloseModal,
  handleRescan,
  isRescanning,
}: RescanModalFooterProps) {
  const tModalFooter = useTranslations('ModalFooter');

  return (
    <ButtonGroup>
      <CancelButton onClick={handleCloseModal}>{tModalFooter('cancel')}</CancelButton>

      <RescanButton onClick={handleRescan}>
        {isRescanning ? (
          <CircularProgress size={24} sx={{ color: 'white' }} />
        ) : (
          tModalFooter('rescan')
        )}
      </RescanButton>
    </ButtonGroup>
  );
}
