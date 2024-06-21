/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  
  reactStrictMode: false,
  swcMinify: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(fs|vs|frag|vert|glsl)$/,
      type: 'asset/source'
    })
    return config
  }
}

module.exports = nextConfig