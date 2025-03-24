<template>
  <b-badge pill
           class="unread-badge"
           variant="danger"
           v-if="viewMode === THREADED && totalUnreads > 0">
    <span v-if="totalUnreads <= 99">{{ totalUnreads }}</span>
    <span v-else>99<sup>+</sup></span>
  </b-badge>
</template>

<script>
import { THREADED } from 'src/store/einbox/einbox.store'
import { mapState } from 'vuex'

export default {
  props: {
    unreadProperties: {
      type: Object,
      required: false
    }
  },

  data: () => ({
    THREADED
  }),

  computed: {
    ...mapState('Einbox', [
      'viewMode'
    ]),

    totalUnreads () {
      const unreadVoiceMail = this.unreadProperties.unread_voicemail_count || 0
      const unreadMissedCall = this.unreadProperties.unread_missed_call_count || 0
      const unreadCount = this.unreadProperties.unread_count || 0

      return unreadVoiceMail + unreadMissedCall + unreadCount
    }
  }
}
</script>

<style lang="scss" scoped>
.unread-badge {
  position: absolute;
  top: -8px;
  right: -5px;
  font-size: 9px;
  font-weight: 500;
  height: 18px;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
