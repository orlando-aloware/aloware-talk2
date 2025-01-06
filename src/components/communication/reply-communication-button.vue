<template>
  <span class="cursor-pointer"
        data-testid="comm-reply-button"
        v-if="communication.type === CommunicationTypes.SMS && hasPermissionTo('send sms')"
        @click="goToContactPage">
    <reply-icon height="16"
                width="16"
                icon-color="grey"/>

    <q-tooltip>
      Reply
    </q-tooltip>
  </span>
</template>

<script>
import ReplyIcon from 'components/icons/reply-icon.vue'
import { aclMixin } from 'src/plugins/mixins'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'reply-communication-button',

  mixins: [
    aclMixin
  ],

  components: {
    ReplyIcon
  },

  props: {
    communication: {
      type: Object,
      required: true
    }
  },

  data: () => ({
    CommunicationTypes
  }),

  methods: {
    goToContactPage () {
      window.open(`/contacts/${this.communication.contact_id}`, '_blank')
    }
  }
}
</script>
