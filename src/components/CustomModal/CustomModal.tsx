import ClearIcon from '@mui/icons-material/Clear';
import { Box, Modal, styled, Typography } from '@mui/material';
import type React from 'react';

type CustomModalProps = {
  bodyContent: React.ReactNode;
  footerContent?: React.ReactNode;
  handleCloseModal: () => void;
  headerContent?: React.ReactNode;
  isModalOpen: boolean;
  title?: string;
  titleSize?: 'medium' | 'small';
  width: number;
};

const ModalContainer = styled(Box)(() => ({
  backgroundColor: 'white',
  boxShadow:
    '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
  left: '50%',
  outline: 0,
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
}));

const ModalHeader = styled(Box)(() => ({
  alignItems: 'center',
  borderBottom: '1px solid #E8E8E8',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px',
}));

const TitleContainer = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  gap: '8px',
  marginTop: '2px',
}));

export const SmallTitle = styled(Typography)(() => ({
  color: 'black',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: '24px',
}));

export const MediumTitle = styled(Typography)(() => ({
  color: 'black',
  fontSize: '24px',
  fontWeight: 600,
  lineHeight: '32px',
}));

const CloseIconWrapper = styled(Box)(() => ({
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
}));

const ModalBody = styled(Box)(() => ({
  borderBottom: '1px solid #E8E8E8',
  padding: '12px',
}));

const ModalFooter = styled(Box)(() => ({
  backgroundColor: '#F4F4F4',
  padding: '16px',
}));

function CustomModal({
  bodyContent,
  footerContent,
  handleCloseModal,
  headerContent,
  isModalOpen,
  title,
  titleSize,
  width,
}: CustomModalProps) {
  return (
    <Modal
      aria-describedby="modal-modal-description"
      aria-labelledby="modal-modal-title"
      onClose={() => handleCloseModal()}
      open={isModalOpen}
    >
      <ModalContainer sx={{ width }}>
        {headerContent || (
          <ModalHeader>
            <TitleContainer>
              {titleSize === 'small' ? (
                <SmallTitle id="modal-modal-title">{title}</SmallTitle>
              ) : (
                <MediumTitle id="modal-modal-title">{title}</MediumTitle>
              )}
            </TitleContainer>
            <CloseIconWrapper onMouseDown={() => handleCloseModal()} role="presentation">
              <ClearIcon style={{ fontSize: '28px' }} />
            </CloseIconWrapper>
          </ModalHeader>
        )}

        <ModalBody
          sx={
            footerContent
              ? {}
              : {
                  padding: '0',
                }
          }
        >
          {bodyContent}
        </ModalBody>

        {footerContent && <ModalFooter>{footerContent}</ModalFooter>}
      </ModalContainer>
    </Modal>
  );
}
export default CustomModal;
