<template>
  <video-modal
    :should-show-default-activator="false"
    :should-show-in-first-visit="true"
    class="pl-2"
    cookie-name="team-inbox"
    title="Explore Aloware Team Inboxes"
    video-url="https://www.loom.com/embed/e7e94a839e544e058100e36cacbb0eb7?sid=1c7e9418-80a8-4582-a35f-5eb27995f9e9"
  />
</template>
<script>
import VideoModal from 'components/video-modal.vue'

export default {
  name: 'teaminbox-tutorial-video',
  components: { VideoModal }
}
</script>
