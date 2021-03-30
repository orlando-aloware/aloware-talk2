import _ from 'lodash'
import * as LrnTypes from '../../constants/lrn-types'

const fixDateOfBirth = (dateOfBirth) => {
  if (dateOfBirth) {
    return dateOfBirth
  }

  return 'N/A'
}

const fixName = (name) => {
  if (name) {
    return name
  }

  return 'N/A'
}

const fixCountry = (country) => {
  if (country) {
    return _.capitalize(country)
  }

  return 'N/A'
}

const fixState = (state) => {
  if (state) {
    return _.capitalize(state)
  }

  return 'N/A'
}

const fixCity = (city) => {
  if (city) {
    return _.capitalize(city)
  }

  return 'N/A'
}

const fixZipcode = (zipcode) => {
  if (zipcode) {
    return zipcode
  }

  return 'N/A'
}

const fixEmail = (email) => {
  if (email) {
    return email
  }

  return 'N/A'
}

const fixTimezone = (timezone) => {
  if (timezone) {
    return timezone
  }

  return 'N/A'
}

const fixLrnType = (lrnType) => {
  // LRN_TYPE_LANDLINE = 0 so it couldn't pass the if statement because 0 != true.
  if (lrnType !== null) {
    switch (lrnType) {
      case LrnTypes.LRN_TYPE_LANDLINE:
        return 'Landline'
      case LrnTypes.LRN_TYPE_WIRELESS:
        return 'Wireless'
      case LrnTypes.LRN_TYPE_VOIP:
        return 'Voip'
      case LrnTypes.LRN_TYPE_OTHER:
        return 'Other'
      default:
        return 'N/A'
    }
  }

  return 'N/A'
}

export default ({ Vue }) => {
  const filters = {
    fixDateOfBirth,
    fixName,
    fixCountry,
    fixState,
    fixCity,
    fixZipcode,
    fixEmail,
    fixTimezone,
    fixLrnType
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
