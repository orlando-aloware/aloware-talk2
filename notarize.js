require('dotenv').config()
const { notarize } = require('@electron/notarize')

exports.default = async function notarizing (context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appName = context.packager.appInfo.productFilename

  await notarize({
    appBundleId: 'com.aloware.talk2',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: 'tito@aloware.com',
    appleIdPassword: 'bgcn-uzxa-brhq-rvqg',
    teamId: '4UQ6G3245S'
  })
}
