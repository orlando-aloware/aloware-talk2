<template>
  <div class="container">
    <div class="row">
      <div class="col-4">
        Schedule
      </div>
      <div class="col-8">
        <q-card>
          <p>Your admin has restricted bulk messages to only be sent during:</p>
          <p>9 am - 6 pm</p>
        </q-card>
        <div>
          <q-radio v-model="scheduleOption" val="now" label="Send now" /> <br/>
          <q-radio v-model="scheduleOption" val="pick" label="Pick a time" />
        </div>
        <div v-if="scheduleOption === 'pick'">
          <div>
            Date
          </div>
          <div>
            Time
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        From
      </div>
      <div class="col-8">
        <line-selector v-model="selectedLine"
                      :multiple="false"
                      :use-chips="false"
                      :generic-styling="false"
                      :generic-multiselect="false"
                      :clearable="true"
                      @change="onLineChange">
        </line-selector>
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        Throttling
      </div>
      <div class="col-8">
        <q-select options-selected-class="text-primary"
                  class="q-basic-selector"
                  color="primary"
                  input-debounce="0"
                  emit-value
                  map-options
                  dense
                  outlined
                  :options="THROTTLING_OPTIONS"
                  v-model="selectedThrottling">
        </q-select>
      </div>
    </div>
  </div>
</template>
<script>
import LineSelector from 'components/generic-selectors/line-selector'

const THROTTLING_OPTIONS = [
  {
    label: 'Option 1',
    value: 1
  }
]

export default {
  components: {
    LineSelector
  },

  data: () => ({
    scheduleOption: 'now',
    THROTTLING_OPTIONS,
    selectedThrottling: null,
    selectedLine: null
  }),

  methods: {
    onLineChange (change) {
      console.log({ change })
    }
  }
}
</script>
