<template>
  <q-dialog
    persistent
    v-model="modal"
    transition-show="jump-down">
    <q-card
      flat
      style="width: 350px;"
      class="my-card">
      <q-toolbar style="height: 10px;">
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>
      <q-card-section class="pt-0">
        <div class="text-center text-h6 pb-4">Add Metric</div>
        <q-select
          outlined dense
          v-model="metrics"
          :options="listOfMetrics"
          option-value="name"
          option-label="name"
          text="name"
          value="code">
          <template v-slot:selected>
            <template v-if="metrics">
              {{ metrics['name'] }}
            </template>
            <template v-else>
              Add Metrics
            </template>
          </template>
        </q-select>
        <q-select
          outlined dense
          v-model="color"
          :options="colors">
          <template v-slot:selected>
            <template v-if="metrics">
              {{ color }}
            </template>
            <template v-else>
              Select Color
            </template>
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon :color="scope.opt" name="font_download" />
              </q-item-section>
              <q-item-section>
                <q-item-label v-html="scope.opt" />
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
  </q-dialog>
</template>

<script>
// import * as Metrics from 'src/constants/metrics'
// import VueMultiselect from 'vue-multiselect'
// import PredefinedTimeSelector from 'components/predefined-time-selector'

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
    listOfMetrics () {
      return [
        { name: '101', code: 1 },
        { name: '102', code: 2 }
      ]
    },
    colors () {
      return [
        'blue', 'red', 'black'
      ]
    }
  },
  data () {
    return {
      modal: false,
      metrics: '',
      model: '',
      color: '',
      options: [
        'Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'
      ]
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
