'use client';

import Close from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { RawDocument } from '@netsmile/page-edit-component';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import DocumentCustomGroupingModal from './DocumentCustomGrouping';
import { DocumentTypeModal } from './DocumentTypeModal';
import { handleCloseModal } from './utils';

export const MAX_PAGES_PER_GROUP = 6;

interface DocumentRescanModalProps {
  data: RawDocument;
  isModalOpen: boolean;
  isScanScreen?: boolean;
  refreshDocument?: () => Promise<boolean>;
  setIsModalOpen: (value: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const RescanForm = styled(FormControl)(() => ({
  '& .MuiBox-root': {
    height: '134px',
    paddingBottom: '4px',
    paddingLeft: '16px',
    paddingRight: '16px',
  },
  '& .MuiFormLabel-root': {
    '& .MuiTypography-root': {
      color: 'black',
      fontSize: '24px',
      fontWeight: '700',
      lineHeight: '32px',
    },
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px',
    width: '100%',
  },
  '& .MuiInputBase-root': {
    color: 'black',
    height: '40px ',
    marginTop: '12px',
    textColor: 'black',
    width: '100%',
  },

  '& .MuiStack-root': {
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    flexDirection: 'row',
    gap: '8px',
    height: '74px',
    justifyContent: 'flex-end',
    padding: '16px',
  },
  '& .MuiStack-root-custom-for-checkbox': {
    backgroundColor: '#FFFFFF',
    height: '50px',
    justifyContent: 'flex-start',
    padding: '0px',
  },
  minWidth: '451px',
}));

export default function DocumentRescanModal({
  data,
  isModalOpen,
  isScanScreen = false,
  refreshDocument,
  setIsModalOpen,
  setLoading,
}: DocumentRescanModalProps) {
  const [error, setError] = useState(false);
  const [rescanValue, setRescanValue] = useState('');
  const [isCustomGroupingModalOpen, setIsCustomGroupingModalOpen] = useState(false);
  const [isDocumentTypeModalOpen, setIsDocumentTypeModalOpen] = useState(false);
  const tDocumentRescan = useTranslations('DocumentRescan');
  const tActions = useTranslations('Actions');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rescanValue) {
      setError(true);
    }

    setIsModalOpen(false);

    if (rescanValue === 'customDocumentGrouping') {
      setIsCustomGroupingModalOpen(true);
    } else {
      setIsDocumentTypeModalOpen(true);
    }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRescanValue(event.target.value);
    setError(false);
  };

  return (
    <>
      <Dialog onClose={() => setIsModalOpen(false)} open={isModalOpen}>
        <Box>
          <form onSubmit={handleSubmit}>
            <RescanForm error={error} fullWidth>
              <FormLabel>
                <Typography>
                  {isScanScreen
                    ? tDocumentRescan('scanWholeDocument')
                    : tDocumentRescan('rescanWholeDocument')}
                </Typography>
                <IconButton
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={() =>
                    handleCloseModal(() => setIsModalOpen(false), isScanScreen, data.id)
                  }
                >
                  <Close />
                </IconButton>
              </FormLabel>
              <Divider />
              <Box>
                <RadioGroup onChange={handleRadioChange} value={rescanValue}>
                  <Tooltip
                    arrow
                    disableHoverListener={data?.pages?.length <= MAX_PAGES_PER_GROUP}
                    placement="top"
                    title={tDocumentRescan('pageLimitPerGroup')}
                  >
                    <FormControlLabel
                      control={<Radio />}
                      disabled={data?.pages?.length > MAX_PAGES_PER_GROUP}
                      label={tDocumentRescan('treatWholePDFAsOneGroup')}
                      value="treatWholePDFAsOneGroup"
                    />
                  </Tooltip>
                  <FormControlLabel
                    control={<Radio />}
                    label={tDocumentRescan('treatEachPageAsOneGroup')}
                    value="treatEachPageAsOneGroup"
                  />
                  <FormControlLabel
                    control={<Radio />}
                    label={tDocumentRescan('customDocumentGrouping')}
                    value="customDocumentGrouping"
                  />
                </RadioGroup>
                {error && (
                  <FormHelperText>{tDocumentRescan('selectAnOption')}</FormHelperText>
                )}
              </Box>
              <Stack>
                <Button
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={() =>
                    handleCloseModal(() => setIsModalOpen(false), isScanScreen, data.id)
                  }
                  variant="outlined"
                >
                  {tActions('cancel')}
                </Button>
                <Button
                  disabled={rescanValue === ''}
                  onClick={() => setIsModalOpen(false)}
                  type="submit"
                  variant="contained"
                >
                  {tDocumentRescan('next')}
                </Button>
              </Stack>
            </RescanForm>
          </form>
        </Box>
      </Dialog>
      <DocumentTypeModal
        closeModal={() => {
          setIsDocumentTypeModalOpen(false);
          setIsModalOpen(false);
        }}
        data={data}
        isModalOpen={isDocumentTypeModalOpen}
        isScanScreen={isScanScreen}
        refreshDocument={refreshDocument}
        rescanValue={rescanValue}
        setLoading={setLoading}
      />
      <DocumentCustomGroupingModal
        closeModal={() => setIsCustomGroupingModalOpen(false)}
        data={data}
        isModalOpen={isCustomGroupingModalOpen}
        isScanScreen={isScanScreen}
        openRescanModal={() => setIsModalOpen(true)}
        refreshDocument={refreshDocument}
        setLoading={setLoading}
      />
    </>
  );
}
