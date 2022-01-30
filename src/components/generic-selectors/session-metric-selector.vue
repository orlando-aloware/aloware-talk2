<template>
  <q-select
    :class="`padded-container`"
    option-value="text"
    option-label="text"
    ref="sessionMetrics"
    outlined dense emit-value
    v-model="localValue"
    :options="options"
    :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
    @popup-show="onShowMetricsMenu">
    <template v-slot:selected>
      <template v-if="modelValue">
        {{ modelValue }}
      </template>
      <template v-else>
        Add Metrics
      </template>
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
        <q-item-section v-if="!scope.opt.disable" avatar></q-item-section>
        <q-item-section>
          <q-item-label
            v-if="scope.opt.disable"
            class="text-subtitle2 font-weight-bold"
            disabled label
            v-html="scope.opt.text" />
          <q-item-label
            v-else
            v-html="scope.opt.text" />
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
export default {
  name: 'SessionMetricSelector',
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
