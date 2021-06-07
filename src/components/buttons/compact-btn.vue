<template>
  <button
    :class="computedClass"
    :disabled="disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script>
export default {
  computed: {
    computedClass () {
      return {
        'btn': true,
        'btn-sm': true,
        'compact-button': true,
        'btn-primary': this.variant === 'primary',
        'btn-success': this.variant === 'success',
        'btn-secondary': this.variant === 'secondary',
        'btn-warning': this.variant === 'warning',
        'btn-danger': this.variant === 'danger',
        'btn-info': this.variant === 'info',
        'btn-outlined-light': this.variant === 'outlined-light',
        [this.customClass]: !!this.customClass
      }
    }
  },
  props: {
    variant: {
      type: String,
      validator: function (value) {
        return (
          [
            'success',
            'primary',
            'secondary',
            'warning',
            'danger',
            'info',
            'outlined-light'
          ].indexOf(value) !== -1
        )
      }
    },
    customClass: {
      type: String
    },
    onClick: {
      type: Function,
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.compact-button {
  height: 24px;
  padding: 0;
  line-height: 24px;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
}
.btn-outlined-light {
  border-color: $grey-light11;
  color: $black;
  &.with-border {
    background-color: #EFF6FE;
  }
}
</style>
