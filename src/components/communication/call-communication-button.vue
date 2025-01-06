<template>
  <span class="cursor-pointer operation-button"
        data-testid="comm-call-back-button"
        v-if="communication.contact && communication.type !== CommunicationTypes.EMAIL"
        @click="callContact">
    <call-o-icon height="16"
               width="16" />

    <q-tooltip>
      Call Back
    </q-tooltip>
  </span>
</template>

<script>
import CallOIcon from 'components/icons/call-o-icon.vue'
import { aclMixin, timezoneCheckMixin } from 'src/plugins/mixins'
import * as CommunicationTypes from 'src/constants/communication-types'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'call-back-communication-button',

  mixins: [
    aclMixin,
    timezoneCheckMixin
  ],

  components: {
    CallOIcon
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

  computed: {
    ...mapState(['isMobile'])
  },

  methods: {
    ...mapActions(['setShowPhone']),

    initiateCall () {
      const data = {
        currentNumber: this.communication.contact.phone_number,
        contactName: this.communication.contact.name,
        companyName: this.communication.contact.company_name,
        contactId: this.communication.contact_id,
        contactTimezone: this.communication.contact.timezone
      }

      if (this.isMobile) {
        this.setShowPhone(true)

        setTimeout(() => {
          this.$VueEvent.fire('changePhoneNumber', data)
        }, 100)

        return
      }

      this.$VueEvent.fire('callContact', data)
    },

    callContact () {
      let contact = {
        timezone: this.communication.contact.timezone,
        name: this.communication.contact.name
      }

      this.checkContactTimezone(contact, this.initiateCall)
    }
  }
}
</script>
