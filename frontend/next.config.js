/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: 'minio' },
      { protocol: 'https', hostname: '**.florapetfriend.site' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'inaturalist-open-data.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'static.inaturalist.org' },
      { protocol: 'https', hostname: '**.inaturalist.org' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000', 'florapetfriend.site'] },
  },
};

module.exports = nextConfig;
