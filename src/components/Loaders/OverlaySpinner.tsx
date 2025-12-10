import { Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import React from 'react';

import { Z_INDEX } from '@/constants';

const Overlay = styled(Box)({
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  left: 0,
  position: 'fixed',
  top: 0,
  width: '100%',
  zIndex: Z_INDEX.OVERLAY_SPINNER_Z,
});

function OverlaySpinner() {
  return (
    <Overlay>
      <CircularProgress />
    </Overlay>
  );
}

export { OverlaySpinner };
