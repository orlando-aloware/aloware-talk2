<template>
  <span class="cursor-pointer operation-button"
        data-testid="comm-details-button"
        @click="seeDetails">
    <information-circle-icon height="16"
                             width="16"
                             color="#62666E"/>

    <q-tooltip>
      More Details
    </q-tooltip>
  </span>
</template>

<script>
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'
import { aclMixin } from 'src/plugins/mixins'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'details-communication-button',

  mixins: [
    aclMixin
  ],

  components: {
    InformationCircleIcon
  },

  props: {
    communication: {
      type: Object,
      required: true
    },

    customClass: {
      type: String,
      default: ''
    }
  },

  data: () => ({
    CommunicationTypes
  }),

  methods: {
    seeDetails () {
      window.open(`/contacts/${this.communication.contact_id}/communications/${this.communication.id}`, '_blank')
    }
  }
}
</script>
