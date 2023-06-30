import webpack from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  rewrites: () => {
    return [
      {
        source: "/api/bot",
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:5328/api/bot'
            : '/api/bot',
      },
    ];
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

    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
}

export default nextConfig;
