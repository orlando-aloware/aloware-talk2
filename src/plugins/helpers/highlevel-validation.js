/**
 * HighLevel Search Criteria Validation Utilities
 * Centralized validation logic for HighLevel integration
 */

import { COUNTRIES } from 'src/constants/countries'

/**
 * Validates if HighLevel search criteria has valid filters
 * @param {Object} searchCriteria - The HighLevel search criteria object
 * @returns {boolean} - True if criteria is valid, false otherwise
 */
export function hasValidHighLevelCriteria (searchCriteria) {
  if (!searchCriteria || !searchCriteria.filters) {
    return false
  }

  const isValid = searchCriteria.filters.some(block => {
    // Handle AND groups with nested filters
    if (block.group === 'AND') {
      return block.filters && block.filters.length > 0 &&
             block.filters.some(filter => filter.field && filter.operator)
    }

    // Handle OR groups with nested filters
    if (block.group === 'OR') {
      return block.filters && block.filters.length > 0 &&
             block.filters.some(filter => {
               // Handle nested AND groups within OR
               if (filter.group === 'AND') {
                 return filter.filters && filter.filters.length > 0 &&
                        filter.filters.some(andFilter => andFilter.field && andFilter.operator)
               }
               // Handle direct filters within OR
               return filter.field && filter.operator
             })
    }

    // Handle direct filters (no group)
    return block.field && block.operator
  })

  return isValid
}

/**
 * Validates if HighLevel list name is valid
 * @param {string} listName - The list name to validate
 * @returns {boolean} - True if list name is valid, false otherwise
 */
export function hasValidHighLevelListName (listName) {
  return listName && listName.trim() !== ''
}

/**
 * Validates complete HighLevel criteria (list name + search criteria)
 * @param {string} listName - The list name
 * @param {Object} searchCriteria - The search criteria object
 * @returns {boolean} - True if both list name and criteria are valid
 */
export function hasValidHighLevelData (listName, searchCriteria) {
  return hasValidHighLevelListName(listName) && hasValidHighLevelCriteria(searchCriteria)
}

/**
 * Get valid country options for HighLevel form selection
 * @returns {Array} Array of country objects with value and label
 */
export function getValidCountryOptions () {
  return COUNTRIES.map(country => ({
    value: country.code,
    label: country.name
  }))
}
