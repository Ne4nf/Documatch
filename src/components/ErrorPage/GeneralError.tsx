import { useTranslations } from 'next-intl';

import CenteredDiv from '@/components/CenteredDiv';

import ContentWrapper from './ContentWrapper';

function GeneralError({ errorMessage }: { errorMessage: string }) {
  const t = useTranslations('Errors');
  return (
    <CenteredDiv>
      <ContentWrapper>
        <h1>Error</h1>
        <p>{t('general', { errorMessage })}</p>
      </ContentWrapper>
    </CenteredDiv>
  );
}

export default GeneralError;
