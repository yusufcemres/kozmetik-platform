/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['shared'],
  poweredByHeader: false,

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.kozmetikplatform.com' },
      { protocol: 'https', hostname: '**.trendyol.com' },
      { protocol: 'https', hostname: '**.hepsiburada.com' },
      { protocol: 'https', hostname: '**.amazon.com.tr' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'cdn.dsmcdn.com' },
      { protocol: 'https', hostname: '**.cerave.com.tr' },
      { protocol: 'https', hostname: '**.laroche-posay.com.tr' },
      { protocol: 'https', hostname: '**.vichy.com.tr' },
      { protocol: 'https', hostname: '**.bioderma.com.tr' },
      { protocol: 'https', hostname: '**.mustela.com.tr' },
      { protocol: 'https', hostname: '**.bionnex.com.tr' },
      { protocol: 'https', hostname: '**.cosmed.com.tr' },
      { protocol: 'https', hostname: '**.bioxcin.com.tr' },
      { protocol: 'https', hostname: '**.sebamed.com.tr' },
      { protocol: 'https', hostname: '**.dermoskin.com.tr' },
      { protocol: 'https', hostname: '**.nivea.com.tr' },
      { protocol: 'https', hostname: '**.sinoz.com.tr' },
      { protocol: 'https', hostname: '**.shevec.com' },
      { protocol: 'https', hostname: '**.creamco.com.tr' },
      { protocol: 'https', hostname: '**.urbancare.com.tr' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // API proxy (dev ortamında CORS sorununu çözer)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/api/proxy/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        // Static assets — long cache
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // ISR pages
        source: '/:path(urunler|icerikler|ihtiyaclar)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        has: [{ type: 'cookie', key: 'admin_token', value: undefined }],
        destination: '/admin/login',
        permanent: false,
      },
    ];
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
