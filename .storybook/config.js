import { configure } from '@storybook/vue'
import { setConsoleOptions } from '@storybook/addon-console'

import Vue from 'vue'
import 'highlight.js/styles/github.css'
import googlePhone from 'google-libphonenumber'
import jstz from 'jstimezonedetect'
import Quasar from 'quasar'

import filters from '../src/boot/filters'

import axios from 'axios'
window.axios = axios
window.axios.defaults.baseURL = process.env.API_URL
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
window.axios.defaults.headers.common['Requested-From'] = 'desktop'
let apiToken = localStorage.getItem('api_token')
if (apiToken) {
  window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('api_token')
}
Vue.prototype.$axios = window.axios

import auth from 'boot/auth'
auth.login('support@alodev.org', 'astro123', true)
  .catch((err) => {
    console.log('Failed to login. Error details: ', err)
  })

import CountriesAndTimezones from 'countries-and-timezones'
window.CountriesAndTimezones = CountriesAndTimezones

import moment from 'moment'
import 'moment-timezone'
import momentDurationFormatSetup from 'moment-duration-format'
momentDurationFormatSetup(moment)
window.moment = moment
Vue.use(moment)

import 'bootstrap/scss/bootstrap.scss'
// import 'bootstrap-vue/src/index.scss';

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

import 'quasar/dist/quasar.min.css'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'

import './../src/css/breakpoints.scss'
import './../src/css/quasar.variables.scss'
import './../src/css/mixins.scss'
import './../src/css/fonts.scss'
import './../src/css/variables.scss'
import './../src/css/svg.scss'

import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'
Vue.component('VueCtkDateTimePicker', VueCtkDateTimePicker)

Vue.use(Quasar)
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(filters({Vue}))

window.timezone = jstz.determine().name()

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

configure(require.context('../src', true, /\.stories\.js$/), module)

setConsoleOptions({
  panelExclude: [],
})
