import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: ['openavatars', '@openavatars/react'],
  poweredByHeader: false,
  devIndicators: false,
};
export default config;
