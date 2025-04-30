export default {
  props: {
    teamInboxId: {
      type: Number,
      default: null
    }
  },

  computed: {
    teamInbox () {
      return this.teamInboxId !== null
    }
  }
}
