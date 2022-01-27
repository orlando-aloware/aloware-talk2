<template>
  <q-select
    class="padded-container generic-selector"
    options-selected-class="text-primary"
    ref="warmupPeriod"
    :options="warmUpPeriods"
    option-label="text"
    option-value="value"
    :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
    v-model="localValue"
    :emit-value="true"
    :display-value="`${localValue === '0' || localValue === 0 ? 'No Warm Up' : localValue + ' seconds'}`"
    outlined
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
    modelValue: [Number, String],
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
        return `${this.modelValue || 0}`
      },
      set (val) {
        this.$emit('change', val)
      }
    },
    warmUpPeriods () {
      let values = []
      values = [WARM_UP_PERIOD_LIST]
      for (let i = 1; i <= 10; i++) {
        values.push({
          text: `${i * 5} seconds`,
          value: i * 5
        })
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
