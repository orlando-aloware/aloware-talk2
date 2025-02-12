<template>
  <div class="d-flex align-items-center"
       data-testid="inbox-wrapper">
    <span class="text-truncate"
          data-testid="inbox-name"
          v-if="inbox">
      {{ inbox.name }}
    </span>
    <span data-testid="inbox-empty"
          v-else>
      -
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
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
