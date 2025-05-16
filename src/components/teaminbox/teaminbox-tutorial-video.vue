<template>
  <video-modal
    ref="teamInboxTutorialComponent"
    :should-show-default-activator="false"
    :should-show-in-first-visit="true"
    class="pl-2"
    cookie-name="team-inbox"
    title="Explore Aloware Team Inboxes"
    video-url="https://www.loom.com/embed/652f7476d7414d329e855da6ae3e387d?sid=64064e95-2401-4dc7-85bd-82cc84123916"
  />
</template>
<script>
import VideoModal from 'components/video-modal.vue'
import { mapActions } from 'vuex'

export default {
  name: 'teaminbox-tutorial-video',
  components: { VideoModal },
  methods: {
    ...mapActions('TeamInbox', [
      'setTeamInboxTutorialComponent'
    ])
  },
  mounted () {
    console.log(this.$store.state.TeamInbox)
    this.setTeamInboxTutorialComponent(this.$refs.teamInboxTutorialComponent)
    console.log(this.$store.state.TeamInbox)
  }
}
</script>
