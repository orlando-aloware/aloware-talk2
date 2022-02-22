import Vue from 'vue'
import axios from 'axios'
import { Platform } from 'quasar'
import * as storage from 'src/plugins/helpers/storage'

window.axios = axios

window.axios.defaults.baseURL = process.env.API_URL

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

if (Platform.is.desktop) {
  window.axios.defaults.headers.common['Requested-From'] = 'talk2-web'
}

if (Platform.is.electron) {
  window.axios.defaults.headers.common['Requested-From'] = 'talk2-desktop'
}

if (Platform.within.iframe) {
  window.axios.defaults.headers.common['Requested-From'] = 'talk2-iframe'
}

if (storage.local.getItem('api_token')) {
  window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + storage.local.getItem('api_token')
}

Vue.prototype.$axios = window.axios
