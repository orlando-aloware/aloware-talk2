import store from '../store/index'
import * as storage from 'src/plugins/helpers/storage'

export default {
  user: {
    authenticated: false,
    profile: null
  },

  check (preventLogout = false) {
    if (storage.local.getItem('api_token') === null) {
      this.user.authenticated = false
      this.user.profile = null

      return Promise.reject()
    } else {
      window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + storage.local.getItem('api_token')
      return window.axios.post('/get-auth-user', {
        device_info: null
      }).then((res) => {
        // success
        window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + storage.local.getItem('api_token')
        this.user.authenticated = true
        this.user.profile = res.data.user
        store().commit('SET_USAGE', res.data.user.usage)
        store().commit('SET_USER_STATUS', res.data.user.enabled)

        return Promise.resolve(res)
      }).catch((err) => {
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
    }).then((res) => {
      // success
      storage.local.setItem('api_token', res.data.meta.token)
      store().commit('SET_FIRST_LOGIN', res.data.data.first_login)
      this.check()

      return Promise.resolve(res)
    }).catch((err) => {
      // error
      return Promise.reject(err)
    })
  },

  logout (deviceInfo = null) {
    return window.axios.post('/logout', {
      device_info: deviceInfo
    }).then((res) => {
      // success
      storage.local.removeItem('api_token')
      storage.local.removeItem('impersonate')
      storage.local.removeItem('portal_session')
      storage.local.removeItem('company_id')
      window.axios.defaults.headers.common['Authorization'] = null
      this.user.authenticated = false
      this.user.profile = null

      return Promise.resolve(res)
    }).catch((err) => {
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
    }).then((res) => {
      // success
      return Promise.resolve(res)
    }).catch((err) => {
      // error
      return Promise.reject(err)
    })
  },

  forgotPass (email) {
    return window.axios.post('/forgot', {
      email: email
    }).then((res) => {
      // success
      return Promise.resolve(res)
    }).catch((err) => {
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
    }).then((res) => {
      // success
      return Promise.resolve(res)
    }).catch((err) => {
      // error
      return Promise.reject(err)
    })
  },

  impersonate (userId, company) {
    return window.axios.post('/api/v1/user/' + userId + '/impersonate').then((res) => {
      // success
      if (company) {
        storage.local.setItem('api_token', res.data.api_token)
        window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + storage.local.getItem('api_token')
        storage.local.setItem('impersonate', true)
        storage.local.setItem('company_id', company.id)
      } else {
        return Promise.reject()
      }
    }).catch((err) => {
      // error
      return Promise.reject(err)
    })
  }
}
