<template>
  <q-select
    class="generic-selector"
    ref="warmupPeriod"
    :options="warmUpPeriods"
    :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
    v-model="localValue"
    outlined dense
    @popup-show="onShowWarmUpMenu">
  </q-select>
</template>

<script>

import { WARM_UP_PERIOD_LIST } from 'src/constants/power-dialer/power-dialer-list'

export default {
  name: 'WarmupPeriodSelector',
  model: {
    prop: 'modelValue',
    event: 'change'
  },
  props: {
    modelValue: String,
    options: {
      type: Array,
      default: () => []
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    localValue: {
      get () {
        return this.modelValue
      },
      set (val) {
        this.$emit('change', val)
      }
    },
    warmUpPeriods () {
      let values = []
      values = [WARM_UP_PERIOD_LIST]
      for (let i = 1; i <= 10; i++) {
        values.push(`${i * 5} seconds`)
      }
      return values
    }
  },
  data () {
    return {
      selectWidth: ''
    }
  },
  methods: {
    onShowWarmUpMenu () {
      this.selectWidth = this.$refs.warmupPeriod.$el.offsetWidth
    }
  }
}
</script>
