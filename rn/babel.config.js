const path = require('path');
const sharedPath = path.resolve(__dirname, '../shared');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@shared': sharedPath,
          },
        },
      ],
    ],
  };
};
