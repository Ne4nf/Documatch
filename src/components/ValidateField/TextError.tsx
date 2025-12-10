import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

export interface TextErrorProps extends BoxProps {
  children: React.ReactNode;
}

export default function TextError({ children, sx }: TextErrorProps) {
  if (children) {
    return (
      <Box
        sx={{
          alignItems: 'flex-end',
          display: 'flex',
          justifyItems: 'flex-end',
          ...sx,
        }}
      >
        <Typography
          sx={{
            color: '#C30D23',
            fontFamily: 'monospace',
            fontSize: '8px',
            fontWeight: 700,
            margin: 0,
            mr: '4px',
          }}
        >
          ※
        </Typography>
        <Typography
          sx={{
            color: '#C30D23',
            fontSize: '9px',
            fontWeight: 500,
          }}
        >
          {children}
        </Typography>
      </Box>
    );
  }
  return null;
}
