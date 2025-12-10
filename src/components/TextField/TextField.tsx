import type { TextFieldProps } from '@mui/material/TextField';
import MuiTextField from '@mui/material/TextField';
import { forwardRef } from 'react';

import type { HelperTextPosition } from '@/components/ValidateField';
import { ValidateField } from '@/components/ValidateField';

export interface TextFieldCustomProps extends Omit<TextFieldProps, 'maxLength'> {
  helperText?: any;
  helperTextPosition?: HelperTextPosition;
  maxLength?: number;
}

const TextField = forwardRef<HTMLInputElement, TextFieldCustomProps>(
  ({ error, helperText, helperTextPosition, maxLength, sx, ...rest }, ref) => {
    return (
      <ValidateField
        error={error}
        helperText={helperText}
        helperTextPosition={helperTextPosition}
        sx={sx}
        withBorder={false}
      >
        <MuiTextField
          error={error}
          inputProps={{
            maxLength,
          }}
          ref={ref}
          sx={{
            '& .MuiInputBase-input': {
              backgroundColor: 'common.white',
              color: 'common.black',
              fontSize: '12px',
              height: '24px',
              padding: '0px 5px',
            },
            '& .MuiInputBase-root ': {
              borderRadius: '1px',
            },
            height: '100%',
            width: '100%',
          }}
          {...rest}
        />
      </ValidateField>
    );
  },
);

export default TextField;
