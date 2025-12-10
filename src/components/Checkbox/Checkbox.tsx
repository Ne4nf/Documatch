import { Box } from '@mui/material';
import type { CheckboxProps as MuiCheckboxProps } from '@mui/material/Checkbox';
import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { forwardRef } from 'react';

interface CheckboxProps extends MuiCheckboxProps {
  label: string;
}

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, label, onChange, ...restProps }, ref) => {
    return (
      <FormControlLabel
        control={
          <MuiCheckbox
            checked={checked}
            color="primary"
            icon={
              <Box
                sx={{
                  border: '0.5px solid #1E1E1E',
                  cursor: 'pointer',
                  height: '21px',
                  marginLeft: '1.5px',
                  marginRight: '1.5px',
                  marginTop: '1.5px',
                  width: '21px',
                }}
              />
            }
            onChange={onChange}
            ref={ref}
            sx={{
              '&.Mui-checked': {
                transform: 'scale(1.165)',
              },
              marginLeft: '4px',
            }}
            {...restProps}
          />
        }
        label={label}
        sx={{
          '& .MuiButtonBase-root': {
            paddingBottom: 0,
            paddingTop: 0,
          },
          '& .MuiFormControlLabel-label': {
            fontSize: '14px',
            margin: '0px',
          },
        }}
      />
    );
  },
);

export default Checkbox;
