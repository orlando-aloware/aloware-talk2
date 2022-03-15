<template>
  <q-select
    :class="`padded-container`"
    option-value="metric_id"
    option-label="label"
    ref="sessionMetrics"
    outlined dense emit-value
    v-model="localValue"
    :options="availableMetrics"
    :use-chips="useChips"
    use-input
    map-options
    :multiple="multiple"
    :placeholder="placeholder"
    :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
    @popup-show="onShowMetricsMenu">
    <!-- <template v-slot:selected>
      <template v-if="modelValue">
        {{ modelValue }}
      </template>
      <template v-else>
        Add Metrics
      </template>
    </template> -->
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="no-results text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
        <q-item-section v-if="!scope.opt.disable" avatar></q-item-section>
        <q-item-section>
          <q-item-label
            v-if="scope.opt.disable"
            class="text-subtitle2 font-weight-bold"
            disabled label
            v-html="scope.opt.label" />
          <q-item-label
            v-else
            v-html="scope.opt.label" />
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'SessionMetricSelector',
  model: {
    prop: 'modelValue',
    event: 'change'
  },
  props: {
    modelValue: [String, Array],
    options: {
      type: Array,
      default: () => []
    },
    customClass: {
      type: String,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    useChips: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('stats', [
      'availableMetrics'
    ]),
    localValue: {
      get () {
        return this.modelValue
      },
      set (val) {
        this.$emit('change', val)
      }
    },
    placeholder () {
      return this.localValue?.length > 0 ? '' : 'Select Metrics'
    }
  },
  data () {
    return {
      selectWidth: ''
    }
  },
  methods: {
    onShowMetricsMenu () {
      this.selectWidth = this.$refs.sessionMetrics.$el.offsetWidth
    }
  }
}
</script>
