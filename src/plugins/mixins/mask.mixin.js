import { COUNTRIES } from 'src/constants/countries'

export default {
  methods: {
    getMaskByCountry (countryCode) {
      switch (countryCode) {
        case '1': // USA and Canada
          return '### ### ########'
        case '55': // Brazil
          return '## # ####-####'
        case '44': // United Kingdom
          return '## #### ####'
        case '33': // France
          return '# ## ## ## ##'
        case '61': // Australia
          return '# #### ####'
        case '91': // India
          return '#### ######'
        case '49': // Germany
          return '### ########'
        case '7': // Russia
          return '### ###-##-##'
        case '81': // Japan
          return '# #### ####'
        case '27': // South Africa
          return '## ### ####'
        case '52': // Mexico
          return '# ### ####'
        case '34': // Spain
          return '# ## ## ## ##'
        case '39': // Italy
          return '### #######'
        case '86': // China
          return '### #### ####'
        case '502': // Guatemala
          return '#### ####'
        default: // Generic fallback
          return '#########################'
      }
    },

    getCountryCodeByCountryId (countryId) {
      const country = COUNTRIES.find(country => country.code === countryId)

      if (country) {
        return country.countryCode
      }

      return '+1'
    },

    validateZipCodeByCountryId (zip, countryId) {
      let zipRegex

      switch (countryId) {
        case 'US':
          // US ZIP code pattern (5 digits or 5 digits-4 digits)
          zipRegex = /^\d{5}(-\d{4})?$/
          break
        case 'CA':
          // Canadian postal code pattern (letter-digit-letter space digit-letter-digit)
          zipRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
          break
        case 'UK':
          // UK postcode pattern (variable length and format)
          zipRegex = /^(GIR ?0AA|(?:(?:A[BL]|B[ABDHLNRST]?|C[ABHMORTVW]|D[ADEGHLNTY]|E[HNX]?|F[KY]|G[LUY]?|H[ADGPRSUX]|I[GMPV]|JE|K[ATWY]|L[ADELNSU]?|M[EKX]|N[EGNPRW]?|O[LX]|P[AEHLOR]|R[GHM]?|S[AEGKL-PRSTY]?|T[ADFNQRSW]|UB|W[ADFNRSV]?|X[ABDEFGHLNRTW]|Y[O]|ZE)(?:\d(?:\d|[A-Z])? ?\d[A-Z]{2})))$/
          break
        case 'BR':
          // Brazilian postal code pattern (5 digits-3 digits)
          zipRegex = /^\d{5}-\d{3}$/
          break
        case 'FR':
          // French postal code pattern (5 digits)
          zipRegex = /^\d{5}$/
          break
        case 'DE':
          // German postal code pattern (5 digits)
          zipRegex = /^\d{5}$/
          break
        case 'JP':
          // Japanese postal code pattern (3 digits-4 digits)
          zipRegex = /^\d{3}-\d{4}$/
          break
        case 'AU':
          // Australian postal code pattern (4 digits)
          zipRegex = /^\d{4}$/
          break
        case 'IN':
          // Indian postal code pattern (6 digits)
          zipRegex = /^\d{6}$/
          break
        case 'RU':
          // Russian postal code pattern (6 digits)
          zipRegex = /^\d{6}$/
          break
        case 'MX':
          // Mexican postal code pattern (5 digits)
          zipRegex = /^\d{5}$/
          break
        case 'ES':
          // Spanish postal code pattern (5 digits)
          zipRegex = /^\d{5}$/
          break
        case 'IT':
          // Italian postal code pattern (5 digits)
          zipRegex = /^\d{5}$/
          break
        case 'CN':
          // Chinese postal code pattern (6 digits)
          zipRegex = /^\d{6}$/
          break
        case 'ZA':
          // South African postal code pattern (4 digits)
          zipRegex = /^\d{4}$/
          break
        case 'GT':
          // Guatemalan postal code pattern (5 digits)
          zipRegex = /^\d{5}$/
          break
        case 'NL':
          // Dutch postal code pattern (4 digits followed by 2 letters)
          zipRegex = /^\d{4}\s?[A-Za-z]{2}$/
          break
        case 'BE':
          // Belgian postal code pattern (4 digits)
          zipRegex = /^\d{4}$/
          break
        case 'SE':
          // Swedish postal code pattern (5 digits)
          zipRegex = /^\d{5}$/
          break
        case 'NO':
          // Norwegian postal code pattern (4 digits)
          zipRegex = /^\d{4}$/
          break
        case 'DK':
          // Danish postal code pattern (4 digits)
          zipRegex = /^\d{4}$/
          break
        case 'FI':
          // Finnish postal code pattern (5 digits)
          zipRegex = /^\d{5}$/
          break
        case 'CH':
          // Swiss postal code pattern (4 digits)
          zipRegex = /^\d{4}$/
          break
        case 'AT':
          // Austrian postal code pattern (4 digits)
          zipRegex = /^\d{4}$/
          break
        case 'PL':
          // Polish postal code pattern (5 digits)
          zipRegex = /^\d{2}-\d{3}$/
          break
        case 'CZ':
          // Czech postal code pattern (5 digits)
          zipRegex = /^\d{3}\s?\d{2}$/
          break
        default:
          // No validation for other countries, free text allowed
          return true
      }

      return zipRegex.test(zip)
    }
  }
}
