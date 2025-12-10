'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import React from 'react';

import { PageLoader } from '@/components/PageLoader';
import { SIZES } from '@/constants';

import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';

const MainContents = styled('main', {
  shouldForwardProp: prop => prop !== 'open',
})<{
  open?: boolean;
}>(({ open, theme }) => ({
  flexGrow: 1,
  marginLeft: `-${SIZES.DRAWER_WIDTH}px`,
  minHeight: '100vh',
  paddingBottom: '0',
  paddingTop: `${SIZES.HEADER_HEIGHT}px`,
  position: 'relative',
  transition: theme.transitions.create('margin', {
    duration: theme.transitions.duration.leavingScreen,
    easing: theme.transitions.easing.sharp,
  }),
  width: '100%',
  ...(open && {
    marginLeft: 0,
    transition: theme.transitions.create('margin', {
      duration: theme.transitions.duration.enteringScreen,
      easing: theme.transitions.easing.easeOut,
    }),
  }),
}));

function PageLayout(props: { children: React.ReactNode }) {
  const { isLoading } = useUser();
  const [open, setOpen] = React.useState(false);

  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  if (isLoading) {
    return (
      <div className="page-layout">
        <PageLoader />
      </div>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Header open={open} toggleSidebar={handleToggleDrawer} />
      <Sidebar open={open} />
      <MainContents open={open}>
        {props.children}
        <Footer />
      </MainContents>
    </Box>
  );
}

export default PageLayout;
