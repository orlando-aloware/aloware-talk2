<template>
  <button class="collapse-button btn btn-default btn-sm"
          :style="{ top: `${offset.top}px`, right: `${offset.right}px` }"
          :id="`btn-collapse-${_uid}`"
          @click="toggle">
    <chevron-right-icon class="collapse-button__icon"
                        color="#62666E"
                        :width="16"
                        :height="16"
                        :style="{ transform: value ? 'rotate(-180deg)' : null }"/>
    <b-tooltip custom-class="talk-table__tooltip"
               ref="tooltip"
               :target="`btn-collapse-${_uid}`">
      Collapse
    </b-tooltip>
  </button>
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
    },

    offset: {
      top: {
        type: [String, Number],
        required: false,
        default: 0
      },
      right: {
        type: [String, Number],
        required: false,
        default: 0
      }
    },

    minWidth: {
      type: [String, Number],
      required: false,
      default: 20
    }
  },

  mounted () {
    this.prepareTarget()
  },

  methods: {
    toggle () {
      const width = this.target.clientWidth - this.minWidth

      this.target.style.transform = this.value
        ? null
        : `translateX(-${width}px)`

      this.$emit('input', !this.value)
      this.$refs.tooltip.$emit('close')
    },

    prepareTarget () {
      // force a transition to have animation
      if (!this.target.style.transition) {
        this.target.style.transition = 'transform 1s ease-in-out'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.collapse-button {
  position: absolute;
  color: #EBEBEB;
  background-color: #FFF;
  border: solid 1px #EBEBEB;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;

  &__icon {
    transition: transform 1s ease-in-out;
  }
}
</style>
