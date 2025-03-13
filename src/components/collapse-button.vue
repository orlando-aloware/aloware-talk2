<template>
  <span class="collapse-button"
        :id="`btn-collapse-${_uid}`"
        @click="toggle">
        <chevron-right-icon class="collapse-button__icon"
                            color="#256eff"
                            :width="18"
                            :height="18"
                            :style="{ transform: value ? 'rotate(-180deg)' : null }"/>
    <b-tooltip custom-class="talk-table__tooltip"
               ref="tooltip"
               :target="`btn-collapse-${_uid}`">
      {{ value ? 'Expand' : 'Collapse' }}
    </b-tooltip>
  </span>
</template>

<script>
import ChevronRightIcon from 'src/components/icons/chevron-right-icon.vue'

export default {
  name: 'collapse-button',

  components: {
    ChevronRightIcon
  },

  props: {
    value: {
      type: Boolean,
      required: true
    },

    target: {
      type: HTMLElement,
      required: true
    }
  },

  mounted () {
    this.prepareTarget()
  },

  methods: {
    toggle () {
      if (this.value) {
        this.target.classList.remove('no-max-width')
      } else {
        this.target.classList.add('no-max-width')
      }

      this.$emit('input', !this.value)
      this.$refs.tooltip.$emit('close')
    },

    prepareTarget () {
      // force a transition to have animation
      if (!this.target.style.transition) {
        this.target.style.transition = 'all .5s ease-in-out'
      }
    }
  }
}
</script>

<style lang="scss">
.collapse-button {
  cursor: pointer;
  display: flex;
  align-items: center;

  &__icon {
    transition: transform .5s ease-in-out;
  }
}

.no-max-width {
  max-width: 0px !important;
}
</style>
