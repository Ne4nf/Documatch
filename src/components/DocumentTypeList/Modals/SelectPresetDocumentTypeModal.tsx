'use client';

import { Box, Button, styled, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import CustomAutocomplete from '@/components/CustomAutocomplete/CustomAutoComplete';
import CustomModal from '@/components/CustomModal/CustomModal';
import type { AutocompleteOption } from '@/types';

const CancelButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  border: '1px solid',
  borderColor: theme.palette.primary.main,
  borderRadius: '2px',
  color: theme.palette.primary.main,
  fontSize: '14px',
  fontWeight: 500,
  height: '42px',
  lineHeight: '22px',
  textTransform: 'none',
  width: '114px',
}));

const SelectButton = styled(Button)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  backgroundColor: theme.palette.primary.main,
  borderRadius: '2px',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 500,
  height: '42px',
  lineHeight: '22px',
  textTransform: 'none',
  width: '114px',
}));

type BodyContentProps = {
  data: Option[];
  documentType: null | Option;
  onSelect: () => void;
  setDocumentType: (param: AutocompleteOption | null) => void;
};

type FooterContentProps = {
  onClose: () => void;
  onSelect: () => void;
};

type Option = {
  label: string;
  value: number | string;
};

type SelectPresetDocumentTypeModalProps = {
  data: Option[];
  documentType: null | Option;
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
  setDocumentType: (param: AutocompleteOption | null) => void;
};

export default function SelectPresetDocumentTypeModal({
  data,
  documentType,
  isOpen,
  onClose,
  onSelect,
  setDocumentType,
}: SelectPresetDocumentTypeModalProps) {
  const t = useTranslations('DocumentTypeList');
  return (
    <CustomModal
      bodyContent={
        <BodyContent
          data={data}
          documentType={documentType}
          onSelect={onSelect}
          setDocumentType={setDocumentType}
        />
      }
      footerContent={<FooterContent onClose={onClose} onSelect={onSelect} />}
      handleCloseModal={onClose}
      isModalOpen={isOpen}
      title={t('selectPresetTitle')}
      titleSize="medium"
      width={451}
    />
  );
}

function BodyContent({
  data,
  documentType,
  onSelect,
  setDocumentType,
}: BodyContentProps) {
  const t = useTranslations('DocumentTypeList');
  return (
    <Box>
      <Typography
        color="#242222"
        fontSize="14px"
        fontWeight={500}
        lineHeight="22px"
        marginBottom="8px"
      >
        {t('selectPresetDocumentType')}
      </Typography>

      <CustomAutocomplete
        onChange={(e, value: AutocompleteOption | null | string) => {
          if (typeof value !== 'string') {
            setDocumentType(value);
          }
        }}
        onKeyDownAction={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSelect();
          }
        }}
        options={data}
        placeholder={t('inputPresetName')}
        value={documentType}
      />
    </Box>
  );
}

function FooterContent({ onClose, onSelect }: FooterContentProps) {
  const t = useTranslations('DocumentTypeList');
  return (
    <Box
      sx={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
      }}
    >
      <CancelButton onClick={onClose}>{t('cancel')}</CancelButton>

      <SelectButton onClick={onSelect}>{t('select')}</SelectButton>
    </Box>
  );
}
