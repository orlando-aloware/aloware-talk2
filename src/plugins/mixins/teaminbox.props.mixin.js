import { ALL_INBOXES_ID } from 'src/store/teaminbox/teaminbox.store'

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
    },

    isAllInboxesRoute () {
      return this.$route.params.inboxId === ALL_INBOXES_ID
    }
  }
}
