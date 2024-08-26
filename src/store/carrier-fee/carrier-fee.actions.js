import API from 'src/plugins/api/api'

export default {
  async fetchCarrierFees ({ state, commit }) {
    if (state.carrierFees.length) {
      return
    }

    try {
      const res = await API.V1.carrierFees.get()
      commit('SET_CARRIER_FEES', res.data)
    } catch (err) {
      commit('SET_CARRIER_FEES', [])
      console.log(err)
      this._vm.$handleErrors(err.response)
    }
  }
}
