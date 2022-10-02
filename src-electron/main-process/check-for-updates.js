import { dialog, Menu, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { template } from './menu'
import { clone } from 'ramda'

autoUpdater.autoDownload = false
let isSilent
let updateDownloaded = false
const win = BrowserWindow.getFocusedWindow()

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...')
})

autoUpdater.on('error', (error) => {
  sendStatusToWindow(`Error in autoUpdater. ${error}`)
  changeUpdaterMenu({ label: 'Check for updates', enabled: true })
  if (isSilent) return
  dialog.showErrorBox('Error during the update', `Application couldn't be updated. Please try again or contact the support team.`)
})

autoUpdater.on('update-available', () => {
  sendStatusToWindow('Update available.')
  if (isSilent) {
    autoUpdater.downloadUpdate()
    return
  }
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'New updates are available, do you want update now?',
    defaultId: 0,
    cancelId: 1,
    buttons: ['Yes', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate()
    } else {
      changeUpdaterMenu({ label: 'Check for updates', enabled: true })
    }
  })
})

autoUpdater.on('update-not-available', () => {
  sendStatusToWindow('Update not available.')
  changeUpdaterMenu({ label: 'Check for updates', enabled: true })
  if (isSilent) return
  dialog.showMessageBox({
    title: 'No Updates',
    message: 'Current version is up-to-date.'
  })
})

autoUpdater.on('update-downloaded', () => {
  sendStatusToWindow('Update downloaded.')
  updateDownloaded = true
  changeUpdaterMenu({ label: 'Updates available', enabled: true })
  if (isSilent) return
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates are ready to be installed.',
    defaultId: 0,
    cancelId: 1,
    buttons: ['Install and restart', 'Close']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      setImmediate(() => autoUpdater.quitAndInstall())
    } else {
      changeUpdaterMenu({ label: 'Updates available', enabled: true })
    }
  })
})

export function checkForUpdates ({ silent }) {
  isSilent = silent
  changeUpdaterMenu({ label: 'Checking for updates...', enabled: false })
  if (updateDownloaded) {
    dialog.showMessageBox({
      title: 'Available Updates',
      message: 'New updates are available and ready to be installed.',
      defaultId: 0,
      cancelId: 1,
      buttons: ['Install and restart', 'Close']
    }, (buttonIndex) => {
      if (buttonIndex === 0) {
        setImmediate(() => autoUpdater.quitAndInstall())
      } else {
        changeUpdaterMenu({ label: 'Updates available', enabled: true })
      }
    })
  } else {
    autoUpdater.checkForUpdates()
  }
}

const changeUpdaterMenu = ({ label, enabled }) => {
  const newTemplate = clone(template)
  newTemplate[0].submenu[2].label = label
  newTemplate[0].submenu[2].enabled = enabled
  const menu = Menu.buildFromTemplate(newTemplate)
  Menu.setApplicationMenu(menu)
}

const sendStatusToWindow = (text) => {
  win.webContents.send('message', text)
}
