import Vue from 'vue'
import googlePhone from 'google-libphonenumber'
import jstz from 'jstimezonedetect'
import moment from 'moment'
import 'moment-timezone'
import momentDurationFormatSetup from 'moment-duration-format'
import Bowser from 'bowser'
import * as Sentry from '@sentry/vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// local storage
localStorage.setItem('api_url', process.env.API_URL)
localStorage.setItem('pusher_app_key', process.env.PUSHER_APP_KEY)
localStorage.setItem('pusher_cluster', process.env.PUSHER_CLUSTER)
localStorage.setItem('sentry_dsn_public', process.env.MIX_SENTRY_DSN_PUBLIC)

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

window.Bowser = Bowser
window.timezone = jstz.determine().name()

if (process.env.APP_DEBUG) {
  Vue.config.devtools = true
}

// Require `PhoneNumberFormat`.
window.PNF = googlePhone.PhoneNumberFormat

// Get an instance of `PhoneNumberUtil`.
window.phoneUtil = googlePhone.PhoneNumberUtil.getInstance()

window.getLocaleIfPhoneNumberIsFromUsAndCa = function (phoneNumber) {
  if (!phoneNumber) {
    return false
  }

  let validCountries = ['US', 'CA']

  try {
    for (let validCountry of validCountries) {
      let number = window.phoneUtil.parseAndKeepRawInput(phoneNumber, validCountry)
      let isPossible = window.phoneUtil.isPossibleNumber(number)
      if (isPossible) {
        if (window.phoneUtil.isValidNumberForRegion(number, validCountry)) {
          return validCountry
        }
      }
    }
    return false
  } catch (err) {
    return false
  }
}

window.guessLocale = function (phoneNumber) {
  if (!phoneNumber) {
    return false
  }

  try {
    // handle US and CA as an special case
    let northAmericaLocale = window.getLocaleIfPhoneNumberIsFromUsAndCa(phoneNumber)
    if (northAmericaLocale) {
      return northAmericaLocale
    }
    // if we reached here then it's definitely not a US or CA number according to google-libphonenumber
    // let's check for international locales

    if (!phoneNumber.includes('+')) {
      phoneNumber = '+' + phoneNumber
    }

    let number = window.phoneUtil.parse(phoneNumber)
    let locale = window.phoneUtil.getRegionCodeForNumber(number)

    if (!locale) {
      return false
    }

    return locale
  } catch (err) {
    return false
  }
}

window._ = require('lodash')
window.Pusher = require('pusher-js')

window.paceOptions = {
  restartOnRequestAfter: false,
  ajax: {
    trackWebSockets: false
  }
}

momentDurationFormatSetup(moment)
window.moment = moment

window.Sentry = Sentry

if ((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') && process.env.APP_ENV !== 'local') {
  Sentry.init({
    Vue: Vue,
    tracingOptions: {
      trackComponents: true
    },
    dsn: localStorage.getItem('sentry_dsn_public')
  })

  Sentry.configureScope((scope) => {
    scope.setTag('environment', process.env.NODE_ENV)
  })
}

// Branding :D
console.log(`%c
 █████╗ ██╗      ██████╗ ██╗    ██╗ █████╗ ██████╗ ███████╗
██╔══██╗██║     ██╔═══██╗██║    ██║██╔══██╗██╔══██╗██╔════╝
███████║██║     ██║   ██║██║ █╗ ██║███████║██████╔╝█████╗
██╔══██║██║     ██║   ██║██║███╗██║██╔══██║██╔══██╗██╔══╝
██║  ██║███████╗╚██████╔╝╚███╔███╔╝██║  ██║██║  ██║███████╗
╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
`, 'color: #00BF50')

Vue.prototype.$moment = window.moment
Vue.prototype.$Pusher = window.Pusher
Vue.prototype.$Sentry = window.Sentry
