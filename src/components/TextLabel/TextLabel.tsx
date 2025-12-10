import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import React from 'react';

export interface TextLabelProps {
  [key: string]: any;
  borderColor?: string;
  children: React.ReactNode;
  isBorderLeft?: boolean;
  isRequired?: boolean;
  styleWrap?: React.CSSProperties;
}

export default function TextLabel({
  borderColor = 'primary.main',
  children,
  isBorderLeft = false,
  isRequired,
  styleWrap,
  ...props
}: TextLabelProps) {
  const defaultTextStyle = {
    color: '#000',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: '17px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };
  const styleBorderLeft = isBorderLeft
    ? {
        borderLeftColor: borderColor,
        borderLeftStyle: 'solid',
        borderLeftWidth: '12px',
        paddingLeft: '10px',
      }
    : {};
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'flex-start',
        width: 'fit-content',
        ...styleWrap,
      }}
    >
      <Box
        sx={{
          alignItems: 'center !important',
          display: 'flex',
          justifyItems: 'center !important',
          ...styleBorderLeft,
        }}
      >
        <Typography align="center" sx={{ ...defaultTextStyle }} {...props}>
          {children}
        </Typography>
        {isRequired && (
          <Box
            sx={{
              alignItems: 'center !important',
              display: 'flex',
              flexDirection: 'column',
              justifyItems: 'center !important',
              marginLeft: '4px',
              marginTop: '4px',
            }}
          >
            <Image alt="required" height={14} priority src="/required.svg" width={14} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
