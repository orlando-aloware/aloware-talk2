import store from '../store/index'
import { Platform } from 'quasar'

export default {
  user: {
    authenticated: false,
    profile: null
  },

  check (preventLogout = false) {
    let deviceInfo = null
    const isMobile = Platform.is.cordova
    if (isMobile) {
      deviceInfo = {
        registration_id: localStorage.getItem('registrationId'),
        registration_type: localStorage.getItem('registrationType'),
        model: window.device.model,
        platform: window.device.platform,
        is_virtual: window.device.isVirtual,
        uuid: window.device.uuid,
        version: window.device.version,
        manufacturer: window.device.manufacturer,
        serial: window.device.serial,
        app_version: localStorage.getItem('version')
      }
    }
    if (localStorage.getItem('api_token') === null) {
      this.user.authenticated = false
      this.user.profile = null

      return Promise.reject()
    } else {
      window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('api_token')
      return window.axios.post('/get-auth-user', {
        device_info: deviceInfo
      })
        .then((res) => {
          // success
          window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('api_token')
          this.user.authenticated = true
          this.user.profile = res.data.user
          store().commit('SET_USAGE', res.data.user.usage)
          store().commit('SET_USER_STATUS', res.data.user.enabled)

          return Promise.resolve(res)
        })
        .catch((err) => {
          if (!preventLogout) {
            // error
            this.user.authenticated = false
            this.user.profile = null
          }

          return Promise.reject(err)
        })
    }
  },

  login (email, password, rememberMe, isMobile = false, deviceInfo = null) {
    return window.axios.post('/login', {
      email: email,
      password: password,
      remember_me: rememberMe,
      is_mobile: isMobile,
      device_info: deviceInfo
    })
      .then((res) => {
        // success
        localStorage.setItem('api_token', res.data.meta.token)
        store().commit('SET_FIRST_LOGIN', res.data.data.first_login)
        this.check()

        return Promise.resolve(res)
      })
      .catch((err) => {
        // error
        return Promise.reject(err)
      })
  },

  logout (deviceInfo = null) {
    return window.axios.post('/logout', {
      device_info: deviceInfo
    })
      .then((res) => {
        // success
        localStorage.removeItem('api_token')
        localStorage.removeItem('impersonate')
        localStorage.removeItem('portal_session')
        localStorage.removeItem('company_id')
        window.axios.defaults.headers.common['Authorization'] = null
        this.user.authenticated = false
        this.user.profile = null

        return Promise.resolve(res)
      })
      .catch((err) => {
        // error
        return Promise.reject(err)
      })
  },

  register (name, email, password, companyName, phoneNumber, timezone) {
    return window.axios.post('/register', {
      name: name,
      email: email,
      password: password,
      company_name: companyName,
      phone_number: phoneNumber,
      timezone: timezone
    })
      .then((res) => {
        // success
        return Promise.resolve(res)
      })
      .catch((err) => {
        // error
        return Promise.reject(err)
      })
  },

  forgotPass (email) {
    return window.axios.post('/forgot', {
      email: email
    })
      .then((res) => {
        // success
        return Promise.resolve(res)
      })
      .catch((err) => {
        // error
        return Promise.reject(err)
      })
  },

  resetPass (email, password, passwordConfirmation, token) {
    return window.axios.post('/reset', {
      email: email,
      password: password,
      password_confirmation: passwordConfirmation,
      token: token
    })
      .then((res) => {
        // success
        return Promise.resolve(res)
      })
      .catch((err) => {
        // error
        return Promise.reject(err)
      })
  },

  impersonate (userId, company) {
    return window.axios.post('/api/v1/user/' + userId + '/impersonate')
      .then((res) => {
        // success
        if (company) {
          localStorage.setItem('api_token', res.data.api_token)
          window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('api_token')
          localStorage.setItem('impersonate', true)
          localStorage.setItem('company_id', company.id)
        } else {
          return Promise.reject()
        }
      })
      .catch((err) => {
        // error
        return Promise.reject(err)
      })
  }
}
