import { useTranslations } from 'next-intl';

import CenteredDiv from '@/components/CenteredDiv';

import ContentWrapper from './ContentWrapper';

function ConnectionError({ errorMessage }: { errorMessage: string }) {
  const t = useTranslations('Errors');
  return (
    <CenteredDiv>
      <ContentWrapper>
        <h1>Connection Error</h1>
        <p>{t('connectionError', { errorMessage })}</p>
      </ContentWrapper>
    </CenteredDiv>
  );
}

export default ConnectionError;
