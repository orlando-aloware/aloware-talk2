<template>
  <span class="cursor-pointer"
        data-testid="comm-details-button"
        v-if="communication.contact_id"
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

export default {
  name: 'details-communication-button',

  components: {
    InformationCircleIcon
  },

  props: {
    communication: {
      type: Object,
      required: true
    }
  },

  methods: {
    seeDetails () {
      window.open(`/contacts/${this.communication.contact_id}/communications/${this.communication.id}`, '_blank')
    }
  }
}
</script>
