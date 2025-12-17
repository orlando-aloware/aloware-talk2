import { Menu } from 'electron'

/**
 * Setup context menu for right-click actions:
 * - Cut
 * - Copy
 * - Paste
 * - Select All
 * - Inspect Element (development mode only)
 * @param {*} window
 */
export function setupContextMenu (window) {
  window.webContents.on('context-menu', (event, params) => {
    const { editFlags } = params
    const hasText = params.selectionText.trim().length > 0
    const isEditable = params.isEditable

    // Create context menu template
    const contextMenuTemplate = []

    // Add Cut option for editable fields with selected text
    if (isEditable && hasText && editFlags.canCut) {
      contextMenuTemplate.push({
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        click: () => {
          window.webContents.cut()
        }
      })
    }

    // Add Copy option when text is selected
    if (hasText && editFlags.canCopy) {
      contextMenuTemplate.push({
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        click: () => {
          window.webContents.copy()
        }
      })
    }

    // Add Paste option for editable fields when clipboard has content
    if (isEditable && editFlags.canPaste) {
      contextMenuTemplate.push({
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        click: () => {
          window.webContents.paste()
        }
      })
    }

    // Add separator if we have other options
    if (contextMenuTemplate.length > 0 && isEditable && editFlags.canSelectAll) {
      contextMenuTemplate.push({ type: 'separator' })
    }

    // Add Select All option for editable fields or when there's text to select
    if (isEditable && editFlags.canSelectAll) {
      contextMenuTemplate.push({
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        click: () => {
          window.webContents.selectAll()
        }
      })
    }

    // Add developer tools option in development mode
    if (process.env.NODE_ENV === 'development') {
      if (contextMenuTemplate.length > 0) {
        contextMenuTemplate.push({ type: 'separator' })
      }

      contextMenuTemplate.push({
        label: 'Inspect Element',
        click: () => {
          window.webContents.inspectElement(params.x, params.y)
        }
      })
    }

    // Show context menu only if we have items to show
    if (contextMenuTemplate.length > 0) {
      const contextMenu = Menu.buildFromTemplate(contextMenuTemplate)
      contextMenu.popup({ window })
    }
  })
}
