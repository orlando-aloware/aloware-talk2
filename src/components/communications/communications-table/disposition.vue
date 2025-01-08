<template>
  <div>
    <router-link target="_blank"
                 class="text-decoration-none"
                 :to="{ path: `/contacts/${row.contact_id}/communications/${row.id}` }"
                 v-if="row.id && row.contact_id">
      <component :is="stateToIcon(row.disposition_status2, row.type, row.direction, row.callback_status)"
                 v-if="row.disposition_status2" />

      <q-tooltip>
        {{ dispositionTooltipData(row.disposition_status2, row.type, row.direction, row.callback_status) }}
      </q-tooltip>
    </router-link>

    <component :is="stateToIcon(row.disposition_status2, row.type, row.direction, row.callback_status)"
               v-else />
  </div>
</template>

<script>
import { communicationInfoMixin } from 'src/plugins/mixins'

export default {
  name: 'Disposition',

  mixins: [
    communicationInfoMixin
  ],

  props: {
    row: {
      type: Object,
      required: true
    }
  }
}
</script>
