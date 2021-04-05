import get from 'lodash/get'

const fetchContacts = async ({ commit }, params) => {
  try {
    commit('SET_LOADING', true)

    const response = await window.axios.get('/contact', { params })
    const contacts = get(response, 'data.data', [])

    commit('SET_LOADING', false)
    commit('SET_CONTACTS', contacts)
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject(err)
  }
}

const fetchCounts = async ({ commit }, params) => {
  try {
    commit('SET_LOADING', true)

    const response = await window.axios.get('/get-contacts-count', { params })
    const counts = get(response, 'data.data', {})

    commit('SET_LOADING', false)
    commit('SET_COUNTS', counts)
  } catch (err) {
    commit('SET_LOADING', false)
    return Promise.reject(err)
  }
}

export default { fetchContacts, fetchCounts }
