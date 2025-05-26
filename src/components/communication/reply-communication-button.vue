<template>
  <span class="cursor-pointer"
        data-testid="comm-reply-button"
        :id="`action-reply-${_uid}`"
        @click="goToContactPage">
    <reply-icon height="16"
                width="16"
                color="#62666E"/>
    <span class="ml-1"
          v-if="showButtonText">
      Reply
    </span>
    <b-tooltip custom-class="talk-table__tooltip"
               :target="`action-reply-${_uid}`"
               v-else>
      Reply
    </b-tooltip>
  </span>
</template>

<script>
import ReplyIcon from 'components/icons/reply-icon.vue'
import { aclMixin } from 'src/plugins/mixins'
import * as CommunicationTypes from 'src/constants/communication-types'
import { Platform } from 'quasar'

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
    },

    showButtonText: {
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    CommunicationTypes
  }),

  methods: {
    goToContactPage () {
      const route = `/contacts/${this.communication.contact_id}`
      if (Platform.is.electron) {
        this.$router.push(route)
      } else {
        window.open(route, '_blank')
      }
    }
  }
}
</script>
