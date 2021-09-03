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
            <b-form-select
              v-model="metrics"
              :options="metricOptions"
              icon="exclamation-triangle"
              class="my-3">
              <template #first>
                <b-form-select-option :value="null" disabled>Add Metrics</b-form-select-option>
              </template>
            </b-form-select>
            <q-select
              outlined dense
              v-model="color"
              :options="colors"
              option-value="text"
              option-label="text">
              <!-- <template v-slot:selected>
                <template v-if="color">
                  {{ color.text }}
                </template>
                <template v-else>
                  Select Color
                </template>
              </template> -->
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :color="scope.opt.value" name="font_download" />
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

import {
  METRIC_OPTIONS,
  METRIC_OPTIONS_2
} from 'src/constants/stats'

const stats = { METRIC_OPTIONS }
const stats2 = { METRIC_OPTIONS_2 }

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
  components: {
    // VueMultiselect,
    // PredefinedTimeSelector
  },
  computed: {
    metricOptions () {
      if (stats) {
        return stats.METRIC_OPTIONS
      }
      return []
    },
    options () {
      if (stats) {
        return stats2.METRIC_OPTIONS_2
      }
      return []
    },
    colors () {
      return [
        { value: '', text: 'No Color' },
        { value: 'red', text: 'Warning' },
        { value: 'blue', text: 'Success' }
      ]
    }
  },
  data () {
    return {
      modal: false,
      metrics: null,
      model: '',
      color: ''
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
    }
  }
}
</script>
