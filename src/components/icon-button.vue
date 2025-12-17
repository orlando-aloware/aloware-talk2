<template>
  <component
    v-bind:is="el"
    class="button"
    :class="{
      'button--outline': outline,
      'button--no-icon': noIcon,
      'button--primary': variant === 'primary',
      'button--secondary': variant === 'secondary',
      'button--danger': variant === 'danger',
      'button--warning': variant === 'warning',
      'button--info': variant === 'info',
      'button--no-background': variant === 'plain'
    }"
  >
    <div class="button__icon" v-if="!noIcon">
      <slot name="icon" />
    </div>
    <span class="button__text" :class="{ 'button__text--outline': outline }">
      <slot name="text" />
    </span>
  </component>
</template>

<script>
export default {
  name: 'icon-button.vue',
  props: {
    el: {
      type: String,
      default: 'button',
      validator: (val) => ['button', 'a'].includes(val)
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (val) => ['primary', 'danger', 'info', 'warning', 'plain'].includes(val)
    },
    outline: {
      type: Boolean,
      default: false
    },
    noIcon: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../css/mixins';
@import '../css/variables';

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  @include border-radius(20px);
  text-decoration: none;
  padding-left: 9px;
  padding-right: 13px;
  border: solid 1px;
  transition: background-color 100ms ease-in;

  &:hover {
    box-shadow: 0 4px 10px 0 lighten($black, 90%);
  }

  &--no-icon {
    padding-left: 13px;
  }

  &--primary {
    border-color: $green;
    background-color: $green;
    &:hover {
      background-color: darken($green, 5%);
      border-color: darken($green, 5%);
    }
  }

  &--danger {
    border-color: $red;
    background-color: $red;
    &:hover {
      background-color: darken($red, 5%);
      border-color: darken($red, 5%);
    }
  }

  &--outline {
    background-color: transparent;
    &:hover {
      background-color: transparent;
    }
  }

  &__icon {
    padding-right: 5px;
    display: flex;
    align-items: center;
  }

  &__text {
    color: $white;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.3px;
    &--outline {
      color: $green;
    }
  }
}
</style>
