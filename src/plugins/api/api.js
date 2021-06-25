let suffixV1 = '/api/v1/'

export default {
  V1: {
    contact: {
      get: function (id) {
        return window.axios.get(`${suffixV1}contact/${id}`)
      },
      getAttributes (id) {
        return window.axios.get(`${suffixV1}contact-attributes/${id}`)
      },
      update: function (id, params) {
        return window.axios.put(`${suffixV1}contact/${id}`, params)
      },
      getPhoneNumbers (id) {
        return window.axios.get(`${suffixV1}contact/${id}/phone-numbers`)
      },
      getRingGroups (id) {
        return window.axios.get(`${suffixV1}contact/${id}/ring-groups`)
      },
      storeTags (id, params) {
        return window.axios.post(`${suffixV1}contact/${id}/tag`, params)
      },
      storeLines (id, params) {
        return window.axios.put(`${suffixV1}contact/${id}/campaigns`, params)
      },
      storeRingGroups (id, params) {
        return window.axios.put(`${suffixV1}contact/${id}/ring-groups`, params)
      },
      storePhone (id, params) {
        return window.axios.post(`${suffixV1}contact/${id}/phone-number`, params)
      },
      updatePhone (id, phoneId, params) {
        return window.axios.post(`${suffixV1}contact/${id}/phone-number/${phoneId}`, params)
      }
    },
    tags: {
      get () {
        return window.axios.get(`${suffixV1}tag?full_load=true`)
      }
    },
    lines: {
      get () {
        return window.axios.get(`${suffixV1}campaign`)
      }
    },
    ring_groups: {
      get () {
        return window.axios.get(`${suffixV1}ring-group`)
      }
    }

  },
  V2: {
    contact: {
      getRingGroups (id) {
        return window.axios.get(`/api/v2/contact/${id}/ring-groups`)
      }
    }
  }

}
