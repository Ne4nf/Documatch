import { useTranslations } from 'next-intl';

import CenteredDiv from '@/components/CenteredDiv';

import ContentWrapper from './ContentWrapper';

function ErrorPage404({ errorMessage }: { errorMessage: string }) {
  const t = useTranslations('Errors');

  return (
    <CenteredDiv>
      <ContentWrapper>
        <h1>404</h1>
        <p>{t('404', { errorMessage })}</p>
      </ContentWrapper>
    </CenteredDiv>
  );
}

export default ErrorPage404;
