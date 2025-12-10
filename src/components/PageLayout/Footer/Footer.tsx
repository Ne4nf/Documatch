import AppBar from '@mui/material/AppBar';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import Link from '@/components/Link';
import { SIZES } from '@/constants';

import TermsOfService from './TermsOfService';

const FooterAppBar = styled(AppBar)(() => ({
  bottom: 0,
  height: `${SIZES.FOOTER_HEIGHT}px`,
  marginLeft: 0,
  top: 'auto',
}));

function Footer() {
  const t = useTranslations();

  const breadcrumbs = [
    <Link color="common.white" href="#" key="1" target="_blank" underline="hover">
      {t('Footer.privacyPolicy')}
    </Link>,
    <TermsOfService key="2" />,
    <Typography key="3" sx={{ fontSize: 'inherit' }}>
      {t('Footer.copyright')}
    </Typography>,
  ];

  return (
    <FooterAppBar position="absolute">
      <Toolbar sx={{ minHeight: '100% !important' }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          separator="|"
          sx={{
            color: 'common.white',
            fontSize: '14px',
          }}
        >
          {breadcrumbs}
        </Breadcrumbs>
      </Toolbar>
    </FooterAppBar>
  );
}

export default Footer;
