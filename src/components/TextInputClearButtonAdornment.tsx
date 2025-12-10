import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import React from 'react';

function TextInputClearButtonAdornment({ onClick }: { onClick: () => void }) {
  return (
    <InputAdornment position="end">
      <IconButton
        aria-label="clear text contents of the field"
        edge="end"
        onClick={onClick}
      >
        <CloseIcon sx={{ fontSize: '10px' }} />
      </IconButton>
    </InputAdornment>
  );
}

export default TextInputClearButtonAdornment;
export { TextInputClearButtonAdornment };
