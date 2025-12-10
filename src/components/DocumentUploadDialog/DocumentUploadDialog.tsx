import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/material/styles';
import type { RawDocument } from '@netsmile/page-edit-component';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { CompactButton } from '@/components/Buttons';
import { Dropzone } from '@/components/Dropzone';
import { Linear } from '@/components/Loaders';
import { DocumentDataStoreProvider } from '@/providers/document-data-store-provider';
import { getApiClient } from '@/services/api';

import { DocumentRescanModal } from '../DocumentRescan';
import { DocumentTypeModal } from '../DocumentRescan/DocumentTypeModal';
import { UploadButton } from './UploadButton';

interface DocumentUploadDialogProps {
  refreshDocument: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
}

const UploadDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
}));

const apiClient = getApiClient();

function DocumentUploadDialog({
  refreshDocument,
  setLoading,
}: DocumentUploadDialogProps) {
  const t = useTranslations('DocumentUploadDialog');
  const [open, setOpen] = React.useState<boolean>(false);
  const [waitingForUpload, setWaitingForUpload] = React.useState<boolean>(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [data, setData] = React.useState<null | RawDocument>(null);
  const [isRescanModalOpen, setIsRescanModalOpen] = React.useState(false);
  const [isDocumentTypeModalOpen, setIsDocumentTypeModalOpen] = React.useState(false);
  const [tempDocumentId, setTempDocumentId] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    setWaitingForUpload(true);
    try {
      const res = await apiClient.createDocument(file);
      if (res) {
        setTempDocumentId(res.id);
      }
      await apiClient.reprocessDocument(res.id, 'standard');
      const documentData = await apiClient.getDocument(res.id);
      setData(documentData);
      setOpen(false);
      if (documentData.pages.length === 1) {
        setIsDocumentTypeModalOpen(true);
      } else {
        setIsRescanModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWaitingForUpload(false);
    }
  };

  const handleOnDrop = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
    }
  };

  const handleOnDelete = (_files: File[]) => {
    apiClient.abortRequest('documents/create');
    if (tempDocumentId) {
      apiClient.abortRequest(`documents/${tempDocumentId}/reprocess`, tempDocumentId);
    }
    setData(null);
    setFile(null);
    setWaitingForUpload(false);
  };

  return (
    <>
      <UploadButton onClick={handleClickOpen} />
      <UploadDialog fullWidth maxWidth="md" onClose={handleClose} open={open}>
        <DialogContent>
          <Dropzone
            error={false}
            helperText=""
            onDelete={handleOnDelete}
            onDrop={handleOnDrop}
          />
          {waitingForUpload && <Linear />}
        </DialogContent>
        <DialogActions>
          <CompactButton
            autoFocus
            disabled={waitingForUpload}
            onClick={handleClose}
            variant="contained"
          >
            {t('cancel')}
          </CompactButton>
          <CompactButton
            disabled={file === null || waitingForUpload}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={handleUpload}
            variant="contained"
          >
            {t('next')}
          </CompactButton>
        </DialogActions>
      </UploadDialog>

      {data && (
        <DocumentDataStoreProvider initialDocument={data}>
          <DocumentRescanModal
            data={data}
            isModalOpen={isRescanModalOpen}
            isScanScreen
            refreshDocument={refreshDocument}
            setIsModalOpen={setIsRescanModalOpen}
            setLoading={setLoading}
          />
          <DocumentTypeModal
            closeModal={() => setIsDocumentTypeModalOpen(false)}
            data={data}
            isModalOpen={isDocumentTypeModalOpen}
            isScanScreen
            refreshDocument={refreshDocument}
            rescanValue="treatWholePDFAsOneGroup"
            setLoading={setLoading}
          />
        </DocumentDataStoreProvider>
      )}
    </>
  );
}

export { DocumentUploadDialog };
export default DocumentUploadDialog;
