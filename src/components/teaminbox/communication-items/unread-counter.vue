<template>
  <transition mode="out-in"
              :name="isIncreasing ? 'slide-vertical' : 'slide-vertical-reverse'">
    <b-badge pill
             class="unread-badge"
             :class="unreadClass"
             variant="danger"
             :key="totalUnreads"
             v-if="totalUnreads > 0">
      <span>
        <template v-if="viewMode === UNTHREADED && totalUnreads <= 1">&nbsp;</template>
        <template v-else-if="totalUnreads <= 99">{{ totalUnreads }}</template>
        <template v-else>99<sup>+</sup></template>
      </span>
    </b-badge>
  </transition>
</template>

<script>
import { THREADED, UNTHREADED } from 'src/store/teaminbox/teaminbox.store'
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
    UNTHREADED,
    isIncreasing: true
  }),

  computed: {
    ...mapState('TeamInbox', [
      'viewMode'
    ]),

    totalUnreads () {
      return this.unreadProperties?.unread_count || 0
    },

    unreadClass () {
      return this.viewMode === UNTHREADED && this.totalUnreads <= 1
        ? 'unread-badge--unthreaded'
        : ''
    }
  },

  watch: {
    totalUnreads (newCount, oldCount) {
      this.isIncreasing = newCount > oldCount
    }
  }
}
</script>

<style lang="scss" scoped>
.unread-badge {
  position: absolute;
  top: -10px;
  right: -7px;
  font-size: 9px;
  font-weight: 500;
  height: 21px;
  width: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s ease-out;

  &--unthreaded {
    height: 13px;
    width: 13px;
    padding: 0;
    top: -3px;
    right: -3px;
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
