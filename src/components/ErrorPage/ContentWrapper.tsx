'use client';

import { styled } from '@mui/material/styles';

const ContentWrapper = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  gap: theme.spacing(2),
}));

export default ContentWrapper;
export { ContentWrapper };
