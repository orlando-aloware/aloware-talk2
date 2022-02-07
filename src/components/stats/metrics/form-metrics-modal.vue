<template>
  <q-dialog
    v-model="modal"
    transition-show="jump-down">
    <q-card
      flat
      style="width: 380px;"
      class="my-card pb-4">
      <div class="row text-center justify-center">
        <q-card
          flat
          style="width: 300px;">
          <q-card-section class="pt-4 no-default-padding">
            <div class="text-center text-h6 pt-3 pb-4">
              {{ title }}
            </div>
            <q-select
              rounded
              outlined
              dense
              map-options
              emit-value
              use-input
              clearable
              input-debounce="0"
              option-value="metric_id"
              option-label="label"
              class="border-half-rounded"
              ref="statsSelectMetrics"
              v-model="metric"
              :options="filteredMetricOptions"
              :placeholder="placeholder"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @popup-show="onShowMetricsMenu"
              @filter="filterFn">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section v-if="!scope.opt.disable" avatar></q-item-section>
                  <q-item-section>
                    <q-item-label
                      v-if="scope.opt.disable"
                      class="text-subtitle2 font-weight-bold"
                      disabled label
                      v-html="pluralizeLabel(scope.opt.label)" />
                    <q-item-label
                      v-else
                      v-html="scope.opt.label" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-select
              rounded
              outlined
              dense
              ref="statsSelectTextColor"
              option-value="text"
              option-label="text"
              class="border-half-rounded"
              v-model="color"
              :options="colors"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @popup-show="onShowColorMenu">
              <template v-slot:selected>
                <template v-if="color">
                  <i :class="`fas fa-square color-${color.color} pr-2`"></i>
                  {{ color.text }}
                </template>
                <template v-else>
                  Select Color
                </template>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section avatar>
                    <i :class="`fas fa-square color-${scope.opt.color} px-2`"></i>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-html="scope.opt.text" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <br />
            <q-btn
              @click="submit"
              :disable="!validData"
              unelevated
              color="blue"
              text-color="white"
              :label="buttonLabel"
              class="full-width stats-page-btn border-half-rounded" />
          </q-card-section>
        </q-card>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapState } from 'vuex'
import * as MetricOptionColors from 'src/constants/metric-option-colors'
import * as MetricOptionGroups from 'src/constants/metric-option-groups'

export default {
  name: 'FormMetricsModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    buttonLabel: {
      type: String,
      default: 'Submit'
    },
    resources: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapState('stats', ['availableMetrics']),
    colors () {
      return this.MetricOptionColors.METRIC_OPTIONS_COLORS
    },
    actionCreate () {
      if (this.resources?.metricId) {
        return true
      }
      return false
    },
    validData () {
      if (!this.color || !this.metric) {
        return false
      }
      return true
    }
  },
  data () {
    return {
      modal: false,
      metric: null,
      model: '',
      color: {
        color: 'black',
        text: 'No Color',
        value: 'black'
      },
      selectWidth: 0,
      filteredMetricOptions: [],
      placeholder: 'Add Metric',
      MetricOptionColors,
      MetricOptionGroups
    }
  },
  mounted () {
    this.filteredMetricOptions = this.availableMetrics
  },
  watch: {
    isOpen (val) {
      this.modal = val
    },
    modal (val) {
      if (val === false) {
        this.$emit('closed', true)
        this.resetData()
      } else {
        if (this.actionCreate) {
          let { color, metricId } = this.resources
          this.color = this.colors.find(col => {
            return col.value === color
          })
          this.metric = metricId
        }
      }
    },
    availableMetrics: {
      deep: true,
      handler: function () {
        this.filteredMetricOptions = this.availableMetrics
      }
    },
    metric () {
      if (this.metric) {
        this.placeholder = ''
      } else {
        this.placeholder = 'Add Metric'
      }
    }
  },
  methods: {
    async submit () {
      const option = this.availableMetrics.find(option => option.metric_id === this.metric)
      if (this.actionCreate) {
        this.$emit('update', {
          type: option ? option.type : null,
          metricId: this.metric,
          color: this.color.value
        })
        return
      }
      this.$emit('create', {
        categoryLabel: option ? option.categoryLabel : '',
        label: option ? option.label : '',
        type: option ? option.type : null,
        metricId: this.metric,
        color: this.color.value
      })
      this.modal = true
    },
    getOptionsText (id) {
      const option = this.availableMetrics.find(option => option.metric_id === id)
      return option ? option.label : ''
    },
    resetData () {
      this.metric = ''
      this.color = {
        color: 'black',
        text: 'No Color',
        value: 'black'
      }
    },
    onShowColorMenu () {
      this.selectWidth = this.$refs.statsSelectTextColor.$el.offsetWidth
    },
    onShowMetricsMenu () {
      this.selectWidth = this.$refs.statsSelectMetrics.$el.offsetWidth
    },
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.filteredMetricOptions = this.availableMetrics
        })
        return
      }

      update(() => {
        this.filteredMetricOptions = this.availableMetrics.filter(metric => metric.label.toLowerCase().indexOf(val.toLowerCase()) !== -1)
      })
    },
    pluralizeLabel (label) {
      if (label && label.toLowerCase()[(label.length - 1)] !== 's') {
        return `${label}s`
      }
      return label
    }
  }
}
</script>
