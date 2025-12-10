import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CancelIcon from '@mui/icons-material/Cancel';
import type { SxProps } from '@mui/material';
import { Autocomplete, TextField } from '@mui/material';
import type { SyntheticEvent } from 'react';

import type { AutocompleteOption } from '@/types';

type CustomAutocompleteProps = {
  isError?: boolean;
  onChange: (
    event: SyntheticEvent<Element, Event>,
    value: AutocompleteOption | null | string,
    reason: any,
    details?: any,
  ) => void;
  onKeyDownAction: (
    event: React.KeyboardEvent<HTMLDivElement> & {
      defaultMuiPrevented?: boolean | undefined;
    },
  ) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  sx?: SxProps;
  value?: AutocompleteOption | null;
};

function CustomAutocomplete({
  isError,
  onChange,
  onKeyDownAction,
  options = [],
  placeholder,
  sx = {},
  value,
  ...restProps
}: CustomAutocompleteProps) {
  return (
    <Autocomplete
      clearIcon={
        value ? (
          <CancelIcon
            sx={{
              color: '#757575',
              fontSize: '20px',
            }}
          />
        ) : (
          <div />
        )
      }
      getOptionKey={option => `${option.value}-${option.label}`}
      onChange={onChange}
      onKeyDown={onKeyDownAction}
      options={options}
      popupIcon={value ? <div /> : <ArrowDropDownIcon />}
      renderInput={params => (
        <TextField
          placeholder={placeholder || 'Input field...'}
          sx={{ border: 'none' }}
          {...params}
        />
      )}
      sx={{
        '& .MuiInputBase-root': {
          '& .MuiOutlinedInput-notchedOutline': isError
            ? {
                border: '1px solid red',
              }
            : {},
          borderRadius: '2px',
          color: '#242222',
          fontSize: '14px',
          fontWeight: 500,
          height: '40px',
          lineHeight: '22px',
        },
        '& .MuiSelect-icon': {
          color: '#757575',
        },
        width: '100%',
        ...sx,
      }}
      value={value || null}
      {...restProps}
    />
  );
}

export default CustomAutocomplete;
