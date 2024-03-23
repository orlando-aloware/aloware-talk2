#!/usr/bin/env node

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
    appleApiKey: process.env.API_KEY, // Path to the .p8 API key file
    appleApiIssuer: process.env.API_KEY_ISSUER_ID // Issuer ID
  })

  console.log(`Notarized ${appName}`)
}
