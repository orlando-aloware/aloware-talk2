<template>
  <transition mode="out-in"
              :name="isIncreasing ? 'slide-vertical' : 'slide-vertical-reverse'">
    <b-badge pill
             class="unread-badge"
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
    },
    viewMode: {
      type: Number,
      required: true
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
  top: -8px;
  right: -5px;
  font-size: 9px;
  font-weight: 500;
  height: 20px;
  width: 20px;
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
