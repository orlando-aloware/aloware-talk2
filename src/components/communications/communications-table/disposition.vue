<template>
  <div>
    <span class="cursor-pointer"
          :id="`comm-disposition-${_uid}`"
          v-if="row.id && row.contact_id"
          @click="$emit('on-details', row)">
      <component :class="['disposition-icon', `disposition-icon--${icon}`]"
                 :is="icon"
                 v-if="row.disposition_status2" />

      <b-tooltip custom-class="communication-logs-table__tooltip"
                 :target="`comm-disposition-${_uid}`">
        {{ dispositionTooltipData(row.disposition_status2, row.type, row.direction, row.callback_status) }}
      </b-tooltip>
    </span>

    <component :class="['disposition-icon', `disposition-icon--${icon}`]"
               :is="icon"
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
  },

  computed: {
    icon () {
      return this.stateToIcon(this.row.disposition_status2, this.row.type, this.row.direction, this.row.callback_status)
    }
  }
}
</script>
