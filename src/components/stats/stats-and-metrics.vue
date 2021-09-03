<template>
  <div>
    <ReportGroup :resources="resources" />
  </div>
</template>

<script>

// import EditIcon from 'components/icons/edit-icon'
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
  components: {
    ReportGroup
  }
}
</script>
