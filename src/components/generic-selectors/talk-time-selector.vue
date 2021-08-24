<template>
  <div>
    <q-select
      :options="options"
      :multiple="multiple"
      :placeholder="placeholder"
      :disable="disable"
      v-model="talkTime"
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
  name: 'talk-time-selector',

  props: {
    value: {
      type: [String, Number],
      default: '0'
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
      talkTime: this.value.toString(),
      options: [
        { value: '0', label: 'Any Talk Time' },
        { value: '15', label: 'Greater than 15 seconds' },
        { value: '30', label: 'Greater than 30 seconds' },
        { value: '60', label: 'Greater than 60 seconds' },
        { value: '90', label: 'Greater than 90 seconds' },
        { value: '120', label: 'Greater than 2 minutes' },
        { value: '300', label: 'Greater than 5 minutes' }
      ]
    }
  },

  methods: {
    onSelect () {
      this.$emit('select', this.talkTime ? this.talkTime : '0')
    }
  }
}
</script>

<style scoped>

</style>
