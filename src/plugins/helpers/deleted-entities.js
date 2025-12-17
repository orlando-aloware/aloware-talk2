/**
 * Helper functions for handling deleted entities
 */

/**
 * Remove the "_deleted_TIMESTAMP" suffix from entity names
 * @param {String} name - The entity name that might have a deleted suffix
 * @returns {String} - The cleaned name without the suffix
 */
export const removeDeletedSuffix = (name) => {
  if (!name) return ''

  // Remove "_deleted_TIMESTAMP" suffix
  const deletedPattern = /_deleted_\d+$/
  return name.replace(deletedPattern, '')
}

/**
 * Check if an entity is deleted
 * @param {Object} entity - The entity object to check
 * @returns {Boolean} - True if the entity is deleted
 */
export const isDeleted = (entity) => {
  return entity?.deleted_at !== null && entity?.deleted_at !== undefined
}
