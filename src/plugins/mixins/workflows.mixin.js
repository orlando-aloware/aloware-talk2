import { mapState } from 'vuex'

export default {
  data () {
    return {
    }
  },
  computed: {
    ...mapState(['workflows'])
  },

  methods: {
    getWorkflow (id) {
      if (!id) {
        return null
      }
      let found = this.workflows.find(seq => seq.id === id)
      if (found) {
        return found
      }

      return null
    }
  }
}
