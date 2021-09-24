<template>
  <Draggable
    class="list-group"
    :options="{handle:'.movable'}"
    v-model="metricGroups"
    v-bind="dragOptions"
    @change="updateSortedGroup"
    tag="ul">
    <transition-group type="transition" name="flip-list">
      <template
        v-for="(metricGroupResources, key) in metricGroups">
        <MetricGroup :key="key" :resources="metricGroupResources" />
      </template>
    </transition-group>
  </Draggable>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import Draggable from 'vuedraggable'
import MetricGroup from './metric-group/metric-group'

export default {
  name: 'StatsMetricsGroup',
  components: {
    Draggable,
    MetricGroup
  },
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
    ...mapState('stats', ['metricGroups']),
    ...mapState('auth', ['profile']),
    dragOptions () {
      return {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      }
    }
  },
  methods: {
    ...mapActions('stats', [
      'updateMetricGroup'
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
      await this.updateMetricGroup({
        id: id,
        direction: direction,
        step: step
      })
    }
  }
}
</script>
