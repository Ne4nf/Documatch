import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import React, { useEffect, useRef } from 'react';

import TextError from './TextError';

export type HelperTextPosition = 'bottom' | 'top';

export interface ValidateFieldProps extends BoxProps {
  children: React.ReactNode;
  error?: boolean;
  helperText?: React.ReactNode;
  helperTextPosition?: HelperTextPosition;
  isScrollToErrorEnabled?: boolean;
  withBorder?: boolean;
}

export default function ValidateField({
  children,
  error,
  helperText,
  helperTextPosition = 'bottom',
  isScrollToErrorEnabled = true,
  style,
  sx,
  withBorder = true,
}: ValidateFieldProps) {
  const helperTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // this function scroll to the element on error
    if (helperTextRef.current) {
      const topPosition =
        helperTextRef.current.getBoundingClientRect().top + window.scrollY - 120;
      if (error && isScrollToErrorEnabled) {
        window.scrollTo({
          behavior: 'smooth',
          top: topPosition,
        });
      }
    }
  }, [error, isScrollToErrorEnabled]);

  return (
    <Box
      style={style}
      sx={{
        position: 'relative',
        ...sx,
        ...(error && withBorder ? { border: '1.5px solid #C30D23' } : {}),
      }}
    >
      <Box ref={helperTextRef}>
        <Fade {...(error ? { timeout: 1000 } : {})} in={error}>
          <Box>
            <TextError
              sx={{
                ...(helperTextPosition === 'top' ? { top: -16 } : { bottom: -16 }),
                left: 0,
                position: 'absolute',
              }}
            >
              {helperText}
            </TextError>
          </Box>
        </Fade>
      </Box>
      {children}
    </Box>
  );
}
