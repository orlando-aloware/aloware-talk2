<template>
  <video-modal
    ref="teamInboxEmptyStateVideo"
    :should-show-default-activator="false"
    :should-show-in-first-visit="true"
    cookie-name="team-inbox-empty-state"
    notes="To get started with Team Inboxes, you need to contact your admin to:<br/>• Add a phone line to your user = Personal Inbox<br/>• Add you to a ring group = Connected Inbox"
    title="Welcome to Team Inboxes!"
    video-url="https://www.loom.com/embed/3c39588b358e4006990437c84f512ae5?sid=1e326000-6399-41af-ba96-37ac2748bbe7"
  />
</template>

<script>
import VideoModal from 'components/video-modal.vue'
import { mapActions } from 'vuex'

export default {
  name: 'teaminbox-empty-state-video',

  components: {
    VideoModal
  },

  methods: {
    ...mapActions('TeamInbox', [
      'setTeamInboxEmptyStateVideoComponent'
    ])
  },

  mounted () {
    this.setTeamInboxEmptyStateVideoComponent(this.$refs.teamInboxEmptyStateVideo)
  }
}
</script>

<style lang="scss" scoped>
::v-deep .video-modal {
  .modal-notes {
    padding-bottom: 0 !important;

    p {
      color: #2c3e50 !important;
      font-size: 16px !important;
      line-height: 1.6 !important;
      font-weight: 400 !important;
      margin-bottom: 0 !important;
    }
  }
}
</style>
