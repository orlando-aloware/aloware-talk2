#!/usr/bin/env node

require('dotenv').config()
const { notarize } = require('@electron/notarize')

exports.default = async function notarizing (context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appName = context.packager.appInfo.productFilename

  const notarizeParams = {
    appBundleId: `${appName}`,
    appPath: `${appOutDir}/${appName}.app`,
    appleApiKey: process.env.API_KEY, // Path to the .p8 API key file
    appleApiKeyId: process.env.API_KEY_ID, // Key ID
    appleApiIssuer: process.env.API_KEY_ISSUER_ID // Issuer ID
  }

  console.log('Params:', notarizeParams)

  await notarize(notarizeParams)

  console.log(`Notarized com.aloware.talk2`)
}
