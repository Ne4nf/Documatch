import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // TODO: We want the default language to be Japanese, but it should be possible to
  // configure it, for example with a cookie.
  const locale = 'ja';
  // const locale = 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.ts`)).messages,
  };
});
