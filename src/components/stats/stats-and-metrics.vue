<template>
  <Draggable
    @change="updateSortedGroup"
    v-model="report_group"
    v-bind="dragOptions"
    class="list-group"
    :options="{handle:'.movable'}"
    tag="ul">
    <transition-group type="transition" name="flip-list">
      <template
        v-for="(report_group_resources, key) in reportGroupList">
        <ReportGroup :key="key" :resources="report_group_resources" />
      </template>
    </transition-group>
  </Draggable>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import Draggable from 'vuedraggable'
import ReportGroup from './report-group/report-group'

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
  computed: {
    ...mapFields('stats', [
      'report_group'
    ]),
    ...mapGetters('stats', [
      'consolidatedReportGroup'
    ]),
    reportGroupList () {
      return this.consolidatedReportGroup
    },
    dragOptions () {
      return {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      }
    }
  },
  components: {
    Draggable,
    ReportGroup
  },
  async mounted () {
    await this.getReportGroups()
  },
  methods: {
    ...mapActions('stats', [
      'getReportGroups',
      'updateMetricGroupOrder'
    ]),
    async updateSortedGroup (val) {
      let { newIndex, oldIndex, element } = val.moved
      let step = null
      let direction = oldIndex > newIndex ? 'up' : 'down'
      let id = element.id
      if (oldIndex > newIndex) {
        step = oldIndex - newIndex
      } else {
        step = newIndex - oldIndex
      }
      await this.updateMetricGroupOrder({
        id: id,
        direction: direction,
        step: step
      })
    }
  }
}
</script>
