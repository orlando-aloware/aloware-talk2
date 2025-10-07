// src/utils/HubSpotCallingExtensionsClient.js
import CallingExtensions from '@hubspot/calling-extensions-sdk'

/**
 * Client wrapper for HubSpot Calling Extensions SDK.
 */
class HubSpotCallingExtensionsClient {
  constructor () {
    this.callingExtensions = null
    this.options = {}
  }

  /**
   * Initialize the HubSpot Calling Extensions SDK.
   *
   * CallingExtensions initialization must happen only once and not repeat
   * when, for instance, login page is called. Otherwise we lose connection with
   * the parent HubSpot window.
   *
   * @param {Object} options - SDK configuration options
   * @returns {Promise<CallingExtensions|null>} SDK instance or null on error
   */
  async initialize (options) {
    if (!this.callingExtensions) {
      this.options = options

      try {
        this.callingExtensions = await new CallingExtensions(this.options)
      } catch (error) {
        console.warn('Error: Extensions SDK is not available', error)
        return null
      }
    } else {
      console.warn('CallingExtensions already initialized. Returning existing instance.')
    }

    return this.callingExtensions
  }

  /**
   * Get the current SDK instance.
   * @returns {CallingExtensions|null} SDK instance or null if not initialized
   */
  getInstance () {
    return this.callingExtensions
  }

  /**
   * Subscribe to event handlers.
   * @param {Object} eventHandlers - Event handler functions
   */
  subscribe (eventHandlers) {
    this.options.eventHandlers = eventHandlers
  }
}

export const hubspotCallingExtensionsClient = new HubSpotCallingExtensionsClient()

/**
 * Component mode is used to determine the mode of the component.
 * 'window' - when the component is detached in a separate browser window (maintains connection on HubSpot navigation)
 * 'remote' - when the component is embedded in a HubSpot iframe (loses connection with the parent window)
 * @see https://developers.hubspot.com/docs/apps/legacy-apps/extensions/calling-extensions/receive-incoming-calls
 */
export const ComponentMode = Object.freeze({
  WINDOW: 'window',
  REMOTE: 'remote',
  UNKNOWN: 'unknown'
})
