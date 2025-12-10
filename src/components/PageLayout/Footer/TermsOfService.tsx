import { useLocale, useTranslations } from 'next-intl';

import Link from '@/components/Link';

function TermsOfService() {
  const t = useTranslations();
  const locale = useLocale();
  const href = locale === 'ja' ? '/terms_of_service_ja.pdf' : '/terms_of_service_en.pdf';

  return (
    <Link color="common.white" href={href} target="_blank" underline="hover">
      {t('Footer.termsOfService')}
    </Link>
  );
}

export default TermsOfService;
