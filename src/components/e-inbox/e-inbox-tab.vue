<template>
  <div class="d-flex flex-column w-100">
    <inbox-channel-toggle />
    <span>new inbox experience</span>
  </div>
</template>
<script>
import InboxChannelToggle from './inbox-channel-toggle.vue'

export default {
  name: 'EInboxTab',
  components: {
    InboxChannelToggle
  }
}
</script>
