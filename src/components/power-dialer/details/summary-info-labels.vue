<template>
  <div class="summary-info-labels d-flex px-3">
    <div
      v-for="(info, key) in infos"
      :key="key"
      class="summary-info-labels__div d-flex px-4">
      {{ info.label}} <strong class="pl-2">{{ info.value }}</strong>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SummaryInfoLabels',
  data () {
    return {
      infos: [
        {
          label: 'Tried',
          value: '52'
        },
        {
          label: 'Total',
          value: '124'
        },
        {
          label: 'Connected',
          value: '3 (9%)'
        },
        {
          label: 'Closed',
          value: '1 (4%)'
        }
      ]
    }
  }
}
</script>
