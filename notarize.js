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
    appleId: process.env.MACOS_APPLE_ID,
    appleIdPassword: process.env.MACOS_APPLE_ID_PASSWORD,
    teamId: process.env.MACOS_APPLE_ID_TEAM_ID
  })
}
