<template>
  <div>
    <div class="text-subtitle1 text-bold text-capitalize pb-2">
      {{ sectionTitle }}
      <q-icon
        name="fa fa-pencil-alt"
        class="text-blue"
        style="font-size: 12px;" />
    </div>
    <div class="mycard no-border bg-white p-2 mb-3 row">
      <AddMetrics :title="sectionTitle" />
      <MetricsBox
        v-for="n in Math.ceil(Math.random()*12)"
        :key="n"
        :metric="{name: n}" />
    </div>
  </div>
</template>

<script>

// import EditIcon from 'components/icons/edit-icon'
import AddMetrics from './metrics/add-metrics-trigger'
import MetricsBox from './metrics/metrics-box'

export default {
  name: 'StatsMetricsGroup',
  props: {
    sectionTitle: {
      type: String,
      default: 'Section Title Here'
    }
  },
  components: {
    // EditIcon,
    AddMetrics,
    MetricsBox
  },
  data () {
    return {}
  }
}
</script>
