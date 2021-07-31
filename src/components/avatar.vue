<template>
  <div
    class="avatar"
    :class="{ 'avatar--src': src, 'avatar--active': active }"
    :style="computedStyle"
  >
    <div
      class="avatar__inner"
      :class="{ 'avatar__inner--active': active }"
      :style="{ 'background-image': `url(${src})` }"
    >
      <sequence-icon v-if="sequenceIcon" />
      <span v-else>
        {{ getInitials(name || 'No Name') }}
      </span>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import { avatarMixin } from 'src/plugins/mixins'
import SequenceIcon from 'components/icons/contact-activity/sequence-icon'
export default {
  name: 'avatar',
  components: { SequenceIcon },
  mixins: [avatarMixin],
  computed: {
    computedStyle () {
      return { width: `${this.width}px`, height: `${this.height}px`, ...this.avatarStyle() }
    }
  },
  props: {
    active: {
      type: Boolean,
      default: false
    },
    name: {
      type: String
    },
    src: {
      type: String
    },
    width: {
      type: [String, Number],
      default: 30
    },
    height: {
      type: [String, Number],
      default: 30
    },
    sequenceIcon: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../css/mixins';
@import '../css/variables';

.avatar {
  border-radius: 50%;
  background-color: $grey-light;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $white;
  font-weight: bold;
  line-height: 0;
  letter-spacing: 0.35px;

  &--src {
    color: transparent;
  }

  &--active {
    border: solid 1px $green;
    background-color: white;
  }

  &__inner {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &--active {
      background-color: $dark;
      border: solid 2px $white;
    }
  }
}
</style>
