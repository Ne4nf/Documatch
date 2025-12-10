import { useTranslations } from 'next-intl';

import CenteredDiv from '@/components/CenteredDiv';

import ContentWrapper from './ContentWrapper';

function ErrorPage403({ errorMessage }: { errorMessage: string }) {
  const t = useTranslations('Errors');

  return (
    <CenteredDiv>
      <ContentWrapper>
        <h1>403</h1>
        <p>{t('403', { errorMessage })}</p>
      </ContentWrapper>
    </CenteredDiv>
  );
}

export default ErrorPage403;
