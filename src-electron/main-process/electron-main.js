import { app, BrowserWindow, ipcMain, Menu, nativeTheme, shell, Tray, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { Registry } from 'rage-edit'
import { template } from './menu'
import { clone } from 'lodash'

let isSilent = true
let updateDownloaded = false

// register for tel: links in windows
if (process.platform === 'win32') {
  (async () => {
    await Registry.set('HKCU\\Software\\Aloware Talk\\Capabilities', 'ApplicationName', 'Aloware Talk')
    await Registry.set('HKCU\\Software\\Aloware Talk\\Capabilities', 'ApplicationDescription', 'Aloware Talk')
    // aloware
    await Registry.set('HKCU\\Software\\Aloware Talk\\Capabilities\\URLAssociations', 'alowaretalk', 'Aloware Talk.aloware')
    await Registry.set('HKCU\\Software\\Classes\\Aloware Talk.aloware\\DefaultIcon', '', process.execPath)
    await Registry.set('HKCU\\Software\\Classes\\Aloware Talk.aloware\\shell\\open\\command', '', `"${process.execPath}" "%1"`)
    // callto
    await Registry.set('HKCU\\Software\\Aloware Talk\\Capabilities\\URLAssociations', 'callto', 'Aloware Talk.callto')
    await Registry.set('HKCU\\Software\\Classes\\Aloware Talk.callto\\DefaultIcon', '', process.execPath)
    await Registry.set('HKCU\\Software\\Classes\\Aloware Talk.callto\\shell\\open\\command', '', `"${process.execPath}" "%1"`)
    // tel
    await Registry.set('HKCU\\Software\\Aloware Talk\\Capabilities\\URLAssociations', 'tel', 'Aloware Talk.tel')
    await Registry.set('HKCU\\Software\\Classes\\Aloware Talk.tel\\DefaultIcon', '', process.execPath)
    await Registry.set('HKCU\\Software\\Classes\\Aloware Talk.tel\\shell\\open\\command', '', `"${process.execPath}" "%1"`)
    // more registry
    await Registry.set('HKCU\\Software\\RegisteredApplications', 'Aloware Talk', 'Software\\Aloware Talk\\Capabilities')
  })()
}

const log = require('electron-log')
log.transports.file.level = 'info'
log.transports.file.maxSize = 5 * 1024 * 1024

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Deep linked url
let deepLinkingUrl

// keep a copy of badge count
let badgeCount

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

// for windows
let isQuiting = false
let tray

app.on('before-quit', () => {
  isQuiting = true
})

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 400,
    height: 680,
    minHeight: 680,
    minWidth: 360,
    resizable: true,
    fullscreen: false,
    center: true,
    useContentSize: true,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,
      devTools: (process.env.APP_DEBUG === 'true' || process.env.NODE_ENV !== 'production')

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  // disable the menu
  mainWindow.setMenu(null)

  // set title
  mainWindow.setTitle(require('../../package.json').productName)

  // Protocol handler for win32
  if (process.platform === 'win32') {
    let cleanArg = process.argv.filter(arg => !arg.startsWith('--') && (arg.startsWith('aloware') || arg.startsWith('tel') || arg.startsWith('callto')))

    if (cleanArg.length > 0) {
      // Keep only command line / deep linked arguments
      deepLinkingUrl = cleanArg[0]
    }
  }

  if (deepLinkingUrl) {
    logEverywhere('createWindow# ' + deepLinkingUrl)

    setTimeout(() => {
      openUrl(deepLinkingUrl)
    }, 5000)
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    if (isQuiting) {
      mainWindow = null
    }
  })

  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault()
  })

  mainWindow.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault()
      mainWindow.hide()
      event.returnValue = false
    }
  })

  mainWindow.webContents.on('new-window', function (event, url) {
    event.preventDefault()
    shell.openExternal(url)
  })
}

// Force Single Instance Application
const gotTheLock = app.requestSingleInstanceLock()

if (gotTheLock) {
  app.on('second-instance', (e, argv) => {
    // Someone tried to run a second instance, we should focus our window.

    // Protocol handler for win32
    // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform === 'win32') {
      let cleanArg = argv.filter(arg => !arg.startsWith('--') && (arg.startsWith('alowaretalk') || arg.startsWith('tel') || arg.startsWith('callto')))

      if (cleanArg.length > 0) {
        // Keep only command line / deep linked arguments
        deepLinkingUrl = cleanArg[0]
      }
    }

    if (deepLinkingUrl) {
      logEverywhere('app.makeSingleInstance# ' + deepLinkingUrl)

      setTimeout(() => {
        openUrl(deepLinkingUrl)
      }, 1000)
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
      processActivate(deepLinkingUrl)

      return
    }

    mainWindow.show()
    mainWindow.focus()
    processActivate(deepLinkingUrl)
  })

  app.on('ready', () => {
    createWindow()
    setTray()

    // added delay so that deep linking works
    setTimeout(() => {
      openUrl(deepLinkingUrl)
    }, 5000)

    clearBadge()

    if (process.env.NODE_ENV === 'production') {
      log.info('Setup check for updates and notify')
      autoUpdater.checkForUpdatesAndNotify()
    }
  })
} else {
  app.quit()
}

// remove so we can register each time as we run the app.
app.removeAsDefaultProtocolClient('alowaretalk')
app.removeAsDefaultProtocolClient('tel')
app.removeAsDefaultProtocolClient('callto')

if (!app.isDefaultProtocolClient('alowaretalk')) {
  // Define custom protocol handler. Deep linking works on packaged versions of the application!
  app.setAsDefaultProtocolClient('alowaretalk')
}

if (!app.isDefaultProtocolClient('tel')) {
  // Define custom protocol handler. Deep linking works on packaged versions of the application!
  app.setAsDefaultProtocolClient('tel')
}

if (!app.isDefaultProtocolClient('callto')) {
  // Define custom protocol handler. Deep linking works on packaged versions of the application!
  app.setAsDefaultProtocolClient('callto')
}

app.on('will-finish-launching', () => {
  // Protocol handler for osx
  app.on('open-url', (event, url) => {
    event.preventDefault()
    deepLinkingUrl = url
    logEverywhere('open-url# ' + url)
    mainWindow.show()
    mainWindow.focus()
    openUrl(url)
    clearBadge()
  })
})

function processActivate (url) {
  openUrl(url)
  clearBadge()

  if (process.env.NODE_ENV === 'production') {
    log.info('Setup check for updates and notify')
    autoUpdater.checkForUpdatesAndNotify()
  }
}

function openUrl (url) {
  if (!url) {
    return
  }

  if (mainWindow && mainWindow.webContents) {
    url = url.replace(/\/$/, '')
    logEverywhere('Opening url: ' + url)
    mainWindow.webContents.send('open-url', url)
    deepLinkingUrl = null

    return
  }

  logEverywhere('Rescheduling opening url: ' + url)

  setTimeout(() => {
    openUrl(url)
  }, 1000)
}

// Log both at dev console and at running node console instance
function logEverywhere (s) {
  if (!s) {
    return
  }

  log.info(s)
}

function sendStatusToWindow (channel, text) {
  log.info(text)

  if (mainWindow && mainWindow.webContents && channel && text) {
    mainWindow.webContents.send(channel, text)
  }
}

function clearBadge () {
  try {
    badgeCount = 0
    app.setBadgeCount(0)
    app.dock.setBadge('')
  } catch (e) {
    log.info('setBadge() does not work on windows. ' + e.message)
  }
}

function setTray () {
  const iconPath = path.join(__statics, '/trayTemplate.png')
  tray = new Tray(iconPath)

  try {
    tray.setContextMenu(Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: function () {
          mainWindow.show()
          mainWindow.focus()
        }
      },
      {
        label: 'Quit',
        click: function () {
          isQuiting = true
          mainWindow.destroy()
          app.quit()
        }
      }
    ]))

    tray.on('click', () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
        return
      }

      mainWindow.show()
      mainWindow.focus()
    })

    // Ignore double click events for the tray icon
    tray.setIgnoreDoubleClickEvents(true)
  } catch (e) {
    log.info('setContextMenu() does not work on windows. ' + e.message)
  }
}

/**
 * Auto Updater
 *
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('App starting...')

app.on('browser-window-focus', () => {
  clearBadge()
})

autoUpdater.on('update-available', (info) => {
  try {
    app.dock.setBadge('⮃')
  } catch (e) {
    log.info('setBadge() does not work on windows. ' + e.message)
  }
  sendStatusToWindow('update_available', 'A new update is available. Downloading now...')
})

autoUpdater.on('error', (err) => {
  log.info('Error in auto-update: ' + err)
  sendStatusToWindow('update_error', 'Error in auto-update. Please restart the application.')
  updateDownloaded = false
  changeUpdaterMenu({
    label: 'Check for updates',
    enabled: true
  })
})

autoUpdater.on('update-not-available', () => {
  sendStatusToWindow('Update not available.')
  changeUpdaterMenu({
    label: 'Check for updates',
    enabled: true
  })
  if (!isSilent) {
    dialog.showMessageBox({
      title: 'No Updates',
      message: 'Current version is up-to-date.'
    })
  }
})

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('update_downloaded', 'Update downloaded, it will be installed on restart. Restart now?')
  updateDownloaded = true
  changeUpdaterMenu({
    label: 'Updates available',
    enabled: true
  })
})

ipcMain.on('restart_app', () => {
  isQuiting = true
  autoUpdater.quitAndInstall()
})

ipcMain.on('quit_app', () => {
  isQuiting = true
  autoUpdater.quit()
})

ipcMain.on('restore_app', () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
})

ipcMain.on('bounce', (event, arg = 'informational') => {
  try {
    app.dock.bounce(arg)
  } catch (e) {
    log.info('bounce() does not work on windows. ' + e.message)
  }
})

ipcMain.on('set_badge', (event, arg) => {
  if (arg === undefined) {
    return
  }

  try {
    if (arg === '') {
      badgeCount = 0
      app.setBadgeCount(0)
    }
    app.dock.setBadge(arg)
  } catch (e) {
    log.info('setBadge() does not work on windows. ' + e.message)
  }
})

ipcMain.on('increase_badge', (event, arg) => {
  if (arg === undefined || arg === '') {
    return
  }

  try {
    badgeCount = app.getBadgeCount()
    badgeCount = badgeCount + arg
    app.setBadgeCount(badgeCount)
  } catch (e) {
    log.info('Error on increasing badge: ' + e.message)
  }
})

ipcMain.on('decrease_badge', (event, arg) => {
  if (arg === undefined || arg === '') {
    return
  }

  try {
    badgeCount = app.getBadgeCount()
    badgeCount = badgeCount - arg

    if (badgeCount <= 0) {
      badgeCount = 0
    }

    app.setBadgeCount(badgeCount)
  } catch (e) {
    log.info('Error on decreasing badge: ' + e.message)
  }
})

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() })
})

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (e) {}

process.on('uncaughtException', (err) => {
  console.log(err)
  sendStatusToWindow('reload_app')
})

export function checkForUpdates ({ silent }) {
  isSilent = true

  if (silent !== undefined) {
    isSilent = silent
  }

  changeUpdaterMenu({
    label: 'Checking for updates...',
    enabled: false
  })

  if (updateDownloaded) {
    sendStatusToWindow('update_downloaded', 'Update downloaded, it will be installed on restart. Restart now?')
    changeUpdaterMenu({
      label: 'Updates available',
      enabled: true
    })

    return
  }

  autoUpdater.checkForUpdates()
}

const changeUpdaterMenu = ({
  label,
  enabled
}) => {
  const newTemplate = clone(template)
  newTemplate[0].submenu[2].label = label
  newTemplate[0].submenu[2].enabled = enabled
  const menu = Menu.buildFromTemplate(newTemplate)
  Menu.setApplicationMenu(menu)
}
