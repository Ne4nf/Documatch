import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import ErrorIcon from '@mui/icons-material/Error';
import { Box, IconButton } from '@mui/material';
import React, { useCallback, useEffect } from 'react';

import CustomModal, { SmallTitle } from '@/components/CustomModal/CustomModal';

type NotificationModalProps = {
  children?: React.ReactNode;
  customIcon?: React.ReactNode;
  description?: string;
  footer?: React.ReactNode;
  isError?: boolean;
  isSuccess?: boolean;
  isWarning?: boolean;
  onClose?: () => void;
  open: boolean;
  timer?: number;
  title?: string;
};

export default function NotificationModal({
  children,
  customIcon,
  description = '',
  footer,
  isError = false,
  isSuccess = false,
  isWarning = false,
  onClose,
  open = false,
  timer = 0,
  title = '',
}: NotificationModalProps) {
  const handleOnClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const renderHeader = () => {
    const content = (
      <SmallTitle sx={{ marginBottom: '4px', textTransform: 'capitalize' }}>
        {title}
      </SmallTitle>
    );
    const close = (
      <IconButton onClick={handleOnClose} sx={{ position: 'absolute', right: 0, top: 0 }}>
        <ClearIcon style={{ fontSize: '24px' }} />
      </IconButton>
    );
    const sxProps = {
      alignItems: 'center',
      borderBottom: '1px solid #E8E8E8',
      display: 'flex',
      gap: '4.5px',
      padding: '8px 16px',
      position: 'relative',
      width: '100%',
    };

    if (isError) {
      return (
        <Box sx={sxProps}>
          <CancelIcon sx={{ color: '#DB6C60', fontSize: '40px' }} />
          {content}
          {close}
        </Box>
      );
    }

    if (isWarning) {
      return (
        <Box sx={sxProps}>
          <ErrorIcon sx={{ color: '#FFD400', fontSize: '40px' }} />
          {content}
          {close}
        </Box>
      );
    }

    if (isSuccess) {
      return (
        <Box sx={sxProps}>
          <CheckCircle sx={{ color: '#63BA4B', fontSize: '40px' }} />
          {content}
          {close}
        </Box>
      );
    }

    return (
      <Box sx={sxProps}>
        {customIcon}
        {content}
        {close}
      </Box>
    );
  };

  useEffect(() => {
    if (timer === 0) {
      return;
    }
    setTimeout(() => {
      handleOnClose();
    }, timer);
  }, [handleOnClose, timer]);

  return (
    <CustomModal
      bodyContent={
        <Box display="flex" flexDirection="column" sx={{ padding: '12px 16px' }}>
          {description || children}
          {footer}
        </Box>
      }
      data-testid="NotificationModal"
      handleCloseModal={handleOnClose}
      headerContent={renderHeader()}
      isModalOpen={open}
      width={319}
    />
  );
}
