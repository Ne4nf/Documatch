import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  styled,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

import CustomModal from '@/components/CustomModal/CustomModal';
import type { MimeType } from '@/constants';
import { MIME_TYPES } from '@/constants';

type DownloadModalProps = {
  handleExport: (
    id: string,
    name: string,
    format: MimeType,
    isExcel: boolean,
    includeMetadata?: boolean,
  ) => Promise<void>;
  id: string;
  isLoading: { csv: boolean; excel: boolean };
  isOpen: boolean;
  name: string;
  setIsOpen: (param: boolean) => void;
};

const InputText = styled('input')(() => ({
  '::placeholder': {
    color: '#C5C5C5',
  },
  border: '1px solid #E8E8E8',
  borderRadius: '2px',
  height: '40px',
  marginBottom: '4px',
  padding: '10px 8px',
  width: '100%',
}));

const ButtonGroup = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
}));

const DownloadButton = styled(Button)(() => ({
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  border: '1px solid #03A9F4',
  borderRadius: '2px',
  color: '#0D8DC7',
  display: 'flex',
  fontSize: '14px',
  fontWeight: 500,
  gap: '6px',
  padding: '10px 16px',
  textTransform: 'none',
  width: '126px',
}));

type BodyContentProps = {
  fileName: string;
  includeMetadata: boolean;
  option: string;
  setFileName: (param: string) => void;
  setIncludeMetadata: (param: boolean) => void;
  setOption: (param: string) => void;
};

type FooterContentProps = {
  handleExportCsv: () => void;
  handleExportExcel: () => void;
  isLoading: { csv: boolean; excel: boolean };
};

export default function DownloadModal({
  handleExport,
  id,
  isLoading,
  isOpen,
  name,
  setIsOpen,
}: DownloadModalProps) {
  const tDownload = useTranslations('Download');

  const [fileName, setFileName] = useState<string>('');
  const [option, setOption] = useState<string>('whole_document');
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(false);

  const handleClose = () => {
    setIsOpen(false);
    setFileName('');
    setOption('whole_document');
  };

  return (
    <CustomModal
      bodyContent={
        <BodyContent
          fileName={fileName}
          includeMetadata={includeMetadata}
          option={option}
          setFileName={setFileName}
          setIncludeMetadata={setIncludeMetadata}
          setOption={setOption}
        />
      }
      data-testid="downloadModal"
      footerContent={
        <FooterContent
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          handleExportCsv={() =>
            handleExport(
              id,
              fileName || name,
              option === 'whole_document' ? MIME_TYPES.CSV : MIME_TYPES.CSV_GROUP,
              false,
              includeMetadata,
            )
          }
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          handleExportExcel={() =>
            handleExport(
              id,
              fileName || name,
              option === 'whole_document' ? MIME_TYPES.EXCEL : MIME_TYPES.EXCEL_GROUP,
              true,
              includeMetadata,
            )
          }
          isLoading={isLoading}
        />
      }
      handleCloseModal={handleClose}
      isModalOpen={isOpen}
      title={tDownload('download')}
      titleSize="medium"
      width={518}
    />
  );
}

function BodyContent({
  fileName,
  includeMetadata,
  option,
  setFileName,
  setIncludeMetadata,
  setOption,
}: BodyContentProps) {
  const tDownload = useTranslations('Download');

  return (
    <Box>
      <Typography color="black" fontSize={14} marginBottom="4px">
        {tDownload('filename')}
      </Typography>

      <InputText
        onChange={e => setFileName(e.target.value)}
        placeholder={tDownload('placeholder')}
        value={fileName}
      />

      <Typography color="#797979" fontSize={12} marginBottom="16px">
        {tDownload('customize')}
      </Typography>

      <Typography color="#C5C5C5" fontSize={14} fontWeight={500}>
        {tDownload('downloadType')}
      </Typography>

      <FormControl sx={{ marginBottom: '4px' }}>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="whole_document"
          name="download_type"
        >
          <FormControlLabel
            checked={option === 'whole_document'}
            control={<Radio />}
            label={tDownload('wholeDocument')}
            onChange={() => setOption('whole_document')}
            value="whole_document"
          />

          <FormControlLabel
            checked={option === 'group_by_group'}
            control={<Radio />}
            label={tDownload('groupByGroup')}
            onChange={() => setOption('group_by_group')}
            value="group_by_group"
          />
        </RadioGroup>
        <FormControlLabel
          checked={includeMetadata}
          control={<Checkbox />}
          label={tDownload('includeMetadata')}
          onChange={(_, checked) => setIncludeMetadata(checked)}
        />
      </FormControl>
    </Box>
  );
}

function FooterContent({
  handleExportCsv,
  handleExportExcel,
  isLoading,
}: FooterContentProps) {
  const tDownload = useTranslations('Download');

  return (
    <ButtonGroup>
      <Typography color="#C5C5C5" fontSize={16} textAlign="right">
        {tDownload('downloadAs')}
      </Typography>

      <DownloadButton
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleExportCsv}
      >
        {isLoading.csv && <CircularProgress size={24} />}
        {!isLoading.csv && (
          <>
            {tDownload('csvFile')}{' '}
            <Image alt="logo" height={24} src="/icons/csv.svg" width={24} />
          </>
        )}
      </DownloadButton>

      <DownloadButton
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleExportExcel}
      >
        {isLoading.excel && <CircularProgress size={24} />}
        {!isLoading.excel && (
          <>
            {tDownload('excelFile')}{' '}
            <Image alt="logo" height={24} src="/icons/excel.svg" width={24} />
          </>
        )}
      </DownloadButton>
    </ButtonGroup>
  );
}
