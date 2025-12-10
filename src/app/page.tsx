import { getSession } from '@auth0/nextjs-auth0';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { useTranslations } from 'next-intl';
import NextLink from 'next/link';
import * as React from 'react';

interface LandingPageProps {
  translate: (key: string, ...args: any[]) => string;
}

async function LandingPage({ translate }: LandingPageProps) {
  const session = await getSession();

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          my: 4,
        }}
      >
        <Box sx={{ marginBottom: '20px', maxWidth: 'sm' }}>
          <Button component={NextLink} href="/document" variant="contained">
            {translate('goToDocumentList')}
          </Button>
        </Box>
        <Box sx={{ marginBottom: '20px', maxWidth: 'sm' }}>
          <Button component={NextLink} href="/document-type" variant="contained">
            {translate('goToDocmentTypeList')}
          </Button>
        </Box>
        <Box sx={{ maxWidth: 'sm' }}>
          <Button
            component={NextLink}
            href={session ? '/api/auth/logout' : '/api/auth/login'}
            variant="contained"
          >
            {translate(session ? 'logout' : 'login')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

function LandingPageWrapper() {
  const t = useTranslations('LandingPage');

  return <LandingPage translate={t} />;
}

export default LandingPageWrapper;
