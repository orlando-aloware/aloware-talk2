<template>
  <q-card-actions class="px-0 pt-3 pb-0">
    <q-space />
    <q-btn
      @click="newReportGroup"
      unelevated
      no-caps dense
      :disabled="disabled"
      class="px-4 py-1"
      color="primary">
      <div class="row items-center no-wrap">
        <div class="text-center">
          + Add Metric Group
        </div>
      </div>
    </q-btn>
  </q-card-actions>
</template>

<script>

import { mapActions } from 'vuex'

import {
  DATE_RANGES_DEFAULT_VALUE
} from 'src/constants/dates'

const dateRangesDefault = { DATE_RANGES_DEFAULT_VALUE }

export default {
  name: 'AddReportGroup',
  components: {},
  computed: {
    defaultDateRange () {
      return dateRangesDefault.DATE_RANGES_DEFAULT_VALUE
    }
  },
  data () {
    return {
      disabled: false
    }
  },
  methods: {
    ...mapActions('stats', [
      'createReportGroup'
    ]),
    async newReportGroup () {
      this.disabled = true
      await this.createReportGroup({
        name: 'Untitled',
        timeline: this.defaultDateRange
      })
      this.disabled = false
    }
  }
}
</script>
