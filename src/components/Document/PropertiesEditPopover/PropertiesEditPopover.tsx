import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SaveIcon from '@mui/icons-material/Save';
import { Box } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';
import type { PopoverProps } from '@mui/material/Popover';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import type { ReactNode } from 'react';

interface PropertiesEditPopoverProps {
  buttonLabel: string;
  buttonProps?: ButtonProps;
  children: ReactNode;
  disableSaveButton?: boolean;
  onCloseWithoutSave?: () => void;
  onSave: () => void;
  popoverProps?: PopoverProps;
}

const StyledPopover = styled((props: PopoverProps) => (
  <Popover
    anchorOrigin={{
      horizontal: 'left',
      vertical: 'bottom',
    }}
    disableScrollLock
    elevation={0}
    transformOrigin={{
      horizontal: 'left',
      vertical: 'top',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    marginTop: theme.spacing(1),
    minWidth: '300px',
  },
}));

const StyledPopoverButton = styled(Button)<ButtonProps>(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.common.black,
  fontSize: '16px',
  height: '32px',
}));

export function PropertiesEditPopover({
  buttonLabel,
  buttonProps,
  children,
  disableSaveButton,
  onCloseWithoutSave,
  onSave,
  popoverProps,
}: PropertiesEditPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const tActions = useTranslations('Actions');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // This pattern required so unit test will work.
    setAnchorEl(prevValue => {
      return prevValue ? null : event.currentTarget;
    });
  };

  const handleSave = () => {
    onSave();
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (onCloseWithoutSave) {
      onCloseWithoutSave();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <StyledPopoverButton
        aria-describedby={id}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        data-testid="open-popover"
        endIcon={open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        onClick={handleClick}
        variant="contained"
        {...buttonProps}
      >
        {buttonLabel}
      </StyledPopoverButton>
      <StyledPopover
        anchorEl={anchorEl}
        data-testid="popover-body"
        id={id}
        onClose={handleClose}
        open={open}
        {...popoverProps}
      >
        <Box>{children}</Box>
        <Box display="flex" justifyContent="flex-end">
          <Button
            aria-label={tActions('save')}
            data-testid="popover-save-button"
            disabled={disableSaveButton}
            onClick={handleSave}
          >
            <SaveIcon />
          </Button>
        </Box>
      </StyledPopover>
    </>
  );
}
