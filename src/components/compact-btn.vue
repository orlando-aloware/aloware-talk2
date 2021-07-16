<template>
  <button
    :class="computedClass"
    :disabled="disabled"
    @click.stop="onClickEvent"
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
        'border-0': this.borderless,
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
    },
    borderless: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClickEvent () {
      this.$emit('clicked')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../css/mixins';
@import '../css/variables';
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
.button-disabled {
  background-color: #E0E0E0 !important;
  border-color: #E0E0E0 !important;
  color: #828282;
}
</style>
