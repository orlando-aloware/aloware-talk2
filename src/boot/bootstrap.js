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

import { Vuelidate } from 'vuelidate'
Vue.use(Vuelidate)

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
    this.$generalNotification(message, 'error')
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

Vue.prototype.$generalNotification = function (message, type = null, timeout = 5000) {
  let colorClass = ''
  switch (type) {
    case 'updated':
      colorClass = 'bg-blue-10'
      break
    case 'deleted':
    case 'error':
      colorClass = 'bg-red-10'
      break
    default:
      colorClass = 'bg-green-10'
  }

  this.$q.notify({
    group: false,
    classes: `general-notification text-black ${colorClass} ml-3`,
    timeout: timeout,
    message: message,
    position: 'bottom-left',
    actions: [{ icon: 'close', color: 'black', class: 'close-button' }]
  })
}

Vue.prototype.$actionNotification = window._.debounce(function (title, message, messageIcon = null, type, contactId = null, communicationId = null, noDelay = false, dateTime = this.$moment()) {
  // skip if same notification
  if (type === 'call' && this.$store.state.notifications[type].communicationId === communicationId && this.$store.state.notifications[type].contactId === contactId) {
    return
  }

  if (!title || (type !== 'incomingCall' && !message)) {
    return
  }

  let data = {
    type: type,
    data: {
      title: title,
      message: message,
      messageIcon: messageIcon,
      dateTime: dateTime,
      contactId: contactId,
      communicationId: communicationId
    }
  }

  let notificationTimeout = 500
  this.$store.commit('SET_NOTIFICATIONS', data)

  if (!document.getElementById(type) || noDelay) {
    notificationTimeout = 0
  } else {
    this.$bvToast.hide(type)
  }

  let notificationInterval = setInterval(() => {
    if (!document.getElementById(type)) {
      this.$bvToast.show(type)
      clearInterval(notificationInterval)
    }
  }, notificationTimeout)
}, 100)

Vue.prototype.$closeActionNotification = function (type) {
  if (document.getElementById(type)) {
    this.$bvToast.hide(type)
  }
}

Vue.prototype.$generalActionNotification = window._.debounce(function (title = 'System Updates', message = 'Refresh your screen', messageIcon = null, type = 'system', contactId = null, communicationId = null, dateTime = this.$moment()) {
  // action notifications that will show up many times
  let icon = 'sms-icon'

  if (type === 'call' || type === 'call-voicemail') {
    icon = 'call-icon'
  }
  // Use a shorter name for this.$createElement
  const h = this.$createElement
  // Create the message
  const vNodesMsg = h(
    'div',
    { class: ['d-flex', 'flex-row', 'align-items-center'] },
    [
      h(
        'div',
        { class: ['mr-2'] },
        [
          h(icon)
        ]
      ),
      h(
        'div',
        { class: ['w-100'] },
        [
          h(
            'div',
            { class: ['d-flex', 'flex-grow-1', 'align-items-baseline'] },
            [
              h('strong', { class: ['mr-auto', 'text-white', 'title'] }, title),
              h('small', { class: ['mr-2', 'text-grey-81', 'time'] }, `${this.$options.filters.shortDateTimePassed(dateTime, false)}`)
            ]
          ),
          h(
            'div',
            { class: ['text-grey-81', 'pt-1', 'message-body'] },
            [
              messageIcon ? h(messageIcon, { class: ['pr-1', 'message-icon'] }) : '',
              message
            ]
          )
        ]
      )
    ]
  )
  // Pass the VNodes as an array for message and title
  this.$bvToast.toast([vNodesMsg], {
    title: null,
    solid: true,
    toastClass: ['action-notification', 'notification-border-round', 'p-3', 'bg-grey-80'],
    bodyClass: ['p-0'],
    headerClass: ['bg-grey-80', 'border-0', 'p-0'],
    toaster: 'b-toaster-bottom-right',
    appendToast: true,
    autoHideDelay: '30000',
    isStatus: true
  })
}, 500)

// eslint-disable-next-line no-extend-native
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1)
}
