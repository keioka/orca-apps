import type { AWS } from '@serverless/typescript';

import { hello } from './src/functions';
import { polly } from './src/functions';

const serverlessConfiguration: AWS = {
  service: 'aws',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  useDotenv: true,
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      AWS_LAMBDA_SECRET_KEY_ID: '${env:AWS_SECRET_KEY_ID}',
      AWS_LAMBDA_SECRET_ACCESS_KEY: '${env:AWS_SECRET_ACCESS_KEY}',
    },
    lambdaHashingVersion: '20201221',
  },
  functions: {
    hello,
    polly
  }
}

module.exports = serverlessConfiguration;
