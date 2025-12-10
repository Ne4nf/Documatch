import { useUser } from '@auth0/nextjs-auth0/client';
import type { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

import Link from '@/components/Link';
import { Logo } from '@/components/PageLayout/Logo';
import { PATHS, SIZES } from '@/constants';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

interface HeaderProps {
  open: boolean;
  toggleSidebar: () => void;
}

const HeaderAppBar = styled(MuiAppBar, {
  shouldForwardProp: prop => prop !== 'open',
})<AppBarProps>(({ open, theme }) => ({
  boxShadow: 'none',
  height: `${SIZES.HEADER_HEIGHT}px`,
  transition: theme.transitions.create(['margin', 'width'], {
    duration: theme.transitions.duration.leavingScreen,
    easing: theme.transitions.easing.sharp,
  }),
  ...(open && {
    marginLeft: `${SIZES.DRAWER_WIDTH}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      duration: theme.transitions.duration.enteringScreen,
      easing: theme.transitions.easing.easeOut,
    }),
    width: `calc(100% - ${SIZES.DRAWER_WIDTH}px)`,
  }),
}));

function Header({ open, toggleSidebar }: HeaderProps) {
  const { user } = useUser();
  return (
    <HeaderAppBar open={open} position="fixed">
      <Toolbar sx={{ minHeight: '100% !important' }}>
        <IconButton
          aria-label="open drawer"
          color="primary"
          edge="start"
          onClick={toggleSidebar}
          sx={{
            '&:hover': {
              backgroundColor: 'transparent',
            },
            backgroundColor: 'transparent',
            height: '40px',
            mr: '13px',
            width: '40px',
          }}
        >
          <Image alt="logo" height={40} src="/icons/menu.svg" width={40} />
        </IconButton>
        <Link href={PATHS.DOCUMENT} sx={{ alignItems: 'center', display: 'flex' }}>
          <Logo />
        </Link>
        <Typography
          component="div"
          noWrap
          sx={{ color: 'common.white', fontSize: '20px', ml: 'auto' }}
        >
          {user?.name}
        </Typography>
      </Toolbar>
    </HeaderAppBar>
  );
}

export default Header;
