<template>
  <span class="cursor-pointer"
        data-testid="comm-details-button"
        :id="`action-details-${_uid}`"
        @click="seeDetails">
    <information-circle-icon height="16"
                             width="16"
                             color="#62666E"/>
    <span class="ml-1"
          v-if="showButtonText">
      More Details
    </span>
    <b-tooltip custom-class="talk-table__tooltip"
               :target="`action-details-${_uid}`"
               v-else>
      More Details
    </b-tooltip>
  </span>
</template>

<script>
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'
import { Platform } from 'quasar'

export default {
  name: 'details-communication-button',

  components: {
    InformationCircleIcon
  },

  props: {
    communication: {
      type: Object,
      required: true
    },

    eventOnly: {
      type: Boolean,
      default: false
    },

    blackTooltip: {
      type: Boolean,
      default: false
    },

    showButtonText: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    seeDetails () {
      if (this.eventOnly) {
        this.$emit('on-details', this.communication)
        return
      }

      const route = `/contacts/${this.communication.contact_id}/communications/${this.communication.id}`
      if (Platform.is.electron) {
        this.$router.push(route)
      } else {
        window.open(route, '_blank')
      }
    }
  }
}
</script>
