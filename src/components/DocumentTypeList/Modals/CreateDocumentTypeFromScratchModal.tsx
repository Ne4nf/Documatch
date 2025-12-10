'use client';

import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterLuxon } from '@mui/x-date-pickers-pro/AdapterLuxon';
import { useTranslations } from 'next-intl';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useState } from 'react';

import type {
  FormError,
  PayloadDocumentTypeForm,
} from '@/components/DocumentTypeForm/DocumentTypeForm';
import DocumentTypeForm from '@/components/DocumentTypeForm/DocumentTypeForm';
import FullscreenModal from '@/components/Modals/FullscreenModal';
import { getApiClient } from '@/services/api';
import type { PromptCreatePayload } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import { extractErrorMessage } from '@/utils';

import { preparePayload, validatePayloadValues } from '../utils';

interface CreateDocumentTypeFromScratchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  reloadData?: () => void;
}

function CreateDocumentTypeFromScratchModal({
  isOpen = false,
  onClose,
  reloadData,
}: CreateDocumentTypeFromScratchModalProps) {
  const defaultValue = {
    documentType: '',
    extractTable: true,
    fieldsPrompt: [],
    name: '',
    tablePrompt: [],
    textualTablePrompt: '',
    userCustomInstructions: '',
  };

  const [formValue, setFormValue] = useState<PayloadDocumentTypeForm>(defaultValue);
  const [formError, setFormError] = useState<FormError>({});
  const tDocumentTypeForm = useTranslations('DocumentTypeForm');
  const apiClient = getApiClient();

  const handleOnChangeForm = (values: PayloadDocumentTypeForm) => {
    setFormValue(values);
  };

  const handleCreateNewDocumentType = async (payload: PromptCreatePayload) => {
    try {
      await apiClient.createPrompt(payload);
      enqueueSnackbar({ message: tDocumentTypeForm('saveSuccess'), variant: 'success' });
      reloadData?.();
    } catch (e) {
      enqueueSnackbar({ message: tDocumentTypeForm('saveFailure'), variant: 'error' });
      const errorMessage = extractErrorMessage(e);
      console.warn(`Error: ${errorMessage}`);
    } finally {
      setFormValue(defaultValue);
      onClose?.();
    }
  };

  const handleOnSave = async () => {
    const payload = preparePayload(formValue);
    if (validatePayloadValues(payload, tDocumentTypeForm)?.error) {
      setFormError(validatePayloadValues(payload, tDocumentTypeForm)?.errors);
      return;
    }
    setFormError({});
    await handleCreateNewDocumentType(payload);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'top' }} />
      <FullscreenModal
        body={{
          children: (
            <DocumentTypeForm
              formError={formError}
              formValue={formValue}
              onChange={handleOnChangeForm}
            />
          ),
        }}
        footer={{
          onClickCancel: onClose,
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClickSave: handleOnSave,
        }}
        header={{
          onBack: onClose,
          title: tDocumentTypeForm('documentTypeForm'),
        }}
        open={isOpen}
      />
    </LocalizationProvider>
  );
}

export default CreateDocumentTypeFromScratchModal;
