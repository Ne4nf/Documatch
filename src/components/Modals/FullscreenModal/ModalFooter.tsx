'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import { styled } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import * as React from 'react';

const WrapperContainer = styled(DialogActions)(() => ({
  alignItems: 'center',
  backgroundColor: '#F4F4F4',
  borderBottom: '1px solid #E8E8E8',
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
  maxWidth: '100%',
  padding: '16px',
  textTransform: 'capitalize',
}));

const StyledButton = styled(Button)(() => ({
  alignItems: 'center',
  borderRadius: '2px',
  display: 'flex',
  gap: '6px',
  textTransform: 'capitalize',
}));

export interface ModalFooterProps {
  cancelProps?: ButtonProps;
  deleteProps?: ButtonProps;
  iconCancel?: React.ReactNode;
  iconDelete?: React.ReactNode;
  iconSave?: React.ReactNode;
  onClickCancel?: () => void;
  onClickDelete?: () => void;
  onClickSave?: () => void;
  saveProps?: ButtonProps;
  textCancel?: string;
  textDelete?: string;
  textSave?: string;
}

function ModalFooter({
  cancelProps,
  deleteProps,
  iconCancel = null,
  iconDelete = <DeleteIcon />,
  iconSave = <SaveIcon />,
  onClickCancel,
  onClickDelete,
  onClickSave,
  saveProps,
  textCancel,
  textDelete,
  textSave,
}: ModalFooterProps) {
  const t = useTranslations('ModalFooter');
  return (
    <WrapperContainer>
      <StyledButton
        color="primary"
        onClick={onClickCancel}
        sx={{ marginTop: '2.5px' }}
        variant="outlined"
        {...cancelProps}
      >
        {iconCancel}
        {textCancel || t('cancel')}
      </StyledButton>
      {textDelete && (
        <StyledButton
          color="error"
          onClick={onClickDelete}
          sx={{ color: 'white' }}
          variant="contained"
          {...deleteProps}
        >
          {iconDelete}
          {textDelete}
        </StyledButton>
      )}
      <StyledButton
        onClick={onClickSave}
        sx={{ color: 'white' }}
        variant="contained"
        {...saveProps}
      >
        {iconSave}
        {textSave || t('save')}
      </StyledButton>
    </WrapperContainer>
  );
}

export default ModalFooter;
export { ModalFooter };
