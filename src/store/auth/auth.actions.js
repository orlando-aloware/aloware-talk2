import * as storage from 'src/plugins/helpers/storage'
import { get } from 'lodash'

const check = async ({ commit }, payload) => {
  const preventLogout = get(payload, 'preventLogout', false)
  const preventRedirect = get(payload, 'preventRedirect', false)

  try {
    // check if we have api token
    if (storage.local.getItem('api_token') !== null) {
      window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + storage.local.getItem('api_token')
    }

    commit('SET_LOADING', true)

    const response = await window.axios.post('/get-auth-user', {
      device_info: null
    })

    storage.local.setItem('api_token', response.data.user.api_token)

    window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + storage.local.getItem('api_token')

    commit('SET_AUTHENTICATED', true)
    commit('SET_PROFILE', response.data.user)
    commit('SET_LOADING', false)
    commit('SET_USAGE', response.data.user.usage, { root: true })
    commit('SET_USER_STATUS', response.data.user.enabled, { root: true })

    if (!preventRedirect &&
      (!response.data.user.enabled ||
      !response.data.user.company.enabled) &&
      window.location.href.indexOf('/suspended') === -1) {
      window.location.href = '/suspended'
    }

    if (!preventRedirect &&
      response.data.user.enabled &&
      response.data.user.company.enabled &&
      (window.location.href.indexOf('/suspended') !== -1 ||
        (window.location.href.indexOf('/login') !== -1 &&
          window.location.href.indexOf('suspended') !== -1))) {
      window.location.href = '/'
    }

    return response
  } catch (err) {
    commit('SET_LOADING', false)
    if (!preventLogout) {
      // error
      commit('SET_AUTHENTICATED', false)
      commit('SET_PROFILE', null)
    }
    return Promise.reject(err)
  }
}

const login = async ({ commit }, {
  email,
  password,
  rememberMe,
  recaptchaResponse = null,
  isMobile = false,
  deviceInfo = null
}) => {
  const params = {
    email: email,
    password: password,
    remember_me: rememberMe,
    is_mobile: isMobile,
    device_info: deviceInfo
  }

  if (recaptchaResponse) {
    params.recaptcha_response = recaptchaResponse
  }

  try {
    commit('SET_LOADING', true)

    const response = await window.axios.post('/login', params)

    const { meta, data } = response.data

    storage.local.setItem('shared_cookie', meta.hashed_token)

    storage.local.setItem('api_token', meta.token)

    commit('SET_FIRST_LOGIN', data.first_login, { root: true })

    commit('SET_LOADING', false)

    await check({ commit }, {})

    return response
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject(err)
  }
}

const getSharedCookie = () => {
  const name = 'aloware_shared_auth_token='
  const ca = document.cookie.split(';')
  const index = { i: 0 }
  const c = { data: null }
  for (index.i = 0; index.i < ca.length; index.i++) {
    c.data = ca[index.i]
    while (c.data.charAt(0) === ' ') {
      c.data = c.data.substring(1)
    }
    if (c.data.indexOf(name) === 0) {
      return c.data.substring(name.length, c.data.length)
    }
  }
  return null
}

const getCookieUser = async ({ commit }) => {
  try {
    commit('SET_LOADING', true)

    const cookieParams = { shared_token: getSharedCookie() }

    const response = await window.axios.get('/get-cookie-user', { params: cookieParams })

    const { meta, data } = response.data

    if (!data.company.talk_enabled) {
      commit('SET_LOADING', false)
      return Promise.reject()
    }

    storage.local.setItem('api_token', meta.token)

    commit('SET_FIRST_LOGIN', data.first_login, { root: true })

    commit('SET_LOADING', false)

    await check({ commit }, {})

    return response
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject(err)
  }
}

const logout = async ({ commit }) => {
  try {
    commit('SET_LOADING', true)

    const response = await window.axios.post('/logout')

    clear({ commit })

    commit('SET_LOADING', false)

    return response
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject(err)
  }
}

const clear = ({ commit }) => {
  storage.local.removeItem('api_token')
  storage.local.removeItem('impersonate')
  storage.local.removeItem('portal_session')
  storage.local.removeItem('company_id')
  storage.local.removeItem('shared_cookie')

  window.axios.defaults.headers.common['Authorization'] = null

  if (window.Intercom) {
    window.Intercom('shutdown')
  }

  commit('SET_AUTHENTICATED', false)
  commit('SET_PROFILE', null)
}

const register = async ({ commit }, payload) => {
  try {
    const {
      name,
      email,
      password,
      companyName,
      phoneNumber,
      timezone
    } = payload
    const params = {
      name: name,
      email: email,
      password: password,
      company_name: companyName,
      phone_number: phoneNumber,
      timezone: timezone
    }
    commit('SET_LOADING', true)

    await window.axios.post('/register', params)

    commit('SET_LOADING', false)
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject(err)
  }
}

const forgotPass = async ({ commit }, {
  email,
  recaptchaResponse = null
}) => {
  try {
    const params = {
      email: email
    }

    if (recaptchaResponse) {
      params.recaptcha_response = recaptchaResponse
    }

    commit('SET_LOADING', true)
    await window.axios.post('/forgot', params)
    commit('SET_LOADING', false)
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject((err))
  }
}

const resetPass = async ({ commit }, payload) => {
  try {
    const {
      email,
      password,
      passwordConfirmation,
      token,
      recaptchaResponse = null
    } = payload

    const params = {
      email: email,
      password: password,
      password_confirmation: passwordConfirmation,
      token: token
    }

    if (recaptchaResponse) {
      params.recaptcha_response = recaptchaResponse
    }

    commit('SET_LOADING', true)
    await window.axios.post('/reset', params)
    commit('SET_LOADING', false)
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject(err)
  }
}

const impersonate = async ({ commit }, payload) => {
  try {
    const { userId, company } = payload

    commit('SET_LOADING', true)

    const response = await window.axios.post('/api/v1/user/' + userId + '/impersonate')

    const { apiToken } = response.data

    commit('SET_LOADING', false)

    if (company) {
      storage.local.setItem('api_token', apiToken)

      window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + apiToken

      storage.local.setItem('impersonate', true)

      storage.local.setItem('company_id', company.id)

      return Promise.resolve()
    } else {
      return Promise.reject()
    }
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject(err)
  }
}

const setAgentStatus = ({ commit }, agentStatus) => {
  commit('SET_AGENT_STATUS', agentStatus)
}

const setProfile = ({ commit }, user) => {
  commit('SET_PROFILE', user)
}

export default {
  check,
  login,
  getSharedCookie,
  getCookieUser,
  logout,
  clear,
  register,
  forgotPass,
  resetPass,
  impersonate,
  setAgentStatus,
  setProfile
}
