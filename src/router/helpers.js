/**
 * Parses legacy inbox URL paths to extract route parameters.
 * Since the routes definitions are removed, we need to use regex to parse the path to extract the parameters.
 * Handles patterns like:
 * - /channels/:channel/contacts/:id
 * - /channels/:channel/contacts/:id/communications/:communicationId
 *
 * @param {string} path - The URL path to parse
 * @returns {Object} Object containing contactId, communicationId, and channel
 */
export function parseLegacyInboxPath (path) {
  let contactId = null
  let communicationId = null
  let channel = null

  // Extract contactId: /contacts/{id}
  const contactMatch = path.match(/\/contacts\/(\d+)/)
  if (contactMatch) {
    contactId = contactMatch[1]
  }

  // Extract communicationId: /communications/{id}
  const communicationMatch = path.match(/\/communications\/(\d+)/)
  if (communicationMatch) {
    communicationId = communicationMatch[1]
  }

  // Extract channel: /channels/{channel}
  const channelMatch = path.match(/\/channels\/([^/]+)/)
  if (channelMatch) {
    channel = channelMatch[1]
  }

  return { contactId, communicationId, channel }
}

/**
 * Checks if the path is a legacy inbox path.
 *
 * @param {string} path - The URL path to check
 * @returns {boolean} True if the path is a legacy inbox path, false otherwise
 */
export function isLegacyInboxPath (path = '') {
  return isBasePath(path) || path.startsWith('/channels')
}

/**
 * Checks if the path is the base path.
 * This was the default application path for the legacy inbox.
 *
 * @param {string} path - The URL path to check
 * @returns {boolean} True if the path is the base path, false otherwise
 */
export function isBasePath (path = '') {
  return ['/', ''].includes(path)
}
