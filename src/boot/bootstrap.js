import Vue from 'vue'
import 'highlight.js/styles/github.css'
import googlePhone from 'google-libphonenumber'
import jstz from 'jstimezonedetect'
import moment from 'moment'
import 'moment-timezone'
import momentDurationFormatSetup from 'moment-duration-format'
import Bowser from 'bowser'
import * as Sentry from '@sentry/vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import PortalVue from 'portal-vue'
import 'vue-popperjs/dist/vue-popper.css'
import VueWaveSurfer from 'vue-wave-surfer'

// local storage
localStorage.setItem('api_url', process.env.API_URL)
localStorage.setItem('pusher_app_key', process.env.PUSHER_APP_KEY)
localStorage.setItem('pusher_cluster', process.env.PUSHER_CLUSTER)
localStorage.setItem('sentry_dsn_public', process.env.MIX_SENTRY_DSN_PUBLIC)

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(PortalVue)
Vue.use(VueWaveSurfer)

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
      let number = window.phoneUtil.parseAndKeepRawInput(
        phoneNumber,
        validCountry
      )
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
    let northAmericaLocale = window.getLocaleIfPhoneNumberIsFromUsAndCa(
      phoneNumber
    )
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

// set env to browser's local storage
localStorage.setItem('env', process.env.NODE_ENV)

if (
  (process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'development') &&
  process.env.APP_ENV !== 'local'
) {
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
console.log(
  `%c
 █████╗ ██╗      ██████╗ ██╗    ██╗ █████╗ ██████╗ ███████╗
██╔══██╗██║     ██╔═══██╗██║    ██║██╔══██╗██╔══██╗██╔════╝
███████║██║     ██║   ██║██║ █╗ ██║███████║██████╔╝█████╗
██╔══██║██║     ██║   ██║██║███╗██║██╔══██║██╔══██╗██╔══╝
██║  ██║███████╗╚██████╔╝╚███╔███╔╝██║  ██║██║  ██║███████╗
╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
`,
  'color: #00BF50'
)

Vue.prototype.$moment = window.moment
Vue.prototype.$Pusher = window.Pusher
Vue.prototype.$Sentry = window.Sentry

Vue.prototype.$handleErrors = function (response, title = null) {
  if (response && response.status) {
    let message = ''
    switch (response.status) {
      case 401:
        if (response.data.error) {
          message += '<p class="pt-1 pb-1">- ' + response.data.error + '</p>'
        }
        for (let error of response.data.errors) {
          message += '<p class="pt-1 pb-1">- ' + error + '</p>'
        }
        break
      case 403:
        message = 'You do not have enough permissions to make this request.'
        if (response.data && response.data.error) {
          message = response.data.error
        }
        break
      case 404:
        message = 'Requested resource not found.'
        break
      case 400:
        message = response.data.error
        break
      case 422:
        message = ''
        for (let error of response.data.errors) {
          message += '<p class="pt-1 pb-1">- ' + error + '</p>'
        }
        break
      case 500:
        message = 'Oops! We are having some problems right now, please try again later.'
        break
    }
    this.$q.notify({
      offset: 95,
      title: title || 'Error',
      dangerouslyUseHTMLString: true,
      message: message,
      type: 'error',
      showClose: true
    })
  }
}

Vue.prototype.$handleUploadErrors = function (error) {
  if (typeof error === 'string') {
    error = JSON.parse(error)
  }
  let err
  if (error.message === 'This action is unauthorized.') {
    err = {
      status: 403
    }
  } else {
    err = {
      status: 422,
      data: {
        errors: error.errors.file
      }
    }
  }

  this.$handleErrors(err)
}

// eslint-disable-next-line no-extend-native
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1)
}
