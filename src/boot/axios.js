import Vue from 'vue'
import axios, { AxiosError } from 'axios'
import { Platform } from 'quasar'
import * as storage from 'src/plugins/helpers/storage'

window.axios = axios

window.axios.defaults.baseURL = process.env.API_URL
window.axios.defaults.withCredentials = true

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

window.axios.interceptors.response.use(response => response, error => {
  if (error.response) {
    switch (error.response.status) {
      // 401
      case AxiosError.UNAUTHORIZED:
        console.log('Session expired or user not authenticated', error.response?.data)
        break
      // 404
      case AxiosError.NOT_FOUND:
        console.log('Requested resource not found', error.response?.data)
        break
      // 422
      case AxiosError.UNPROCESSABLE_ENTITY:
        console.log('Validation error', error.response?.data)
        break
      // 500
      case AxiosError.INTERNAL_SERVER_ERROR:
        console.log('Internal server error', error.response?.data)
        break
      default:
        console.log('An unexpected error occurred', error.response?.data)
    }
  } else if (error.request) {
    console.log('No response received')
  } else {
    console.log('Error setting up the request')
  }

  return Promise.reject(error)
})

Vue.prototype.$axios = window.axios
