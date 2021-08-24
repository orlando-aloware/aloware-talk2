<template>
  <div>
    <q-select
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              v-model="direction"
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
  name: 'communication-direction-selector',

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
      direction: this.value,
      options: [
        { value: 'all', label: 'All' },
        { value: 'inbound', label: 'Inbound' },
        { value: 'outbound', label: 'Outbound' }
      ]
    }
  },

  methods: {
    onSelect () {
      this.$emit('select', this.direction ? this.direction : 'all')
    }
  }
}
</script>

<style scoped>

</style>
