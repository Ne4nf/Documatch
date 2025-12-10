import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SaveIcon from '@mui/icons-material/Save';
import Unpublished from '@mui/icons-material/Unpublished';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { CallbackResult, RawDocument } from '@netsmile/page-edit-component';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';

import { ToolbarButtonWithTooltip } from '@/components/Buttons';
import DocumentNavigation from '@/components/Document/DocumentHeader/DocumentNavigation';
import PropertiesEditPopover from '@/components/Document/PropertiesEditPopover';
import { DocumentRescanModal } from '@/components/DocumentRescan';
import { DocumentTypeModal } from '@/components/DocumentRescan/DocumentTypeModal';
import ScanStatusIcon from '@/components/ScanStatusIcon';
import TextField from '@/components/TextField';
import TextLabel from '@/components/TextLabel';
import type { MimeType } from '@/constants';
import { DONE_STATUSES, FILE_EXTENSIONS, PATHS, SIZES } from '@/constants';
import { getApiClient } from '@/services/api';
import { extractErrorMessage, splitFilename } from '@/utils';

import DownloadModal from './Modals/DownloadModal';
import FeedbackModal from './Modals/FeedbackModal';

interface HeaderProps {
  data: RawDocument;
  handleSaveGroupsCorrections?: (correctedDocumentId: string) => CallbackResult;
  isReadyToSave?: boolean;
  setLoading: (loading: boolean) => void;
}

type UpdateDocumentPropertiesInputErrors = {
  documentName?: string;
  personInCharge?: string;
};

const ButtonGroup = styled('div')(() => ({
  alignItems: 'center',
  display: 'flex',
}));

const InputWrapper = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '10px',
  marginTop: '10px',
  width: '240px',
}));

const Label = styled(TextLabel)(() => ({
  marginRight: '10px',
  textWrap: 'nowrap',
  width: '80px',
}));

const Input = styled(TextField)(() => ({
  flex: 1,
  width: '200px',
}));

const DialogButton = styled(Button)(() => ({
  '& .MuiButton-startIcon': {
    position: 'relative',
    top: '-1px',
  },
}));

const RescanButton = styled(Button)(() => ({
  border: 'none',
  borderRadius: '2px',
  color: '#FFFFFF',
  padding: '9px 10px',
  textTransform: 'none',
}));

const HeaderWrapper = styled(Box)(() => ({
  display: 'flex',
  height: `${SIZES.DOCUMENT_HEADER_HEIGHT}px`,
  width: '100%',
}));

export function DocumentHeader(props: HeaderProps) {
  const tDocument = useTranslations('Document');
  const tActions = useTranslations('Actions');
  const tDocumentRescan = useTranslations('DocumentRescan');
  const apiClient = getApiClient();
  const router = useRouter();

  const { handleSaveGroupsCorrections, isReadyToSave, setLoading } = props;

  const [rawDocument, setRawDocument] = useState(props.data);
  const [documentName, setDocumentName] = useState(rawDocument.name);
  const [documentPropertiesInputErrors, setDocumentPropertiesInputErrors] =
    useState<UpdateDocumentPropertiesInputErrors>({});
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState({ csv: false, excel: false });

  const [isDocumentDeleteDialogOpen, setDocumentDeleteDialogOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocumentTypeModalOpen, setIsDocumentTypeModalOpen] = useState(false);

  const goBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(PATHS.DOCUMENT);
  };

  const handleExport = async (
    documentId: string,
    documentFileName: string,
    format: MimeType,
    isExcel: boolean,
    includeMetadata?: boolean,
  ) => {
    try {
      setIsLoading(isExcel ? { csv: false, excel: true } : { csv: true, excel: false });

      const blob = await apiClient.exportDocument(documentId, format, includeMetadata);

      const { baseName } = splitFilename(documentFileName);
      const exportFilename = `${baseName}.${FILE_EXTENSIONS[format]}`;

      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = exportFilename;
      link.click();

      window.URL.revokeObjectURL(url);
      setIsDownloadModalOpen(false);
    } catch (e) {
      const errorMessage = extractErrorMessage(e);
      enqueueSnackbar({
        message: `${tDocument('exportFailure')}: ${errorMessage}`,
        variant: 'error',
      });
    } finally {
      setIsLoading({ csv: false, excel: false });
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      setLoading(true);

      await apiClient.deleteDocument(documentId);

      router.push(PATHS.DOCUMENT);
    } catch (e) {
      const errorMessage = extractErrorMessage(e);
      enqueueSnackbar({
        message: `${tDocument('deleteFailure')}: ${errorMessage}`,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDocument = async (
    documentId: string,
    payload: Record<PropertyKey, unknown>,
  ) => {
    try {
      setLoading(true);
      const result = await apiClient.updateDocument(documentId, payload);
      setRawDocument(prevValue => ({ ...prevValue, ...result }));
      enqueueSnackbar({
        message: tDocument('saveSuccess'),
        variant: 'success',
      });

      return {
        ok: true,
      };
    } catch (e) {
      const errorMessage = (e instanceof Error && e.toString()) || 'Unknown error';
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

  const validateUpdateDocumentPropertiesInputs = () => {
    if (documentName === null || documentName.trim() === '') {
      setDocumentPropertiesInputErrors(prevValue => ({
        ...prevValue,
        documentName: 'Field cannot be empty',
      }));
    } else {
      setDocumentPropertiesInputErrors(prevValue =>
        prevValue ? (({ documentName: _, ...rest }) => rest)(prevValue) : prevValue,
      );
    }
  };

  const handleSave = () => {
    if (handleSaveGroupsCorrections) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleSaveGroupsCorrections(rawDocument?.id);
    }
  };

  return (
    <HeaderWrapper p={4} px={2}>
      <ButtonGroup sx={{ gap: '12px' }}>
        <ToolbarButtonWithTooltip
          aria-label={tDocument('documentBack')}
          onClick={goBack}
          text={tDocument('documentBack')}
        >
          <ArrowBackIcon sx={{ fontSize: '32px' }} />
        </ToolbarButtonWithTooltip>

        <ScanStatusIcon status={rawDocument?.status} />

        <PropertiesEditPopover
          buttonLabel={rawDocument.name}
          disableSaveButton={Object.keys(documentPropertiesInputErrors).length !== 0}
          onCloseWithoutSave={() => {
            setDocumentName(rawDocument.name);
          }}
          onSave={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            handleUpdateDocument(rawDocument.id, {
              name: documentName,
            });
          }}
        >
          <InputWrapper>
            <Label>{tDocument('documentName')}</Label>
            <Input
              error={!!documentPropertiesInputErrors.documentName}
              fullWidth
              onBlur={() => {
                validateUpdateDocumentPropertiesInputs();
              }}
              onChange={e => {
                setDocumentName(e.target.value);
              }}
              value={documentName}
            />
          </InputWrapper>
        </PropertiesEditPopover>
      </ButtonGroup>

      <ButtonGroup sx={{ marginLeft: 'auto' }}>
        <RescanButton
          onClick={() => {
            if (rawDocument.pages.length === 1) {
              setIsDocumentTypeModalOpen(true);
            } else {
              setIsModalOpen(true);
            }
          }}
          sx={{}}
          variant="contained"
        >
          {tDocumentRescan('rescanWholeDocument')}
        </RescanButton>
        <DocumentRescanModal
          data={rawDocument}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          setLoading={setLoading}
        />

        <DocumentTypeModal
          closeModal={() => setIsDocumentTypeModalOpen(false)}
          data={rawDocument}
          isModalOpen={isDocumentTypeModalOpen}
          rescanValue="treatWholePDFAsOneGroup"
          setLoading={setLoading}
        />

        <ToolbarButtonWithTooltip
          aria-label={
            rawDocument.confirmed
              ? tDocument('documentRemoveConfirm')
              : tDocument('documentConfirm')
          }
          disabled={DONE_STATUSES.indexOf(rawDocument.status) === -1}
          id="document-toggle-confirm"
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            handleUpdateDocument(rawDocument.id, {
              confirmed: !rawDocument.confirmed,
            });
          }}
          text={
            rawDocument.confirmed
              ? tDocument('documentRemoveConfirm')
              : tDocument('documentConfirm')
          }
        >
          {rawDocument.confirmed ? (
            <Unpublished sx={{ fontSize: '32px' }} />
          ) : (
            <CheckCircle sx={{ fontSize: '32px' }} />
          )}
        </ToolbarButtonWithTooltip>

        <ToolbarButtonWithTooltip
          aria-label={tDocument('documentExport')}
          disabled={rawDocument.status !== 'scanned'}
          id="export-document"
          onClick={() => setIsDownloadModalOpen(true)}
          text={tDocument('documentExport')}
        >
          <CloudDownloadIcon sx={{ fontSize: '32px' }} />
        </ToolbarButtonWithTooltip>

        <DownloadModal
          handleExport={handleExport}
          id={rawDocument?.id}
          isLoading={isLoading}
          isOpen={isDownloadModalOpen}
          name={rawDocument?.name}
          setIsOpen={(state: boolean) => setIsDownloadModalOpen(state)}
        />

        <ToolbarButtonWithTooltip
          aria-label={tActions('save')}
          disabled={rawDocument.status !== 'scanned' || isReadyToSave === false}
          id="save-document"
          onClick={handleSave}
          text={tActions('save')}
        >
          <SaveIcon sx={{ fontSize: '32px' }} />
        </ToolbarButtonWithTooltip>

        <ToolbarButtonWithTooltip
          aria-label={tActions('delete')}
          onClick={() => setDocumentDeleteDialogOpen(true)}
          text={tActions('delete')}
        >
          <DeleteIcon sx={{ color: 'rgb(255, 60, 0)', fontSize: '32px' }} />
        </ToolbarButtonWithTooltip>

        <Dialog
          onClose={() => setDocumentDeleteDialogOpen(false)}
          open={isDocumentDeleteDialogOpen}
        >
          <DialogContent>
            <DialogContentText>
              {tDocument('deleteConfirmationMessage')}
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <DialogButton
              data-testid="confirmDelete"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={() => handleDelete(rawDocument?.id)}
              startIcon={<DeleteIcon />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 60, 0, 1)',
                },
                backgroundColor: 'rgba(255, 60, 0, 0.8)',
                color: 'rgb(255, 255, 255)',
                padding: '10px 16px',
              }}
            >
              {tActions('delete')}
            </DialogButton>

            <DialogButton
              onClick={() => setDocumentDeleteDialogOpen(false)}
              startIcon={<CancelIcon />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 210, 0, 1)',
                },
                backgroundColor: 'rgba(0, 210, 0, 0.8)',
                color: 'rgb(40, 40, 40)',
                padding: '10px 16px',
              }}
            >
              {tActions('cancel')}
            </DialogButton>
          </DialogActions>
        </Dialog>

        <ToolbarButtonWithTooltip
          aria-label={tDocument('feedback')}
          disabled={rawDocument.status !== 'scanned'}
          id="feedback"
          onClick={() => setIsFeedbackModalOpen(true)}
          text={tDocument('feedback')}
        >
          <FeedbackIcon sx={{ fontSize: '32px' }} />
        </ToolbarButtonWithTooltip>

        <FeedbackModal
          documentId={rawDocument.id}
          isOpen={isFeedbackModalOpen}
          setIsOpen={(state: boolean) => setIsFeedbackModalOpen(state)}
        />

        <DocumentNavigation documentId={rawDocument.id} setLoading={setLoading} />
      </ButtonGroup>
    </HeaderWrapper>
  );
}
