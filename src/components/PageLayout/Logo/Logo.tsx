import { styled } from '@mui/material/styles';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';

const NandemoWrapper = styled('div')(() => ({
  color: 'white',
  fontSize: '20px',
  paddingBottom: '1px',
  paddingLeft: '15px',
}));

function Logo() {
  const locale = useLocale();
  const logoImage =
    locale === 'ja' ? '/netsmileToolbarLogo_ja.png' : '/netsmileToolbarLogo_en.png';

  const t = useTranslations('Logo');

  return (
    <>
      <Image alt="logo" height={52} priority src={logoImage} width={245} />
      <NandemoWrapper>{t('productName')}</NandemoWrapper>
    </>
  );
}

export default Logo;
