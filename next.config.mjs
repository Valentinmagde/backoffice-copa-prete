import './src/env.mjs';
/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
     domains: [
      'localhost',
      'uat-copa-prete-bucket.s3.eu-north-1.amazonaws.com',
      'your-cloudfront-domain.cloudfront.net', // Si vous utilisez CloudFront
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'uat-copa-prete-bucket.s3.eu-north-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'prod-copa-prete-bucket.s3.eu-north-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'copa-prete-bucket.s3.eu-north-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/redqteam.com/isomorphic-furyroad/public/**',
      },
      {
        protocol: 'https',
        hostname: 'isomorphic-furyroad.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'isomorphic-furyroad.vercel.app',
      },
    ],
  },
  reactStrictMode: true,
  transpilePackages: ['core'],
};

export default nextConfig;
