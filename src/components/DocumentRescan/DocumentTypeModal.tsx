import { Close } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  Divider,
  FormHelperText,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { RawDocument } from '@netsmile/page-edit-component';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useDocumentDataStore } from '@/providers/document-data-store-provider';
import { useGlobalDataStore } from '@/providers/global-data-store-provider';

import { RescanForm } from './DocumentRescanModal';
import { treatEachPageAsOneGroup, treatWholePdfAsOneGroup } from './handler';
import { handleCloseModal } from './utils';

interface DocumentTypeModalProps {
  closeModal: () => void;
  data: RawDocument;
  isModalOpen: boolean;
  isScanScreen?: boolean;
  refreshDocument?: () => Promise<boolean>;
  rescanValue: string;
  setLoading: (loading: boolean) => void;
}

export function DocumentTypeModal({
  closeModal,
  data,
  isModalOpen,
  isScanScreen = false,
  refreshDocument,
  rescanValue,
  setLoading,
}: DocumentTypeModalProps) {
  const [promptName, setPromptName] = useState<string>('');
  const [error, setError] = useState(false);
  const { prompts } = useGlobalDataStore(state => state);
  const promptNames = prompts.map(prompt => prompt.name);

  const tDocumentRescan = useTranslations('DocumentRescan');
  const tActions = useTranslations('Actions');
  const [useOcr, setUseOcr] = useState(false);
  const updateDocument = useDocumentDataStore(state => state.updateDocument);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!promptName) {
      setError(true);
    } else {
      const processRescan = async () => {
        try {
          if (rescanValue === 'treatEachPageAsOneGroup') {
            await treatEachPageAsOneGroup(data, promptName, prompts, useOcr);
          } else {
            await treatWholePdfAsOneGroup(data, promptName, prompts, useOcr);
          }

          if (isScanScreen && refreshDocument) {
            await refreshDocument();
          } else {
            await updateDocument(data.id);
          }
        } catch (submitError) {
          console.error('Error processing submission', submitError);
          throw submitError; // Re-throw to handle it outside if needed
        }
      };
      closeModal();
      setLoading(true);
      await processRescan();
      setLoading(false);
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    setPromptName(event.target.value);
  };

  return (
    <Dialog onClose={closeModal} open={isModalOpen}>
      <Box>
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit}
        >
          <RescanForm error={error} fullWidth>
            <FormLabel>
              <Typography>
                {isScanScreen
                  ? tDocumentRescan('scanWholeDocument')
                  : tDocumentRescan('rescanWholeDocument')}
              </Typography>
              <IconButton
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={() => handleCloseModal(closeModal, isScanScreen, data.id)}
              >
                <Close />
              </IconButton>
            </FormLabel>
            <Divider />
            <Box>
              <Typography>{tDocumentRescan('selectDocumentType')}</Typography>
              <Select onChange={handleChange} value={promptName}>
                {promptNames.map(id => (
                  <MenuItem key={id} value={id}>
                    {id}
                  </MenuItem>
                ))}
              </Select>
              <Stack className="MuiStack-root-custom-for-checkbox">
                <Checkbox
                  checked={useOcr}
                  onChange={() => {
                    if (useOcr) {
                      setUseOcr(false);
                    } else {
                      setUseOcr(true);
                    }
                  }}
                />
                <Typography>{tDocumentRescan('addOcrResult')}</Typography>
              </Stack>
              {error && (
                <FormHelperText>{tDocumentRescan('selectAnOption')}</FormHelperText>
              )}
            </Box>

            <Stack>
              <Button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={() => handleCloseModal(closeModal, isScanScreen, data.id)}
                variant="outlined"
              >
                {tActions('cancel')}
              </Button>
              <Button type="submit" variant="contained">
                {tDocumentRescan('scan')}
              </Button>
            </Stack>
          </RescanForm>
        </form>
      </Box>
    </Dialog>
  );
}
