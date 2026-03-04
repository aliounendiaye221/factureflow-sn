/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // @react-pdf/renderer utilise canvas en option — on l'externalise pour éviter les erreurs de build
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      { canvas: 'canvas' },
    ]
    return config
  },
}
module.exports = nextConfig