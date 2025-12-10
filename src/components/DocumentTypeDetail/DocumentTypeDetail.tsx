'use client';

import { Box, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterLuxon } from '@mui/x-date-pickers-pro/AdapterLuxon';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import React, { useEffect, useState } from 'react';

import Loading from '@/app/loading';
import NotificationModal from '@/components/Document/DocumentHeader/Modals/NotificationModal';
import {
  DocumentTypeForm,
  type FormError,
  type PayloadDocumentTypeForm,
} from '@/components/DocumentTypeForm';
import { transformPromptResponseToPromptValue } from '@/components/DocumentTypeList/Modals/CreateDocumentTypeFromPresetModal';
import {
  preparePayload,
  validatePayloadValues,
} from '@/components/DocumentTypeList/utils';
import ErrorPage from '@/components/ErrorPage';
import ModalFooter from '@/components/Modals/FullscreenModal/ModalFooter';
import ModalHeader from '@/components/Modals/FullscreenModal/ModalHeader';
import { PATHS } from '@/constants';
import { getApiClient } from '@/services/api';
import { ApiCallError } from '@/services/api/errors';
import type { PromptCreatePayload } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import { extractErrorMessage, isChangedFormValue } from '@/utils';

interface DocumentTypeDetailProps {
  promptId: number | string;
}
function DocumentTypeDetail({ promptId }: DocumentTypeDetailProps) {
  const defaultValue = {
    documentType: '',
    extractTable: true,
    fieldsPrompt: [],
    name: '',
    tablePrompt: [],
    textualTablePrompt: '',
    userCustomInstructions: '',
  };
  const apiClient = getApiClient();
  const tDocumentTypeForm = useTranslations('DocumentTypeForm');
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [warning, setWarning] = useState<boolean>(false);
  const [warningError, setWarningError] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const [formValue, setFormValue] = useState<PayloadDocumentTypeForm>(defaultValue);
  const [formValueTemp, setFormValueTemp] =
    useState<PayloadDocumentTypeForm>(defaultValue);

  const [formError, setFormError] = useState<FormError>({});

  const catchError = (e: unknown) => {
    enqueueSnackbar({ message: tDocumentTypeForm('saveFailure'), variant: 'error' });
    const errorMessage = extractErrorMessage(e);
    console.warn(`Error: ${errorMessage}`);
  };

  const handleOnChangeForm = (values: PayloadDocumentTypeForm) => {
    setHasChanged(isChangedFormValue(formValueTemp, values));
    setFormValue(values);
  };

  const getDocumentType = async () => {
    if (!promptId) {
      return;
    }
    try {
      setLoading(true);
      const newData = await apiClient.getPrompt(promptId);
      setFormValue(transformPromptResponseToPromptValue(newData));
      setFormValueTemp(transformPromptResponseToPromptValue(newData));
    } catch (e) {
      setError(true);
      catchError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDocumentType = async (payload: PromptCreatePayload) => {
    if (!promptId) {
      return;
    }
    try {
      await apiClient.updatePrompt(promptId, payload);
      enqueueSnackbar({ message: tDocumentTypeForm('saveSuccess'), variant: 'success' });
    } catch (e) {
      catchError(e);
    }
  };

  const handleOnClose = () => {
    if (hasChanged) {
      setWarning(true);
    } else {
      router.push(PATHS.DOCUMENT_TYPE);
    }
  };

  const handleDeleteDocumentType = async () => {
    if (!promptId) {
      return;
    }
    try {
      await apiClient.deletePrompt(promptId);
      setWarningError(false);
      enqueueSnackbar({ message: tDocumentTypeForm('deleted'), variant: 'success' });
      setTimeout(() => {
        router.push(`${PATHS.DOCUMENT_TYPE}?refreshId=${new Date().getTime()}`);
      }, 1000);
    } catch (e) {
      catchError(e);
    }
  };

  const handleOnSave = async () => {
    const payload = preparePayload(formValue, true);
    if (validatePayloadValues(payload, tDocumentTypeForm)?.error) {
      setFormError(validatePayloadValues(payload, tDocumentTypeForm)?.errors);
      return;
    }
    setFormError({});
    await handleUpdateDocumentType(payload);
  };

  const handleOnCloseModal = () => {
    setFormValue(formValueTemp);
    setWarning(false);
    setHasChanged(false);
    router.push(PATHS.DOCUMENT_TYPE);
  };

  const handleOnApplyModal = async () => {
    setWarning(false);
    await handleOnSave();
  };

  const handleOnDelete = () => {
    setWarningError(true);
  };

  const handleOnOke = async () => {
    await handleDeleteDocumentType();
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getDocumentType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    const customError = new ApiCallError();
    return <ErrorPage error={customError} />;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'top' }} />
      <Box bgcolor="white" position="sticky" top={63} zIndex={10}>
        <ModalHeader
          onBack={handleOnClose}
          title={tDocumentTypeForm('documentTypeForm')}
        />
      </Box>
      <Box marginBottom="300px" padding="0 24px 20px">
        <DocumentTypeForm
          formError={formError}
          formValue={formValue}
          onChange={handleOnChangeForm}
        />
      </Box>
      <Box bottom={0} mb="50px" position="sticky" zIndex={10}>
        <ModalFooter
          onClickCancel={handleOnClose}
          onClickDelete={handleOnDelete}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClickSave={handleOnSave}
          textDelete={tDocumentTypeForm('delete')}
        />
      </Box>
      <NotificationModal
        description={tDocumentTypeForm('confirmContent')}
        footer={
          <Box display="flex" gap="8px" justifyContent="flex-end" mt="16px" width="100%">
            <Button color="error" disabled={loading} onClick={handleOnCloseModal}>
              {tDocumentTypeForm('confirmDiscard')}
            </Button>
            <Button
              color="primary"
              disabled={loading}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={handleOnApplyModal}
              sx={{ color: 'white' }}
              variant="contained"
            >
              {tDocumentTypeForm('confirmApply')}
            </Button>
          </Box>
        }
        isWarning
        onClose={() => setWarning(false)}
        open={warning}
        timer={0}
        title={tDocumentTypeForm('confirmation')}
      />
      <NotificationModal
        description={tDocumentTypeForm('confirmDeleteContent')}
        footer={
          <Box display="flex" gap="8px" justifyContent="flex-end" mt="16px" width="100%">
            <Button onClick={() => setWarningError(false)}>
              {tDocumentTypeForm('cancel')}
            </Button>
            <Button
              color="error"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={handleOnOke}
              sx={{ color: 'white' }}
              variant="contained"
            >
              {tDocumentTypeForm('ok')}
            </Button>
          </Box>
        }
        isError
        onClose={() => setWarningError(false)}
        open={warningError}
        timer={0}
        title={tDocumentTypeForm('confirmation')}
      />
    </LocalizationProvider>
  );
}

export default DocumentTypeDetail;
