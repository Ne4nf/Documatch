'use client';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';

import TextField from '../TextField';
import TextLabel from '../TextLabel';
import type { HelperTextPosition } from '../ValidateField';

const WrapperContainer = styled(Box)(() => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}));

interface DynamicFieldProps {
  height?: number | string;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  rows?: number;
  type?: string;
  value?: string;
  width?: number | string;
}

interface FormItemProps {
  defaultValue?: string;
  error?: boolean;
  height?: number | string;
  helperText?: string;
  helperTextPosition?: HelperTextPosition;
  label?: string;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  type?: string;
  width?: number | string;
}

function DynamicField({
  height,
  onChange,
  placeholder,
  rows,
  type,
  value,
  width,
  ...props
}: DynamicFieldProps) {
  const defaultConfig = {
    text: {
      height: height || '40px',
      padding: '10px 8px',
      width: width || '100%',
    },
    textarea: {
      height: height || '120px',
      padding: '10px 8px',
      rows,
      width: width || '100%',
    },
  };

  switch (type) {
    case 'textarea':
      return (
        <TextField
          fullWidth
          multiline
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          sx={{
            '& .MuiOutlinedInput-root': defaultConfig[type as keyof typeof defaultConfig],
            width: defaultConfig[type as keyof typeof defaultConfig].width,
          }}
          value={value}
          variant="outlined"
          {...props}
        />
      );
    default:
      return (
        <TextField
          onChange={onChange}
          placeholder={placeholder}
          sx={{
            '& .MuiOutlinedInput-root': defaultConfig[type as keyof typeof defaultConfig],
            width: defaultConfig[type as keyof typeof defaultConfig].width,
          }}
          value={value}
          variant="outlined"
          {...props}
        />
      );
  }
}

function FormItem({
  defaultValue = '',
  height,
  label,
  onChange,
  placeholder = 'Input field...',
  required,
  rows = 4,
  type = 'text',
  width,
  ...props
}: FormItemProps) {
  const [value, setValue] = useState(defaultValue);
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setValue(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <WrapperContainer maxWidth="100%">
      {label && (
        <TextLabel
          isRequired={required}
          sx={{
            fontSize: '12px',
            fontWeight: '400',
            lineHeight: '22px',
          }}
        >
          {label}
        </TextLabel>
      )}
      <DynamicField
        height={height}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        type={type}
        value={value}
        width={width}
        {...props}
      />
    </WrapperContainer>
  );
}

export default FormItem;
export { FormItem };
