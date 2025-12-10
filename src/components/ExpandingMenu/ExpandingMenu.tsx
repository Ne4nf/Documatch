import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';
import type { MenuProps } from '@mui/material/Menu';
import Menu from '@mui/material/Menu';
import { alpha, styled } from '@mui/material/styles';
import type { ReactNode } from 'react';
import React from 'react';

interface ExpandingMenuProps {
  buttonLabel: string;
  buttonProps?: ButtonProps;
  children: ReactNode;
  menuProps?: MenuProps;
}

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    anchorOrigin={{
      horizontal: 'right',
      vertical: 'bottom',
    }}
    disableScrollLock
    elevation={0}
    transformOrigin={{
      horizontal: 'right',
      vertical: 'top',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        color: theme.palette.text.secondary,
        fontSize: 18,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
    borderRadius: 6,
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    marginTop: theme.spacing(1),
    minWidth: 180,
  },
}));

export function ExpandingMenu({
  buttonLabel,
  buttonProps,
  children,
  menuProps,
}: ExpandingMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleClick}
        variant="contained"
        {...buttonProps}
      >
        {buttonLabel}
      </Button>
      <StyledMenu anchorEl={anchorEl} onClose={handleClose} open={open} {...menuProps}>
        {children}
      </StyledMenu>
    </div>
  );
}
