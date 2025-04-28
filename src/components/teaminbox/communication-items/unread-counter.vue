<template>
  <transition mode="out-in"
              :name="isIncreasing ? 'slide-vertical' : 'slide-vertical-reverse'">
    <b-badge pill
             class="unread-badge"
             variant="danger"
             :key="totalUnreads"
             v-if="viewMode === THREADED && totalUnreads > 0">
      <span>
        <template v-if="totalUnreads <= 99">{{ totalUnreads }}</template>
        <template v-else>99<sup>+</sup></template>
      </span>
    </b-badge>
    <b-badge pill
             class="unread-badge unthreaded"
             variant="danger"
             :key="totalUnreads"
             v-if="viewMode !== THREADED && !unreadProperties?.communication_is_read" />
  </transition>
</template>

<script>
import { THREADED } from 'src/store/teaminbox/teaminbox.store'
import { mapState } from 'vuex'

export default {
  props: {
    unreadProperties: {
      type: Object,
      required: false
    }
  },

  data: () => ({
    THREADED,
    isIncreasing: true
  }),

  computed: {
    ...mapState('TeamInbox', [
      'viewMode'
    ]),

    totalUnreads () {
      console.log('>>> unreadProperties', this.unreadProperties)

      const unreadVoiceMail = this.unreadProperties?.unread_voicemail_count || 0
      const unreadMissedCall = this.unreadProperties?.unread_missed_call_count || 0
      const unreadCount = this.unreadProperties?.unread_count || 0

      return unreadVoiceMail + unreadMissedCall + unreadCount
    }
  },

  watch: {
    totalUnreads (newCount, oldCount) {
      this.isIncreasing = this.viewMode === THREADED && newCount > oldCount
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
  overflow: hidden;
  transition: all 0.3s ease-out;

  &.unthreaded {
    height: 8px;
    width: 8px;
    padding: 0;
    top: 0px;
    right: 0px;
  }
}

.slide-vertical-enter {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-vertical-leave-active {
  transform: translateY(100%);
  opacity: 0;
}

.slide-vertical-reverse-enter {
  transform: translateY(100%);
  opacity: 0;
}

.slide-vertical-reverse-leave-active {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
