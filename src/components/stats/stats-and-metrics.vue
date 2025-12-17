<template>
  <Draggable
    class="list-group"
    v-model="metricGroupList"
    v-bind="dragOptions"
    :options="{handle:'.movable'}"
    :move="checkMove"
    @change="updateSortedGroup"
    tag="ul">
    <transition-group type="transition" name="flip-list">
      <template
        v-for="(metricGroupResources, key) in reversedMetricGroups">
        <MetricGroup :key="key"
                     :resources="metricGroupResources"
                     :editMetricGroupId="editGroupId"
                     @updated="metricGroupUpdated"/>
      </template>
    </transition-group>
  </Draggable>
</template>

<script>
import _ from 'lodash'
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
    },
    editGroupId: {
      default: null,
      required: false
    }
  },
  data () {
    return {
      metricGroupList: []
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
    },
    reversedMetricGroups () {
      if (_.isEmpty(this.metricGroups)) {
        return []
      }

      return JSON.parse(JSON.stringify(this.metricGroups)).sort((a, b) => (b.order > a.order) ? 1 : -1)
    }
  },
  mounted () {
    this.metricGroupList = JSON.parse(JSON.stringify(this.reversedMetricGroups))
  },
  methods: {
    ...mapActions('stats', [
      'updateMetricGroupOrder'
    ]),
    async updateSortedGroup (val) {
      if (typeof val.moved === 'undefined') {
        return
      }

      const { newIndex, oldIndex, element } = val.moved
      const group = this.metricGroupList.find(group => group.id === element.id)

      if (!group) {
        return
      }

      const previousMetricGroups = JSON.parse(JSON.stringify(this.reversedMetricGroups))

      const order = previousMetricGroups[newIndex].order
      const step = { data: 0 }

      if (newIndex > oldIndex) {
        step.data = (newIndex + oldIndex)
      } else {
        step.data = (oldIndex + newIndex)
      }

      await this.updateMetricGroupOrder({
        metricGroupId: element.id,
        order: order,
        step: oldIndex > newIndex ? step.data : (-1 * step.data)
      })

      await this.$axios.patch(`api/v2/agents/${this.profile.id}/statistics/metric-groups/${element.id}/order`, {
        order: order
      }).then(res => {
        this.$generalNotification('Metric group successfully updated.')
      }).catch(err => {
        this.setMetricGroups(previousMetricGroups)
        console.log(err)
        this.$generalNotification('Failed to update metric group.', 'error')
      })
    },
    metricGroupUpdated () {
      this.$emit('updated')
    },
    checkMove (event) {
      return event.from === event.to
    }
  },
  watch: {
    reversedMetricGroups: {
      deep: true,
      handler: function () {
        this.metricGroupList = JSON.parse(JSON.stringify(this.reversedMetricGroups))
      }
    }
  }
}
</script>
