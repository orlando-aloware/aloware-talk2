import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState([
      'dispositionStatuses'
    ])
  },

  methods: {
    dispositionStatusName (dispositionStatusId) {
      // find dispositionStatus
      const dispositionStatus = this.dispositionStatuses.find((dispositionStatus) => dispositionStatus.id === dispositionStatusId)

      // return name if found
      if (dispositionStatus) {
        return dispositionStatus.name
      }

      return '-'
    },

    dispositionStatusColor (dispositionStatusId) {
      // find dispositionStatus
      const dispositionStatus = this.dispositionStatuses.find((dispositionStatus) => dispositionStatus.id === dispositionStatusId)

      // return name if found
      if (dispositionStatus) {
        return dispositionStatus.color
      }

      return '#D3D3D3'
    }
  }
}
