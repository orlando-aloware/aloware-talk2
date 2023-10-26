export default {
  methods: {
    getMaskByCountry (countryCode) {
      switch (countryCode) {
        case '1': // USA and Canada
          return '### ### ####'
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
        default: // Generic fallback
          return '#########################'
      }
    }
  }
}
