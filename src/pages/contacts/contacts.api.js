export default {
  get: function (id) {
    return window.axios.get(`/api/v1/contact/${id}`)
  },
  getPhoneNumbers (id) {
    return window.axios.get(`/api/v1/contact/${id}/phone-numbers`)
  },
  getRingGroups (id) {
    return window.axios.get(`/api/v2/contact/${id}/ring-groups`)
  }
}
