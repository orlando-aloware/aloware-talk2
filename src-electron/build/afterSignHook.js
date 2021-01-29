// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db

const fs = require('fs')
const path = require('path')
let electronNotarize = require('electron-notarize')

module.exports = async function (params) {
  // Only notarize the app if app is for production
  if (process.env.APP_ENV !== 'production') {
    return
  }

  console.log('afterSign hook triggered', params)

  // Notarize the app for macOS
  if (process.platform === 'darwin') {
    // Same appId in electron-builder.
    const appId = 'com.aloware.talk2'
    const password = `@keychain:AC_PASSWORD`

    let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`)
    if (!fs.existsSync(appPath)) {
      throw new Error(`Cannot find application at: ${appPath}`)
    }

    console.log(`Notarizing ${appId} found at ${appPath}`)

    try {
      await electronNotarize.notarize({
        appBundleId: appId,
        appPath: appPath,
        appleId: process.env.APPLE_ID,
        appleIdPassword: password
      })
    } catch (error) {
      console.error(error)
    }

    console.log(`Done notarizing ${appId}`)
  }
}
