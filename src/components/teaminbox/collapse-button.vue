<template>
  <span class="collapse-button"
        :id="`btn-collapse-${_uid}`"
        @click="toggle">
        <collapse-icon color="#256eff"
                       :width="18"
                       :height="18" />
    <b-tooltip custom-class="talk-table__tooltip"
               ref="tooltip"
               :target="`btn-collapse-${_uid}`">
      {{ collapsed ? 'Expand' : 'Collapse' }}
    </b-tooltip>
  </span>
</template>

<script>
import CollapseIcon from 'src/components/icons/collapse-icon.vue'
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'collapse-button',

  components: {
    CollapseIcon
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

  computed: {
    collapsed () {
      return this.value
    },

    ...mapFields('settings', [
      'isTeamInboxNavListCollapsed'
    ])
  },

  methods: {
    toggle () {
      this.isTeamInboxNavListCollapsed = !this.collapsed

      this.$emit('input', !this.collapsed)
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
}

.no-max-width-collapse-button {
  max-width: 0px !important;
  padding: 0px !important;
}
</style>
