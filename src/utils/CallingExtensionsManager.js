// src/utils/CallingExtensionsManager.js
import CallingExtensions from '@hubspot/calling-extensions-sdk'

class CallingExtensionsManager {
  constructor () {
    if (!CallingExtensionsManager.instance) {
      this.callingExtensions = null
      this.options = {}
      CallingExtensionsManager.instance = this
    }

    return CallingExtensionsManager.instance
  }

  async initialize (options) {
    if (!this.callingExtensions) {
      this.options = options

      try {
        this.callingExtensions = await new CallingExtensions(this.options)
      } catch (error) {
        console.warning('Error: Extensions SDK is not available', error)
      }
    }
    return this.callingExtensions
  }

  getInstance () {
    return this.callingExtensions
  }

  subscribe (eventHandlers) {
    this.options.eventHandlers = eventHandlers
  }
}

const instance = new CallingExtensionsManager()
export default instance
