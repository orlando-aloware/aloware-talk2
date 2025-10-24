// src/utils/CallingExtensionsManager.js
// @deprecated - This file is currently used for the HubSpot-specific code in Dialer.vue, which will be removed in the future.
// Instead, please use HubSpotCallingExtensionsClient.js (and HubSpotSoftPhone.vue) of managing HubSpot Calling Extensions SDK

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
