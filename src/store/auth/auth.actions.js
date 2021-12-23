const check = async ({ commit }, preventLogout = false) => {
  try {
    if (localStorage.getItem('api_token') === null) {
      return Promise.reject('unauthorized')
    }

    window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('api_token')

    commit('SET_LOADING', true)

    const response = await window.axios.post('/get-auth-user', {
      device_info: null
    })

    const { user } = response.data

    window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('api_token')

    commit('SET_AUTHENTICATED', true)
    commit('SET_PROFILE', user)
    commit('SET_LOADING', false)
    commit('SET_USAGE', user.usage, { root: true })
    commit('SET_USER_STATUS', user.enabled, { root: true })

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
  try {
    commit('SET_LOADING', true)

    const response = await window.axios.post('/login', params)

    const { meta, data } = response.data

    localStorage.setItem('api_token', meta.token)

    commit('SET_FIRST_LOGIN', data.first_login, { root: true })

    commit('SET_LOADING', false)

    await check({ commit }, {})

    return response
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject(err)
  }
}

const getSharedCookie = async () => {
  let name = 'aloware_shared_auth_token='
  let ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

const getCookieUser = async ({ commit }) => {
  try {
    commit('SET_LOADING', true)

    let name = 'aloware_shared_auth_token='
    let sharedToken = ''
    let ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        sharedToken = c.substring(name.length, c.length)
      }
    }

    let cookieParams = { shared_token: sharedToken }

    const response = await window.axios.get('/get-cookie-user', { params: cookieParams })

    const { meta, data } = response.data

    localStorage.setItem('api_token', meta.token)

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

    localStorage.removeItem('api_token')
    localStorage.removeItem('impersonate')
    localStorage.removeItem('portal_session')
    localStorage.removeItem('company_id')

    window.axios.defaults.headers.common['Authorization'] = null

    commit('SET_LOADING', false)
    commit('SET_AUTHENTICATED', false)
    commit('SET_PROFILE', null)
    return response
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject(err)
  }
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

const forgotPass = async ({ commit }, { email }) => {
  try {
    commit('SET_LOADING', true)
    await window.axios.post('/forgot', { email })
    commit('SET_LOADING', false)
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject((err))
  }
}

const resetPass = async ({ commit }, payload) => {
  try {
    const { email, password, passwordConfirmation, token } = payload

    const params = {
      email: email,
      password: password,
      password_confirmation: passwordConfirmation,
      token: token
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

    // eslint-disable-next-line camelcase
    const { api_token } = response.data

    commit('SET_LOADING', false)

    if (company) {
      localStorage.setItem('api_token', api_token)

      window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('api_token')

      localStorage.setItem('impersonate', true)

      localStorage.setItem('company_id', company.id)

      return Promise.resolve()
    } else {
      return Promise.reject()
    }
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject(err)
  }
}

const setAgentStatus = async ({ commit }, agentStatus) => {
  commit('SET_AGENT_STATUS', agentStatus)
}

const setProfile = async ({ commit }, user) => {
  commit('SET_PROFILE', user)
}

export default {
  check, login, logout, register, forgotPass, resetPass, impersonate, setAgentStatus, setProfile, getCookieUser, getSharedCookie
}
