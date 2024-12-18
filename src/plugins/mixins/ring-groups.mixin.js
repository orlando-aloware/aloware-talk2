import { mapState } from 'vuex'

export default {
  data () {
    return {
    }
  },
  computed: {
    ...mapState(['ringGroups'])
  },

  methods: {
    getRingGroup (id) {
      if (!id) {
        return null
      }
      let found = this.ringGroups.find(ringGroup => ringGroup.id === id)
      if (found) {
        return found
      }

      return null
    }
  }
}
