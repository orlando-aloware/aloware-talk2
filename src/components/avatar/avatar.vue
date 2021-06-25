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
      {{ getInitials(name || 'No Name') }}
    </div>
  </div>
</template>

<script>
import { avatarMixin } from 'src/plugins/mixins'
export default {
  name: 'avatar.vue',
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../css/mixins.scss';
@import '../../css/variables.scss';

.avatar {
  border-radius: 50%;
  background-color: $grey-light;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $white;
  font-size: 13px;
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
