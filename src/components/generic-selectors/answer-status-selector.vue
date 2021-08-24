<template>
  <div>
    <q-select
      :options="options"
      :multiple="multiple"
      :placeholder="placeholder"
      :disable="disable"
      v-model="answerStatus"
      options-selected-class="text-primary"
      color="primary"
      option-value="value"
      option-label="label"
      input-debounce="0"
      use-input
      emit-value
      map-options
      outlined
      dense
      @input="onSelect">

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label v-html="scope.opt.label"/>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
export default {
  name: 'answer-status-selector',

  props: {
    value: {
      type: String,
      default: 'all'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      answerStatus: this.value,
      options: [
        { value: 'all', label: 'All' },
        { value: 'answered', label: 'Answered' },
        { value: 'missed', label: 'Missed' },
        { value: 'abandoned', label: 'Abandoned' },
        { value: 'voicemail', label: 'Voicemail' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'failed', label: 'Failed' },
        { value: 'queued', label: 'Queued' },
        { value: 'hold', label: 'Hold' },
        { value: 'dead_end', label: 'Dead-end' }
      ]
    }
  },

  methods: {
    onSelect () {
      this.$emit('select', this.answerStatus ? this.answerStatus : 'all')
    }
  }
}
</script>

<style scoped>

</style>
