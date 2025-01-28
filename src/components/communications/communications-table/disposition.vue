<template>
  <div>
    <span class="cursor-pointer"
          v-if="row.id && row.contact_id"
          @click="$emit('on-details', row)">
      <component class="disposition-icon"
                 :is="stateToIcon(row.disposition_status2, row.type, row.direction, row.callback_status)"
                 v-if="row.disposition_status2" />

      <q-tooltip>
        {{ dispositionTooltipData(row.disposition_status2, row.type, row.direction, row.callback_status) }}
      </q-tooltip>
    </span>

    <component class="disposition-icon"
               :is="stateToIcon(row.disposition_status2, row.type, row.direction, row.callback_status)"
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
