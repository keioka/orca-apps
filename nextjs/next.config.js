import webpack from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // experimental: {
  //   appDir: true,
  // },
  future: { webpack5: true },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    instrumentationHook: true,
    serverMinification: false,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.ttf$/,
      use: ['file-loader'],
    });
    config.module.rules.push({
      test: /\.html$/,
      use: ['file-loader'],
    });

    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      })
    );

    config.resolve.fallback = { fs: false, path: false };

    config.experiments = { ...config.experiments, topLevelAwait: true, };
    return config;
  },
}

export default nextConfig;
