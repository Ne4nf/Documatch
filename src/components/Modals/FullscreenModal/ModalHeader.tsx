'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Chip from '@mui/material/Chip';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';

const WrapperContainer = styled(DialogTitle)(() => ({
  alignItems: 'center',
  borderBottom: '1px solid #E8E8E8',
  display: 'flex',
  gap: '10px',
  maxWidth: '100%',
  padding: '12px',
}));

const TitleTypography = styled(Typography)(() => ({
  fontSize: '16px',
  fontWeight: '500',
  lineHeight: '24px',
}));

const TagTypography = styled(Typography)(() => ({
  alignItems: 'center',
  display: 'flex',
  fontSize: '12px',
  fontWeight: '400',
  lineHeight: '18px',
}));

export interface ModalHeaderProps {
  onBack?: () => void;
  tag?: string;
  title?: string;
}
function ModalHeader({ onBack, tag, title = 'Title' }: ModalHeaderProps) {
  return (
    <WrapperContainer>
      <IconButton sx={{ padding: 0 }}>
        <ArrowBackIcon onClick={onBack} />
      </IconButton>
      <TitleTypography noWrap>{title}</TitleTypography>
      {tag && (
        <Chip
          color="primary"
          label={<TagTypography>{tag}</TagTypography>}
          sx={{ bgcolor: '#EFFAFF', borderColor: '#7DC2E2' }}
          variant="outlined"
        />
      )}
    </WrapperContainer>
  );
}

export default ModalHeader;
export { ModalHeader };
