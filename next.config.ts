
import type {NextConfig} from 'next';
require('dotenv').config();

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'farma365.com.ar',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.lancome.cl',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'es.loccitane.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.augustman.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.rawpixel.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'png.pngtree.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tascani.vtexassets.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'acdn-us.mitiendanube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'holiclothing.com.ar',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
   env: {
    NEXT_PUBLIC_MAILCHIMP_CONFIGURED: String(!!(process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER_PREFIX && process.env.MAILCHIMP_AUDIENCE_ID)),
  }
};

export default nextConfig;

    