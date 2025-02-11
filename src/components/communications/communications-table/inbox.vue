<template>
  <div class="d-flex align-items-center"
       data-testid="inbox-wrapper">
    <span v-if="inbox"
          class="text-truncate"
          data-testid="inbox-name">
      {{ inbox.name }}
    </span>
    <span v-else
          data-testid="inbox-empty">
      -
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Inbox',

  props: {
    inboxId: {
      type: [Number, String],
      required: false,
      default: null
    }
  },

  computed: {
    ...mapState({
      allInboxes: 'inboxes'
    }),

    inbox () {
      if (!this.inboxId || !this.allInboxes) {
        return null
      }

      return this.allInboxes.find(inbox => inbox.id === this.inboxId)
    }
  }
}
</script>
