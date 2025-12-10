import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Note: By default the timeout for the next.js proxy is 30s, this increases it.
    // As it is an experimental feature, we should consider moving some of the long
    // running requests to server actions, which do not rely on this timeout setting.
    proxyTimeout: 300000, // 5 minutes
  },
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
