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
        v-for="(metricGroupResources, key) in metricGroups">
        <MetricGroup :key="key"
                     :resources="metricGroupResources"
                     :editMetricGroupId="editGroupId"
                     @updated="metricGroupUpdated"/>
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
    }
  },
  mounted () {
    this.metricGroupList = JSON.parse(JSON.stringify(this.metricGroups))
  },
  methods: {
    ...mapActions('stats', [
      'updateMetricGroupOrder'
    ]),
    async updateSortedGroup (val) {
      if (typeof val.moved === 'undefined') {
        return
      }

      let { newIndex, oldIndex, element } = val.moved
      const group = this.metricGroupList.find(group => group.id === element.id)

      if (!group) {
        return
      }

      const previousMetricGroups = JSON.parse(JSON.stringify(this.metricGroups))

      let order = this.metricGroupList[newIndex].order
      let step = 0

      if (newIndex > oldIndex) {
        step = (newIndex - oldIndex)
        order += step
      } else {
        step = (oldIndex - newIndex)
        order -= step
      }

      await this.updateMetricGroupOrder({
        metricGroupId: element.id,
        order: order,
        step: oldIndex > newIndex ? (-1 * step) : step
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
    metricGroups: {
      deep: true,
      handler: function () {
        this.metricGroupList = JSON.parse(JSON.stringify(this.metricGroups))
      }
    }
  }
}
</script>
