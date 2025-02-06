<template>
  <span class="cursor-pointer"
        data-testid="comm-details-button"
        :id="`action-details-${_uid}`"
        v-if="communication.contact_id"
        @click="seeDetails">
    <information-circle-icon height="16"
                             width="16"
                             color="#62666E"/>

    <b-tooltip custom-class="talk-table__tooltip"
               :target="`action-details-${_uid}`"
               v-if="blackTooltip">
      More Details
    </b-tooltip>
    <q-tooltip v-else>
      More Details
    </q-tooltip>
  </span>
</template>

<script>
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'

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
    }
  },

  methods: {
    seeDetails () {
      if (this.eventOnly) {
        this.$emit('on-details', this.communication)
        return
      }

      window.open(`/contacts/${this.communication.contact_id}/communications/${this.communication.id}`, '_blank')
    }
  }
}
</script>
