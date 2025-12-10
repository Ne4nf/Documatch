import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

import CenteredDiv from '@/components/CenteredDiv';

function Spinner() {
  return (
    <CenteredDiv>
      <CircularProgress />
    </CenteredDiv>
  );
}

export { Spinner };
