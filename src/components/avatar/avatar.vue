<template>
  <div class="avatar"
       :class="{'avatar--src': src, 'avatar--active': active }"
       :style="{width: `${width}px`, height: `${height}px`}"
  >
    <div class="avatar__inner" :class="{'avatar__inner--active': active }"
         :style="{'background-image': `url(${src})` }">
      <slot/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'avatar.vue',
  props: {
    active: {
      type: Boolean,
      default: false
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
  border: solid 1px $grey-light;
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
