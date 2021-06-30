import Vue from 'vue'
import axios from 'axios'
import { Platform } from 'quasar'

window.axios = axios

window.axios.defaults.baseURL = process.env.API_URL

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

if (Platform.is.electron) {
  window.axios.defaults.headers.common['Requested-From'] = 'talk2-desktop'
}

if (Platform.within.iframe) {
  window.axios.defaults.headers.common['Requested-From'] = 'talk2-iframe'
}

if (Platform.is.desktop) {
  window.axios.defaults.headers.common['Requested-From'] = 'talk2-web'
}

if (Platform.is.mobile) {
  window.axios.defaults.headers.common['Requested-From'] = 'mobile-web'
}

let apiToken = localStorage.getItem('api_token')
if (apiToken) {
  window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('api_token')
}

Vue.prototype.$axios = window.axios
