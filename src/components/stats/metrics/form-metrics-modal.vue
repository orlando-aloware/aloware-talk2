<template>
  <q-dialog
    v-model="modal"
    transition-show="jump-down"
    @show="onShowModal">
    <q-card
      flat
      style="width: 380px;"
      ref="form-metrics-modal"
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
              class="border-half-rounded q-basic-selector"
              ref="statsSelectMetrics"
              v-model="selectedId"
              :options="options"
              :placeholder="placeholder"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @popup-show="onShowMetricsMenu"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @filter="filterFn">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps"
                        v-on="scope.itemEvents"
                        :key="scope.opt.key">
                  <q-item-section v-if="!scope.opt.disable"
                                  avatar></q-item-section>
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
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'FormMetricsModal',
  mixins: [
    selectorMixin
  ],
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
      if (!this.color || !this.selectedId) {
        return false
      }
      return true
    },
    fixedAvailableMetrics () {
      const newMetrics = JSON.parse(JSON.stringify(this.availableMetrics))
      const index = { data: null }
      for (index.data in newMetrics) {
        if (typeof newMetrics[index.data].metric_id !== 'undefined') {
          newMetrics[index.data].metric_id = `${newMetrics[index.data].type}_${newMetrics[index.data].metric_id}`
        }
      }

      return newMetrics
    },
    modalElement () {
      return this.$refs['form-metrics-modal'].$el
    }
  },
  data () {
    return {
      modal: false,
      selectedId: null,
      model: '',
      color: {
        color: 'black',
        text: 'Default',
        value: 'black'
      },
      selectWidth: 0,
      options: [],
      placeholder: 'Add Metric',
      compareProperty: 'metric_id',
      textProperty: 'label',
      MetricOptionColors,
      MetricOptionGroups,
      fullOptionsProperty: 'fixedAvailableMetrics'
    }
  },
  mounted () {
    this.options = this.fixedAvailableMetrics
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
          const { color, metricId } = this.resources
          this.color = this.colors.find(col => {
            return col.value === color
          })
          this.selectedId = metricId
        }
      }
    },
    availableMetrics: {
      deep: true,
      handler: function () {
        this.options = this.fixedAvailableMetrics
      }
    },
    selectedId () {
      if (this.selectedId) {
        this.placeholder = ''
      } else {
        this.placeholder = 'Add Metric'
      }

      this.$options.formMetricsModalCounter = 0
      this.$options.formMetricsModalInterval = setInterval(() => {
        if (this.modal) {
          this.showInputPlaceholder()
          clearInterval(this.$options.formMetricsModalInterval)
        }

        this.$options.formMetricsModalCounter++

        if (this.$options.formMetricsModalCounter >= 300) {
          clearInterval(this.$options.formMetricsModalInterval)
        }
      }, 500)
    }
  },
  methods: {
    async submit () {
      const option = this.availableMetrics.find(option => `${option.type}_${option.metric_id}` === this.selectedId)
      if (this.actionCreate) {
        this.$emit('update', {
          type: option ? option.type : null,
          metricId: this.selectedId,
          color: this.color.value
        })
        return
      }

      this.$emit('create', {
        categoryLabel: option ? option.categoryLabel : '',
        label: option ? option.label : '',
        type: option ? option.type : null,
        metricId: this.selectedId,
        color: this.color.value
      })
      this.modal = true
    },
    resetData () {
      this.selectedId = ''
      this.color = {
        color: 'black',
        text: 'Default',
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
      const fixedMetrics = this.fixedAvailableMetrics
      if (val === '') {
        update(() => {
          this.options = fixedMetrics
        })
        return
      }

      update(() => {
        this.options = fixedMetrics.filter(metric => metric.label.toLowerCase().indexOf(val.toLowerCase()) !== -1)
      })
    },
    pluralizeLabel (label) {
      if (label && label.toLowerCase()[(label.length - 1)] !== 's') {
        return `${label}s`
      }
      return label
    },
    onShowModal () {
      this.element = this.$refs['form-metrics-modal'].$el
    }
  },
  beforeDestroy () {
    clearInterval(this.$options.formMetricsModalInterval)
  }
}
</script>
