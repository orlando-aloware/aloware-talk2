import { app, Menu } from 'electron'
import { checkForUpdates } from './electron-main'

export const template = [{
  label: app.getName(),
  submenu: [
    { role: 'about' },
    { label: `Version ${app.getVersion()}`, enabled: false },
    { label: 'Check for updates', enabled: true, click: () => checkForUpdates({ silent: false }) },
    { type: 'separator' },
    { role: 'services' },
    { type: 'separator' },
    { role: 'hide' },
    { role: 'hideothers' },
    { role: 'unhide' },
    { type: 'separator' },
    { role: 'quit' }
  ]
}]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
