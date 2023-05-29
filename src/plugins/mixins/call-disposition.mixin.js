import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState([
      'callDispositions'
    ])
  },

  methods: {
    callDispositionName (callDispositionId) {
      // find callDisposition
      const callDisposition = this.callDispositions.find((callDisposition) => callDisposition.id === callDispositionId)

      // return name if found
      if (callDisposition) {
        return callDisposition.name.capitalize()
      }

      return '-'
    },

    callDispositionColor (callDispositionId) {
      // find callDisposition
      const callDisposition = this.callDispositions.find((callDisposition) => callDisposition.id === callDispositionId)

      // return name if found
      if (callDisposition) {
        return callDisposition.color
      }

      return '#D3D3D3'
    }
  }
}
