<template>
  <div class="q-pa-md q-gutter-sm p-0">
    <div class="py-5 mb-5">
      <q-btn
        @click="newReportGroup"
        unelevated
        no-caps
        :disabled="disabled"
        class="px-4 py-1"
        color="primary">
        <div class="row items-center no-wrap">
          <div class="text-center">
            + Add Report Group
          </div>
        </div>
      </q-btn>
    </div>
  </div>
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
