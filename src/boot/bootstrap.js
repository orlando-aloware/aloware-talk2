import Vue from 'vue'
import 'highlight.js/styles/github.css'
import googlePhone from 'google-libphonenumber'
import moment from 'moment'
import 'moment-timezone'
import momentDurationFormatSetup from 'moment-duration-format'
import Bowser from 'bowser'
import * as Sentry from '@sentry/vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import PortalVue from 'portal-vue'
import 'vue-popperjs/dist/vue-popper.css'
import VueWaveSurfer from 'vue-wave-surfer'
import * as storage from 'src/plugins/helpers/storage'
import CountriesAndTimezones from 'countries-and-timezones'
import infiniteScroll from 'vue-infinite-scroll'
import loadStock from 'highcharts/modules/stock'
import loadExporting from 'highcharts/modules/exporting'
import loadExportData from 'highcharts/modules/export-data'
import loadOfflineExporting from 'highcharts/modules/offline-exporting'
import loadSunburst from 'highcharts/modules/sunburst'
import loadMap from 'highcharts/modules/map'
import loadDrilldown from 'highcharts/modules/drilldown'
import More from 'highcharts/highcharts-more'
import HighchartsNoData from 'highcharts/modules/no-data-to-display'
import VueHighcharts from 'vue-highcharts'
import Highcharts from 'highcharts'
import HighchartsThemes from './HighchartsTheme'
import { Platform, Screen } from 'quasar'
import BusinessHours from 'vue-business-hours'
import { Vuelidate } from 'vuelidate'
import { VALID_ENG_COUNTRIES, VALID_NA_COUNTRIES } from 'src/constants/valid-countries'
import log from 'electron-log'
import { NOTIFICATION_CONFIGURATION } from 'src/constants/bootstrap-default'
import { Userpilot } from 'userpilot'
import { cloneDeep } from 'src/plugins/helpers/functions'
import { AxiosError } from 'axios'

Screen.setSizes({
  sm: 300,
  md: 605,
  lg: 1000,
  xl: 2000
})

loadStock(Highcharts)
loadExporting(Highcharts)
loadExportData(Highcharts)
loadOfflineExporting(Highcharts)
loadSunburst(Highcharts)
loadMap(Highcharts)
loadDrilldown(Highcharts)
More(Highcharts)
Highcharts.theme = HighchartsThemes.themes.future
HighchartsNoData(Highcharts)

Highcharts.setOptions(Highcharts.theme)
Highcharts.setOptions({
  chart: {
    style: {
      fontFamily: ['Quicksand', '-apple-system', 'system-ui', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
    }
  },

  exporting: {
    buttons: {
      contextButton: {
        menuItems: ['printChart', 'separator', 'downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG', 'separator', 'downloadCSV']
      }
    }
  }
})

window.Highcharts = Highcharts

// Userpilot
if (process.env.USERPILOT_APPTOKEN) {
  Userpilot.initialize(process.env.USERPILOT_APPTOKEN)
}

// local storage
storage.local.setItem('api_url', process.env.API_URL)
storage.local.setItem('api_reporting_url', process.env.API_REPORTING_URL)
storage.local.setItem('pusher_app_key', process.env.PUSHER_APP_KEY)
storage.local.setItem('pusher_cluster', process.env.PUSHER_CLUSTER)
storage.local.setItem('sentry_dsn_public', process.env.MIX_SENTRY_DSN_PUBLIC)
storage.local.setItem('ak_widget_url', process.env.AK_WIDGET_URL)
storage.local.setItem('aloware_demo_companies', Object.values(process.env.DEMO_COMPANY_IDS).join(','))
storage.local.setItem('custom_edge_location_companies', Object.values(process.env.CUSTOM_EDGE_LOCATION_COMPANY_IDS).join(','))

Vue.use(infiniteScroll)
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(PortalVue)
Vue.use(VueWaveSurfer)
Vue.use(Vuelidate)
Vue.use(BusinessHours)
Vue.use(VueHighcharts, { Highcharts })

window.Bowser = Bowser
window.timezone = 'Intl' in window
  ? new Intl.DateTimeFormat().resolvedOptions().timeZone
  : 'America/Los_Angeles'

if (process.env.APP_DEBUG) {
  Vue.config.devtools = true
}

// Require `PhoneNumberFormat`.
window.PNF = googlePhone.PhoneNumberFormat

// Get an instance of `PhoneNumberUtil`.
window.phoneUtil = googlePhone.PhoneNumberUtil.getInstance()

// Timezones for international companies (outside US and CA)
window.CountriesAndTimezones = CountriesAndTimezones

window.getLocaleIfPhoneNumberIsFromNorthAmerica = function (phoneNumber) {
  if (!phoneNumber) {
    return false
  }

  try {
    for (const validCountry of VALID_NA_COUNTRIES) {
      const number = window.phoneUtil.parseAndKeepRawInput(
        phoneNumber,
        validCountry
      )
      let isPossible = window.phoneUtil.isPossibleNumber(number)

      if (isPossible && window.phoneUtil.isValidNumberForRegion(number, validCountry)) {
        return validCountry
      }
      // for US get the national number
      if (validCountry === 'US') {
        const nationalNumber = number.getNationalNumber()
        // get the area code
        const areaCode = nationalNumber.toString().substring(0, 3)
        // if it's 728 then return US
        if (areaCode === '728') {
          return validCountry
        }
      }
    }

    return false
  } catch (err) {
    return false
  }
}

window.getLocaleIfPhoneNumberIsFromGreatBritainOrAustralia = function (phoneNumber) {
  if (!phoneNumber) {
    return false
  }

  try {
    for (let validCountry of VALID_ENG_COUNTRIES) {
      let number = window.phoneUtil.parseAndKeepRawInput(phoneNumber, validCountry)
      let isPossible = window.phoneUtil.isPossibleNumber(number)

      if (isPossible && window.phoneUtil.isValidNumberForRegion(number, validCountry)) {
        return validCountry
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

  // Use substring() and indexOf() functions to remove
  // portion of string after certain character (w => wait)
  // example, the extension wwww2wwwwww5wwwwww9 waits 2 seconds
  // before sending the digit 2, followed by a three second wait
  // before sending th 5, and finally another three second wait
  // before sending a 9. These are numbers behind IVR/extension
  let pos = phoneNumber.indexOf('w')

  if (pos !== -1) {
    phoneNumber = phoneNumber.substring(0, pos).trim()
  }

  try {
    // handle US and CA as an special case
    let northAmericaLocale = window.getLocaleIfPhoneNumberIsFromNorthAmerica(
      phoneNumber
    )

    if (northAmericaLocale) {
      return northAmericaLocale
    }

    // will add + to phone number and check again
    if (!phoneNumber.includes('+')) {
      northAmericaLocale = window.getLocaleIfPhoneNumberIsFromNorthAmerica('+' + phoneNumber)

      if (northAmericaLocale) {
        return northAmericaLocale
      }
    }

    // will add +1 to phone number and check again
    if (!phoneNumber.includes('+')) {
      northAmericaLocale = window.getLocaleIfPhoneNumberIsFromNorthAmerica('+1' + phoneNumber)

      if (northAmericaLocale) {
        return northAmericaLocale
      }
    }

    // handle GB & AU as a special case
    let englishLocale = window.getLocaleIfPhoneNumberIsFromGreatBritainOrAustralia(phoneNumber)

    if (englishLocale) {
      return englishLocale
    }

    // if we reached here then it's definitely not a US or CA number according to google-libphonenumber
    // let's check for international locales

    if (!phoneNumber.includes('+')) {
      phoneNumber = '+' + phoneNumber
    }

    let number = window.phoneUtil.parse(phoneNumber)
    let locale = window.phoneUtil.getRegionCodeForNumber(number)
    let isValid = window.phoneUtil.isValidNumber(number)

    if (!locale) {
      number = window.phoneUtil.parse(phoneNumber, 'US')
      locale = window.phoneUtil.getRegionCodeForNumber(number)
      isValid = window.phoneUtil.isValidNumber(number)

      return isValid
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
if (process.env.APP_ENV === 'production') {
  storage.local.setItem('env', 'production')
}

if (process.env.APP_ENV !== 'production') {
  storage.local.setItem('env', 'development')
}

const isNotLocal = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development'

if (isNotLocal && process.env.APP_ENV !== 'local') {
  Sentry.init({
    Vue,
    dsn: process.env.SENTRY_DSN_PUBLIC,
    environment: process.env.APP_ENV,
    tracingOptions: {
      trackComponents: true
    },
    attachProps: true,
    trackComponents: true,
    tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE,
    ignoreErrors: [
      'Non-Error promise rejection captured with value: undefined',
      'Cannot read property \'is_reseller\' of null',
      'Cannot set property \'_height\' of undefined',
      'Cannot read property \'offsetHeight\' of undefined',
      'No error message',
      '$ is not defined',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications.',
      'Request failed with status code 504',
      'Request failed with status code 500',
      'Action timed out',
      'Network Error',
      'Expired token',
      'Network request failed',
      'Failed to fetch',
      'NetworkError',
      'Navigation cancelled from',
      'Blocked a frame with origin',
      'AxiosError: Request failed with status code 401',
      'AxiosError: Request failed with status code 404',
      'AxiosError: Request failed with status code 422',
      'AxiosError: Request aborted',
      'AxiosError: timeout exceeded',
      /^CanceledError:/
    ],

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      new Sentry.BrowserTracing()
    ],

    beforeSend (event, hint) {
      if (hint?.originalException instanceof AxiosError && hint.originalException?.response) {
        if (hint.originalException.response?.status === 404) {
          return null
        }
      }

      return event
    }
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
    const message = { data: response.data.error }
    const error = { data: null }

    switch (response.status) {
      case 401:
        if (!response.data.errors.length && response.data.error) {
          message.data = `${response.data.error}`
        }

        if (response.data.errors.length && response.data.error) {
          message.data = `<p class="pt-1 pb-1">- ${response.data.error}</p>`
        }

        if (response.data.errors.length) {
          response.data.errors = ''

          for (error.data of response.data.errors) {
            message.data += `<p class="pt-1 pb-1">- ${error.data}</p>`
          }
        }

        break
      case 403:
        message.data = 'You do not have enough permissions to make this request.'

        if (response.data && response.data.error) {
          message.data = response.data.error
        }

        break
      case 404:
        message.data = response?.data?.error ?? 'Requested resource not found.'
        break
      case 400:
        message.data = response.data.error || response.data.message
        break
      case 422:
        message.data = ''
        const keys = Object.keys(response.data.errors)

        keys.forEach((value) => {
          message.data += keys.length > 1 ? `<p class="pt-1 pb-1">- ${response.data.errors[value]}</p>` : response.data.errors[value]
        })

        break
      case 500:
        message.data = 'Oops! We are having some problems right now, please try again later.'
    }

    if (window._.isEmpty(message.data.trim())) {
      return
    }

    this.$generalNotification(message.data, 'error', 5000, true)
  }
}

Vue.prototype.$handleUploadErrors = function (error) {
  if (typeof error === 'string') {
    error = JSON.parse(error)
  }

  let err = {}

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

Vue.prototype.$handleRouteError = (error) => {
  if (error.name !== 'NavigationDuplicated' &&
    !error.message.includes('Avoided redundant navigation to current location')) {
    console.log(error)
  }
}

Vue.prototype.$downloadFileWithUuid = async function (uuid, filename, type = 'common') {
  if (!uuid) {
    this.$generalNotification('Failed to download file, missing UUID', 'error')
  }

  const url = (type !== 'csv'
    ? '/static/uploaded_file/'
    : '/download/') + uuid

  return window.axios.get(url, {
    params: {
      force_download: 1
    },
    responseType: 'arraybuffer'
  })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      link.click()
    })
    .catch(() => {
      this.$generalNotification('Failed to download file.', 'error')
    })
}

Vue.prototype.$downloadFileWithUrl = async function (url, filename, type = 'common') {
  if (!url) {
    this.$generalNotification('Failed to download file, missing URL', 'error')
  }

  return fetch(url)
    .then(async (response) => {
      const link = document.createElement('a')
      const file = await response.blob()
      link.href = window.URL.createObjectURL(file)
      link.setAttribute('download', filename)
      link.dataset.downloadurl = ['application/octet-stream', link.download, link.href].join(':')
      link.click()
    })
    .catch(() => {
      this.$generalNotification('Failed to download file.', 'error')
    })
}

Vue.prototype.$generalNotification = function (message, type = null, timeout = 5000, html = false, actionOptions = {}) {
  if (!message || window._.isEmpty(message.trim())) {
    return
  }

  const uuid = window._.get(actionOptions, 'uuid', null)
  const filename = window._.get(actionOptions, 'filename', null)
  const colorClass = { data: '' }
  let actions = [{
    icon: 'close',
    color: 'black',
    class: 'close-button px-1 pb-1'
  }]

  switch (type) {
    case 'updated':
      colorClass.data = 'bg-blue-10'
      break
    case 'warning':
      colorClass.data = 'bg-orange-2'
      break
    case 'deleted':
    case 'error':
      colorClass.data = 'bg-red-10'
      break
    case 'export-csv':
      actions = [{
        label: 'Download',
        color: 'primary',
        class: 'px-2',
        handler: () => {
          if (uuid) {
            this.$downloadFileWithUuid(uuid, filename, 'csv')
          }
        }
      }]
      colorClass.data = 'bg-green-10'
      break
    case 'redirect':
      actions = [{
        label: 'Go to page',
        color: 'primary',
        class: 'px-2',
        handler: () => {
          if (actionOptions.path) {
            this.$router.push({
              path: actionOptions.path
            })
          }
        }
      }]
      colorClass.data = 'bg-green-10'
      break
    case 'error-redirect':
      actions = [{
        label: 'Go to page',
        color: 'primary',
        class: 'px-2',
        handler: () => {
          if (actionOptions.path) {
            this.$router.push({
              path: actionOptions.path
            })
          }
        }
      }]
      colorClass.data = 'bg-red-10'
      break
    default:
      colorClass.data = 'bg-green-10'
  }

  const options = {
    group: false,
    classes: `general-notification text-black ${colorClass.data} ml-7`,
    timeout: timeout,
    message: message,
    position: 'bottom-left',
    html: html,
    actions: actions
  }

  return this.$q.notify(options)
}

window.actionNotificationUnqueuedIntervals = {}
window.actionNotificationQueuedIntervals = {}

Vue.prototype.$actionNotification = window._.debounce(function (notificationData) {
  const settings = {
    title: window._.get(notificationData, 'title', null),
    message: window._.get(notificationData, 'message', null),
    messageIcon: window._.get(notificationData, 'messageIcon', null),
    attachment: window._.get(notificationData, 'attachment', null),
    type: window._.get(notificationData, 'type', null),
    contactId: window._.get(notificationData, 'contactId', null),
    communicationId: window._.get(notificationData, 'communicationId', null),
    campaignId: window._.get(notificationData, 'campaignId', null),
    campaignName: window._.get(notificationData, 'campaignName', null),
    ringGroupName: window._.get(notificationData, 'ringGroupName', null),
    phoneNumber: window._.get(notificationData, 'phoneNumber', null),
    dateTime: window._.get(notificationData, 'dateTime', this.$moment()),
    communication: window._.get(notificationData, 'communication', null),
    contact: window._.get(notificationData, 'contact', null)
  }

  // skip if same notification
  if (['call', 'incomingCall', 'callFishing'].includes(settings.type) &&
    this.$store.state.notifications[settings.type].communicationId === settings.communicationId) {
    return
  }

  const noMessage = !['sms', 'incomingCall', 'callFishing'].includes(settings.type) && !settings.message
  const smsNoMessage = settings.type === 'sms' && !settings.message && !settings.attachment

  if (!settings.title || noMessage || smsNoMessage) {
    return
  }

  const data = {
    type: settings.type,
    data: null
  }

  // if call is still on-going and fishing mode active, we queue the notification
  if (settings.type === 'callFishing' &&
    this.$store.state.notifications[settings.type].communicationId &&
    this.$store.state.notifications[settings.type].communicationId !== settings.communicationId) {
    let queue = window._.get(this.$store.state.notifications, `${settings.type}.queue`, [])
    queue = !queue ? [] : JSON.parse(JSON.stringify(queue))
    const found = queue.find(item => item.contactId === settings.contactId && item.communicationId === settings.communicationId)

    if (found) {
      return
    }

    queue.push(settings)

    data.data = JSON.parse(JSON.stringify(this.$store.state.notifications[settings.type]))
    data.data.queue = queue
    this.$store.commit('SET_NOTIFICATIONS', data)

    if (settings.type === 'callFishing') {
      this.$store.commit('ADD_TO_CALL_FISHING_QUEUE', settings)
    }

    return
  }

  if (settings.type !== 'callFishing') {
    this.$bvToast.hide(settings.type)
  }

  data.data = settings

  let unqueuedCounter = 0
  let queue = null

  if (settings.type !== 'callFishing') {
    queue = this.$store.state.notifications?.[settings.type]?.queue?.find(queue => queue.communicationId === settings.communicationId)
  }

  // if notification is unqueued, then we can show the notification
  if (!queue) {
    clearInterval(window.actionNotificationUnqueuedIntervals?.[settings.type])

    window.actionNotificationUnqueuedIntervals[settings.type] = setInterval(() => {
      // we have to make sure there's no notification (by settings type) currently showing
      if (!document.getElementById(settings.type)) {
        this.$store.commit('SET_NOTIFICATIONS', data)

        if (settings.type === 'callFishing') {
          this.$store.commit('ADD_TO_CALL_FISHING_QUEUE', settings)
        }

        this.$bvToast.show(settings.type)

        clearInterval(window.actionNotificationUnqueuedIntervals?.[settings.type])
      }

      unqueuedCounter++

      if (unqueuedCounter > NOTIFICATION_CONFIGURATION.clearIntervalSecondsLimit) {
        clearInterval(window.actionNotificationUnqueuedIntervals?.[settings.type])
      }
    }, NOTIFICATION_CONFIGURATION.notificationIntervalMilliseconds)

    return
  }

  let queuedCounter = 0
  clearInterval(window.actionNotificationQueuedIntervals?.[settings.type])

  window.actionNotificationQueuedIntervals[settings.type] = setInterval(() => {
    queue = this.$store.state.notifications?.[settings.type]?.queue?.find(queue => queue.communicationId === settings.communicationId)

    // if call is not queued in our call fishing notification queue,
    // then we no longer need to continue to wait for notification availability
    if (!queue) {
      clearInterval(window.actionNotificationQueuedIntervals[settings.type])

      return
    }

    if (!document.getElementById(settings.type)) {
      this.$store.commit('SET_NOTIFICATIONS', data)

      if (settings.type === 'callFishing') {
        this.$store.commit('ADD_TO_CALL_FISHING_QUEUE', settings)
      }

      this.$bvToast.show(settings.type)
      clearInterval(window.actionNotificationQueuedIntervals[settings.type])

      return
    }

    queuedCounter++

    if (queuedCounter > NOTIFICATION_CONFIGURATION.clearIntervalSecondsLimit) {
      clearInterval(window.actionNotificationQueuedIntervals[settings.type])
    }
  }, NOTIFICATION_CONFIGURATION.notificationIntervalMilliseconds)
}, 100)

Vue.prototype.$closeActionNotification = function (type) {
  if (document.getElementById(type)) {
    this.$bvToast.hide(type)
  }
}

Vue.prototype.$generalActionNotification = window._.debounce(function (title = 'System Updates', message = 'Refresh your screen', messageIcon = null, type = 'system', contactId = null, communicationId = null, dateTime = this.$moment()) {
  // action notifications that will show up many times
  const icon = (type === 'call' || type === 'call-voicemail') ? 'call-icon' : 'sms-icon'
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
}, NOTIFICATION_CONFIGURATION.notificationIntervalMilliseconds)

Vue.prototype.$jsonClone = (value) => {
  return cloneDeep(value)
}

Vue.prototype.$copyToClipboard = (value) => {
  if (!value) {
    return
  }

  const el = document.createElement('textarea')
  el.value = value
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)

  const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false

  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)

  if (selected) {
    document.getSelection().removeAllRanges()
    document.getSelection().addRange(selected)
  }
}

// eslint-disable-next-line no-extend-native
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

Vue.prototype.$alphabeticalSort = (items, property = 'name') => {
  if (window._.isEmpty(items)) {
    return items
  }

  return window._.clone(items).sort((a, b) => {
    const textA = a[property].toUpperCase()
    const textB = b[property].toUpperCase()

    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
  })
}

Vue.prototype.$isNumeric = (value) => {
  let regex = /^-{0,1}\d*\.{0,1}\d+$/

  return regex.test(value)
}

Vue.prototype.$electronLog = (value) => {
  if (!value || !Platform.is.electron) {
    return
  }

  log.transports.file.level = 'info'
  log.transports.file.maxSize = 5 * 1024 * 1024
  log.info(value)
}
