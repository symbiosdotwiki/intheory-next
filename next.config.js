/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(fs|vs|frag|vert|glsl)$/,
      type: 'asset/source'
    })
    return config
  },

  distDir: 'build',
  output: 'export',
  assetPrefix: isProd ? '/static/' : undefined,
  basePath: isProd ? '/static' : undefined,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig