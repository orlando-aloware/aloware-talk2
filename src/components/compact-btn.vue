<template>
  <button
    :class="computedClass"
    :disabled="disabled"
    data-testid="compact-button"
    @click.stop="onClickEvent"
  >
    <slot />
    <q-tooltip v-if="tooltipText"
               content-class="bg-grey-light11"
               anchor="top middle"
               self="center middle"
               data-testid="compact-button-tooltip"
               :offset="[20, 20]">
      {{ tooltipText }}
    </q-tooltip>
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
    },
    tooltipText: {
      required: false,
      type: String,
      default: ''
    }
  },
  methods: {
    onClickEvent () {
      this.$emit('clicked')
    }
  }
}
</script>
