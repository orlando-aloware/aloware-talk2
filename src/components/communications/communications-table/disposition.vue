<template>
  <div>
    <router-link target="_blank"
                 class="text-decoration-none"
                 :to="{ path: `/contacts/${row.contact_id}/communications/${row.id}` }"
                 v-if="row.id && row.contact_id">
      <div class="status-icon centered-content"
           v-html="stateToIcon(row.disposition_status2, row.direction, row.type, row.callback_status)" />

      <q-tooltip>
        Click to see the communication details
      </q-tooltip>
    </router-link>

    <div class="status-icon centered-content"
         v-else
         v-html="stateToIcon(row.disposition_status2, row.direction, row.type, row.callback_status)" />
  </div>
</template>

<script>
import { communicationsMixin } from 'src/plugins/mixins'

export default {
  name: 'Disposition',

  mixins: [
    communicationsMixin
  ],

  props: {
    row: {
      type: Object,
      required: true
    }
  }
}
</script>
