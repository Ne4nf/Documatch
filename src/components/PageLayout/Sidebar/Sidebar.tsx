import { useUser } from '@auth0/nextjs-auth0/client';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import Link from '@/components/Link';
import { SmallLogo } from '@/components/PageLayout/Logo';
import { SIZES } from '@/constants';

interface SidebarProps {
  open: boolean;
}

const DrawerHeader = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  minHeight: `${SIZES.HEADER_HEIGHT}px !important`,
  padding: theme.spacing(0, 1), // necessary for content to be below app bar
}));

function Sidebar({ open }: SidebarProps) {
  const t = useTranslations();
  const { user } = useUser();
  const sideMenu = [
    {
      icon: <Image alt="nav icon" height={29} src="/icons/paper.svg" width={22} />,
      id: 1,
      path: '/document',
      target: '_self',
      title: t('Sidebar.documentList'),
    },
    {
      icon: <Image alt="nav icon" height={29} src="/icons/paper.svg" width={22} />,
      id: 2,
      path: '/document-type',
      target: '_self',
      title: t('Sidebar.documentTypeList'),
    },
    {
      icon: <Image alt="nav icon" height={28} src="/icons/user.svg" width={28} />,
      id: 3,
      path: user ? '/api/auth/logout' : '/api/auth/login',
      target: '_self',
      title: t(user ? 'Sidebar.logout' : 'Sidebar.login'),
    },
  ];
  return (
    <Drawer
      anchor="left"
      open={open}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: SIZES.DRAWER_WIDTH,
        },
        flexShrink: 0,
        width: SIZES.DRAWER_WIDTH,
      }}
      variant="persistent"
    >
      <DrawerHeader>
        <SmallLogo />
        <Typography
          component="div"
          noWrap
          sx={{
            color: 'common.black',
            fontSize: '20px',
            fontWeight: 500,
            ml: '15px',
          }}
        >
          {t('Sidebar.menu')}
        </Typography>
      </DrawerHeader>
      <Divider />
      <List>
        {sideMenu.map(item => (
          <Link
            color="common.black"
            href={item.path}
            key={item.id}
            target={item.target}
            underline="none"
            {...(item.path === '/user_manual.pdf' ? { locale: false } : {})}
          >
            <ListItem
              disablePadding
              sx={{
                mb: '15px',
              }}
            >
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={{
                    fontSize: '16px',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
