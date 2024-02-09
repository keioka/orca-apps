const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
  },
  // localePath: path.resolve('./public/locales'),
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : './public/locales',
  reloadOnPrerender: true,
};