'use client';

import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  styled,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { Noto_Sans_JP as NotoSansJP } from 'next/font/google';
import { enqueueSnackbar } from 'notistack';
import type { BaseSyntheticEvent } from 'react';
import { useState } from 'react';

import CustomModal from '@/components/CustomModal/CustomModal';
import { getApiClient } from '@/services/api';
import { extractErrorMessage } from '@/utils';

const notoSansJP = NotoSansJP({
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

const ButtonGroup = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
}));

const SendButton = styled(Button)(() => ({
  backgroundColor: '#03A9F4',
  borderRadius: '2px',
  color: 'white',
  fontSize: '14px',
  fontWeight: 500,
  padding: '10px 26px',
  width: '90px',
}));

const CancelButton = styled(Button)(() => ({
  backgroundColor: 'white',
  border: '1px solid #03A9F4',
  borderRadius: '2px',
  color: '#0D8DC7',
  fontSize: '14px',
  fontWeight: 500,
  padding: '10px 18px',
}));

const Textarea = styled('textarea')(() => ({
  '::placeholder': {
    color: '#C5C5C5',
  },
  border: '1px solid #E8E8E8',
  borderRadius: '2px',
  fontFamily: notoSansJP.style.fontFamily,
  fontSize: '14px',
  height: '72px',
  margin: '4px 0 0 32px',
  marginLeft: '32px',
  padding: '10px 8px',
  resize: 'none',
  width: 'calc(100% - 32px)',
}));

type BodyContentProps = {
  feedback: string;
  option: string;
  setFeedback: (param: string) => void;
  setOption: (param: string) => void;
  setShowEmptyInputError: (param: boolean) => void;
  showEmptyInputError: boolean;
};

type FeedbackModalProps = {
  documentId: string;
  isOpen: boolean;
  setIsOpen: (param: boolean) => void;
};

type FooterContentProps = {
  handleClose: () => void;
  handleSendFeedback: () => Promise<void>;
  isSending: boolean;
};

export default function FeedbackModal({
  documentId,
  isOpen,
  setIsOpen,
}: FeedbackModalProps) {
  const tFeedback = useTranslations('Feedback');
  const [option, setOption] = useState<string>('0');
  const [feedback, setFeedback] = useState<string>(tFeedback('option1'));
  const [showEmptyInputError, setShowEmptyInputError] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const apiClient = getApiClient();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSendFeedback = async () => {
    if (feedback === '') {
      setShowEmptyInputError(true);
    } else {
      setIsSending(true);

      try {
        await apiClient.sendFeedback(documentId, feedback);

        setIsOpen(false);
        enqueueSnackbar({
          message: `${tFeedback('sendSuccess')}`,
          variant: 'success',
        });
      } catch (e) {
        const errorMessage = extractErrorMessage(e);
        enqueueSnackbar({
          message: `${tFeedback('sendFailure')}: ${errorMessage}`,
          variant: 'error',
        });
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <CustomModal
      bodyContent={
        <BodyContent
          feedback={feedback}
          option={option}
          setFeedback={setFeedback}
          setOption={setOption}
          setShowEmptyInputError={setShowEmptyInputError}
          showEmptyInputError={showEmptyInputError}
        />
      }
      footerContent={
        <FooterContent
          handleClose={handleClose}
          handleSendFeedback={handleSendFeedback}
          isSending={isSending}
        />
      }
      handleCloseModal={handleClose}
      isModalOpen={isOpen}
      title={tFeedback('title')}
      titleSize="small"
      width={518}
    />
  );
}

function BodyContent({
  feedback,
  option,
  setFeedback,
  setOption,
  setShowEmptyInputError,
  showEmptyInputError,
}: BodyContentProps) {
  const tFeedback = useTranslations('Feedback');

  const handleChooseOption = (e: BaseSyntheticEvent, optionKey: string) => {
    setOption(e.target.value);
    if (optionKey === 'option4') {
      setFeedback('');
      setShowEmptyInputError(false);
    } else {
      setFeedback(tFeedback(optionKey));
    }
  };

  return (
    <Box>
      <Typography color="#C5C5C5" fontSize={14} marginBottom="8px">
        {tFeedback('note')}
      </Typography>

      <FormControl sx={{ marginBottom: '4px', width: '100%' }}>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          name="feedback"
          value={option}
        >
          <FormControlLabel
            control={<Radio />}
            label={
              <Typography color="#242222" fontSize={14}>
                {tFeedback('option1')}
              </Typography>
            }
            onChange={e => handleChooseOption(e, 'option1')}
            value="0"
          />

          <FormControlLabel
            control={<Radio />}
            label={
              <Typography color="#242222" fontSize={14}>
                {tFeedback('option2')}
              </Typography>
            }
            onChange={e => handleChooseOption(e, 'option2')}
            value="1"
          />

          <FormControlLabel
            control={<Radio />}
            label={
              <Typography color="#242222" fontSize={14}>
                {tFeedback('option3')}
              </Typography>
            }
            onChange={e => handleChooseOption(e, 'option3')}
            value="2"
          />

          <FormControlLabel
            control={<Radio />}
            label={
              <Typography color="#242222" fontSize={14}>
                {tFeedback('option4')}
              </Typography>
            }
            onChange={e => handleChooseOption(e, 'option4')}
            value="3"
          />
        </RadioGroup>

        {option === '3' && (
          <Textarea
            onChange={e => {
              setFeedback(e.target.value);
              setShowEmptyInputError(false);
            }}
            placeholder={tFeedback('placeholder')}
            sx={
              showEmptyInputError
                ? {
                    borderColor: 'red',
                  }
                : {}
            }
            value={feedback}
          />
        )}
      </FormControl>
    </Box>
  );
}

function FooterContent({
  handleClose,
  handleSendFeedback,
  isSending,
}: FooterContentProps) {
  const tFeedback = useTranslations('Feedback');

  return (
    <ButtonGroup>
      <CancelButton onClick={handleClose}>{tFeedback('cancel')}</CancelButton>

      <SendButton
        disabled={isSending}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleSendFeedback}
      >
        {isSending ? (
          <CircularProgress size={24} sx={{ color: 'white' }} />
        ) : (
          tFeedback('send')
        )}
      </SendButton>
    </ButtonGroup>
  );
}
