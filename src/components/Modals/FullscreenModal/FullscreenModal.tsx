import { Dialog, DialogContent as ModalBody } from '@mui/material';
import type { DialogContentProps as ModalBodyProps } from '@mui/material/DialogContent';
import React from 'react';

import type { ModalFooterProps } from './ModalFooter';
import ModalFooter from './ModalFooter';
import type { ModalHeaderProps } from './ModalHeader';
import ModalHeader from './ModalHeader';

interface FullscreenModalProps {
  body?: ModalBodyProps;
  children?: React.ReactNode;
  footer?: ModalFooterProps;
  header?: ModalHeaderProps;
  onClose?: () => void;
  open?: boolean;
}

function FullscreenModal({
  body,
  children,
  footer,
  header,
  onClose,
  open = false,
}: FullscreenModalProps) {
  return (
    <Dialog fullScreen onClose={onClose} open={open}>
      {children || (
        <>
          <ModalHeader {...header} />
          <ModalBody {...body} />
          <ModalFooter {...footer} />
        </>
      )}
    </Dialog>
  );
}

export default FullscreenModal;
