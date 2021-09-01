<template>
  <div
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
    class="pt-4">
    <div class="row no-wrap q-pt-none text-subtitle1 text-bold text-capitalize">
      {{ reportGroupName }}
      <q-icon
        name="fa fa-pencil-alt"
        class="text-blue p-2"
        style="font-size: 12px;" />
      <q-select
        v-model="timeline"
        outlined
        rounded
        dense
        :options="dateRange"
        options-dense
        class="mini-select">
      </q-select>
    </div>
    <div v-if="resources" class="p-0" style="position:relative;">
      <b-badge
        v-if="hovered"
        @click="confirmDeletion"
        class="bg-white p-0 m-0 contact-unread-badge d-flex justify-center floating"
        style="z-index:10; border:1px grey solid;right:-5px;top:-5px;position:absolute;"
        pill>
        <q-icon
          name="fa fa-times"
          class="text-grey"
          style="font-size: 14px;padding:1px;" />
      </b-badge>
      <div class="mycard no-border bg-white p-2 row">
        <AddMetrics :title="reportGroupName" />
        <MetricsBox
          v-for="(metric, key) in resources.metrics"
          :key="key"
          :metric="metric" />
      </div>
    </div>
    <ConfirmDialog
      @close="closeModal"
      title="Delete Report Group"
      :id="dialogName"
      :is-open="isOpen">
      <div slot="content">
        <div class="text-left">
          <div class="text-dark">
          <div v-html="`Are you sure you wanted to remove the selected Report Group:<br/><strong>${resources.name}</strong>?`"></div>
          </div>
        </div>
      </div>
      <div slot="footer" class="w-100">
        <div class="d-flex w-100">
          <div class="flex-grow-1"></div>
          <button
            class="btn btn-sm btn-outline-success mr-2 px-4"
            @click="closeModal">
            No
          </button>
          <button
            class="btn btn-sm btn-danger mr-2"
            @click="removeSelectedReportGroup">
            Yes, Remove it!
          </button>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>

// import EditIcon from 'components/icons/edit-icon'
import AddMetrics from './metrics/add-metrics-trigger'
import MetricsBox from './metrics/metrics-box'
import ConfirmDialog from 'components/confirm-dialog'
import {
  DATE_RANGES
} from 'src/constants/dates'

const dateRanges = { DATE_RANGES }

export default {
  name: 'StatsMetricsGroup',
  props: {
    resources: {
      type: Object,
      default: () => {
        return {
          id: null,
          metrics: [],
          name: '',
          timeline: ''
        }
      }
    }
  },
  components: {
    // EditIcon,
    AddMetrics,
    MetricsBox,
    ConfirmDialog
  },
  computed: {
    reportGroupName () {
      let { name } = this.resources
      if (name) {
        return name
      }
      return 'No Label'
    },
    metrics () {
      return this.resources.metrics
    },
    dateRange () {
      if (dateRanges) {
        return dateRanges.DATE_RANGES
      }
      return []
    },
    dialogName () {
      return `remove-group-dialog-${this.resources.id}`
    }
  },
  mounted () {
    this.timeline = this.resources.timeline || 'Today'
  },
  data () {
    return {
      timeline: '',
      hovered: false,
      isOpen: false
    }
  },
  watch: {
    isOpen (val) {
      if (val) {
        this.$bvModal.show(this.dialogName)
      } else {
        this.$bvModal.hide(this.dialogName)
      }
    }
  },
  methods: {
    confirmDeletion () {
      this.isOpen = true
    },
    closeModal () {
      this.isOpen = false
    },
    async removeSelectedReportGroup () {
      console.log('Removing ', this.resources.id)
      // await this.deleteMetrics(this.resources.id)
      this.closeModal()
    }
  }
}
</script>
