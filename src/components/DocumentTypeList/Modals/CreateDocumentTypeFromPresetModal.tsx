'use client';

import { Box, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterLuxon } from '@mui/x-date-pickers-pro/AdapterLuxon';
import type { Prompt } from '@nstypes/templateless';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';

import Loading from '@/app/loading';
import NotificationModal from '@/components/Document/DocumentHeader/Modals/NotificationModal';
import type {
  FormError,
  PayloadDocumentTypeForm,
} from '@/components/DocumentTypeForm/DocumentTypeForm';
import DocumentTypeForm from '@/components/DocumentTypeForm/DocumentTypeForm';
import FullscreenModal from '@/components/Modals/FullscreenModal';
import { PATHS } from '@/constants';
import { getApiClient } from '@/services/api';
import type { PromptCreatePayload } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import { extractErrorMessage, isChangedFormValue } from '@/utils';

import { preparePayload, validatePayloadValues } from '../utils';

interface CreateDocumentTypeFromPresetModalProps {
  data?: PayloadDocumentTypeForm;
  isCopyPreset?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  promptId?: number | string;
  reloadData?: () => void;
}

export const transformPromptResponseToPromptValue = (data: Prompt) => ({
  documentType: data.documentType,
  extractTable: data.extractTable,
  name: data.name,
  ...(data.userCustomInstructions
    ? { userCustomInstructions: data.userCustomInstructions }
    : {}),
  ...(data.fieldsPrompt ? { fieldsPrompt: data.fieldsPrompt } : {}),
  ...(data.tablePrompt?.length
    ? { tablePrompt: data.tablePrompt || [] }
    : {
        textualTablePrompt: data.textualTablePrompt || '',
      }),
});

function CreateDocumentTypeFromPresetModal({
  data,
  isCopyPreset = false,
  isOpen = false,
  onClose,
  promptId,
  reloadData,
}: CreateDocumentTypeFromPresetModalProps) {
  const defaultValue = data || {
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

  const [loading, setLoading] = useState<boolean>(false);
  const [warning, setWarning] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const [formValue, setFormValue] = useState<PayloadDocumentTypeForm>(defaultValue);
  const [formValueTemp, setFormValueTemp] =
    useState<PayloadDocumentTypeForm>(defaultValue);

  const [formError, setFormError] = useState<FormError>({});

  const catchError = (e: any) => {
    enqueueSnackbar({ message: tDocumentTypeForm('saveFailure'), variant: 'error' });
    const errorMessage = extractErrorMessage(e);
    console.warn(`Error: ${errorMessage}`);
  };

  const getPresetCopy = async () => {
    if (!promptId) {
      return;
    }
    try {
      setLoading(true);
      const newData = await apiClient.getCopyPreset(promptId);
      setFormValue(transformPromptResponseToPromptValue(newData));
      setFormValueTemp(transformPromptResponseToPromptValue(newData));
    } catch (e) {
      catchError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOnChangeForm = (values: PayloadDocumentTypeForm) => {
    setHasChanged(isChangedFormValue(formValueTemp, values));
    setFormValue(values);
  };

  const handleCreateNewDocumentType = async (payload: PromptCreatePayload) => {
    try {
      await apiClient.createPrompt(payload);
      enqueueSnackbar({ message: tDocumentTypeForm('saveSuccess'), variant: 'success' });
      reloadData?.();
    } catch (e) {
      catchError(e);
    } finally {
      setFormValue(defaultValue);
      onClose?.();
    }
  };

  const handleOnClose = () => {
    if (hasChanged) {
      setWarning(true);
    } else {
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

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getPresetCopy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'top' }} />
      {loading ? (
        <Loading />
      ) : (
        <FullscreenModal
          body={{
            children: (
              <DocumentTypeForm
                formError={formError}
                formValue={formValue}
                isCopyPreset={isCopyPreset}
                onChange={handleOnChangeForm}
              />
            ),
          }}
          footer={{
            onClickCancel: handleOnClose,
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClickSave: handleOnSave,
          }}
          header={{
            onBack: handleOnClose,
            title: tDocumentTypeForm('documentTypeForm'),
          }}
          open={isOpen}
        />
      )}
      <NotificationModal
        description={tDocumentTypeForm('confirmContent')}
        footer={
          <Box display="flex" gap="8px" justifyContent="flex-end" mt="16px" width="100%">
            <Button color="error" onClick={handleOnCloseModal}>
              {tDocumentTypeForm('confirmDiscard')}
            </Button>
            <Button
              color="primary"
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
    </LocalizationProvider>
  );
}

export default CreateDocumentTypeFromPresetModal;
