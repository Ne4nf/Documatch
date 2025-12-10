import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { Z_INDEX } from '@/constants';

function Loading() {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        left: 0,
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: Z_INDEX.OVERLAY_SPINNER_Z,
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default Loading;
