import webpack from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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

    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
}

export default nextConfig;
