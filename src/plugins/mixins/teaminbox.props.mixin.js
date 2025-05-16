export default {
  props: {
    teamInboxId: {
      type: Number,
      default: null
    },
    fromTeamInbox: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    teamInbox () {
      return this.teamInboxId !== null || this.fromTeamInbox
    }
  }
}
