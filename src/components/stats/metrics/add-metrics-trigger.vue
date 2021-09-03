<template>
  <div class="p-2 position-relative">
    <q-card v-ripple flat bordered
      @click="openModal"
      class="metric-box dashed-box full-height q-hoverable">
      <span class="q-focus-helper"></span>
      <q-card-section class="full-height align-middle">
        <div class="row items-center justify-center full-height text-lead text-center text-grey lighten-3 align-middle">
          <div class="metric-box-desc metric-box-header pb-1">
            <span>+</span>
            <br />
            Add Metrics
          </div>
        </div>
        <!-- <div class="text-subtitle2 pt-3"># of kemerut</div> -->
      </q-card-section>
    </q-card>
    <AddMetricsModal
      @closed="closeModal"
      @create="createNewMetric"
      :title="groupTitle"
      :is-open="modal" />
  </div>
</template>

<script>

import { mapActions } from 'vuex'
import AddMetricsModal from './add-metrics-modal'

export default {
  name: 'AddMetrics',
  props: {
    reportGroup: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    AddMetricsModal
  },
  computed: {
    groupTitle () {
      return this.reportGroup.name
    },
    groupId () {
      return this.reportGroup.id
    }
  },
  data () {
    return {
      modal: false
    }
  },
  methods: {
    ...mapActions('stats', [
      'createMetrics'
    ]),
    async createNewMetric (data) {
      this.modal = false
      await this.createMetrics({
        reportId: this.groupId,
        name: data.name,
        color: data.color,
        value: Math.floor(Math.random() * (199 - 1 + 1)) + 1
      })
    },
    openModal () {
      this.modal = true
    },
    closeModal () {
      this.modal = false
    }
  }
}
</script>
