import { useTranslations } from 'next-intl';

import CenteredDiv from '@/components/CenteredDiv';

import ContentWrapper from './ContentWrapper';

function ErrorPage500({ errorMessage }: { errorMessage: string }) {
  const t = useTranslations('Errors');

  return (
    <CenteredDiv>
      <ContentWrapper>
        <h1>500</h1>
        <p>
          {t('500', {
            errorMessage: `${errorMessage}`,
          })}
        </p>
      </ContentWrapper>
    </CenteredDiv>
  );
}

export default ErrorPage500;
