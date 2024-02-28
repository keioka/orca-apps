module.Exports = (on, config) => {
  on('before:browser:launch', (browser, launchOptions) => {
    // supply the absolute path to an unpacked extension's folder
    // NOTE: extensions cannot be loaded in headless Chrome
    launchOptions.extensions.push('/Users/keioka/Dev/orca/ce/build/chrome-mv3-dev')
    return launchOptions
  })
}