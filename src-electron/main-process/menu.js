import { app, Menu } from 'electron'
import { checkForUpdates } from './electron-main'

export const template = [
  {
    label: app.getName(),
    submenu: [
      { role: 'about' },
      {
        label: `Version ${app.getVersion()}`,
        enabled: false
      },
      {
        label: 'Check for updates',
        enabled: true,
        click: () => checkForUpdates({ silent: false })
      },
      {
        label: 'Open DevTools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            if (focusedWindow.webContents.isDevToolsOpened()) {
              focusedWindow.webContents.closeDevTools()
            } else {
              focusedWindow.webContents.openDevTools()
            }
          }
        }
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { label: 'Quit', accelerator: 'Command+Q', click: function () { app.quit() } }
    ]
  }, {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        selector: 'undo:'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        selector: 'redo:'
      },
      { type: 'separator' },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        selector: 'cut:'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        selector: 'copy:'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        selector: 'paste:'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:'
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
