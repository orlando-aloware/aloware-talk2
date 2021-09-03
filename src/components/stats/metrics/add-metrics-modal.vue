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
          <q-card-section class="pt-4">
            <div class="text-center text-h6 pt-3 pb-4">Add Metric</div>
            <q-select
              @popup-show="onShowMetricsMenu"
              outlined dense emit-value
              v-model="metrics"
              :options="metricOptions"
              option-value="text"
              option-label="text"
              ref="statsSelectMetrics"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`">
              <template v-slot:selected>
                <template v-if="metrics">
                  {{ metrics }}
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
                      class="text-subtitle2 font-weight-medium"
                      disabled label
                      v-html="scope.opt.text" />
                    <q-item-label
                      v-else
                      v-html="scope.opt.text" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-select
              @popup-show="onShowColorMenu"
              outlined dense
              v-model="color"
              :options="colors"
              option-value="text"
              option-label="text"
              ref="statsSelectTextColor"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`">
              <template v-slot:selected>
                <template v-if="color">
                  <q-icon
                    :color="color.value"
                    name="font_download"
                    class="pr-2" />
                  {{ color.text }}
                </template>
                <template v-else>
                  Select Color
                </template>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section avatar>
                    <q-icon
                      :color="scope.opt.value"
                      name="font_download" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-html="scope.opt.text" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <br />
            <q-btn
              @click="createNewMetric"
              unelevated
              color="blue"
              text-color="white"
              label="Create Metric"
              class="full-width" />
          </q-card-section>
        </q-card>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

// import ContactDispositionSelector from 'components/generic-selectors/contact-disposition-selector'
import {
  METRIC_OPTIONS_2
} from 'src/constants/stats'

const stats = { METRIC_OPTIONS_2 }

export default {
  name: 'AddMetricsModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  computed: {
    metricOptions () {
      if (stats) {
        return stats.METRIC_OPTIONS_2
      }
      return []
    },
    colors () {
      return [
        { value: '', text: 'No Color' },
        { value: 'red', text: 'Warning' },
        { value: 'blue', text: 'Success' }
      ]
    },
    times () {
      const times = []
      for (let hour = 6; hour < 24; hour++) {
        times.push({
          label: window.moment({ hour }).format('h:mm A'),
          value: window.moment({ hour }).format('HH:mm')
        })
        times.push({
          label: window.moment({ hour, minute: 15 }).format('h:mm A'),
          value: window.moment({ hour, minute: 15 }).format('HH:mm')
        }
        )
        times.push({
          label: window.moment({ hour, minute: 30 }).format('h:mm A'),
          value: window.moment({ hour, minute: 30 }).format('HH:mm')
        }
        )
        times.push({
          label: window.moment({ hour, minute: 45 }).format('h:mm A'),
          value: window.moment({ hour, minute: 45 }).format('HH:mm')
        }
        )
      }
      return times
    }
  },
  data () {
    return {
      modal: false,
      metrics: null,
      model: '',
      color: '',
      selectWidth: 0
    }
  },
  watch: {
    isOpen (val) {
      this.modal = val
    },
    modal (val) {
      if (val === false) {
        this.$emit('closed', true)
        this.resetData()
      }
    }
  },
  methods: {
    createNewMetric () {
      console.log('999 :>> ', 999)
    },
    onSubmit (event) {
      console.log('event :>> ', event)
    },
    resetData () {
      this.metrics = ''
    },
    onShowColorMenu () {
      this.selectWidth = this.$refs.statsSelectTextColor.$el.offsetWidth
    },
    onShowMetricsMenu () {
      this.selectWidth = this.$refs.statsSelectMetrics.$el.offsetWidth
    }
  }
}
</script>
