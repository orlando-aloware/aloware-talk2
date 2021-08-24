<template>
  <div>
    <q-select
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
      :clearable="clearable"
      v-model="callbackStatus"
      :options="options"
      :multiple="multiple"
      :placeholder="placeholder"
      :disable="disable"
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
import * as CallbackStatus from 'src/constants/callback-status'
export default {
  name: 'callback-status-selector',

  props: {
    value: {
      type: [Number],
      default: null
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Select Callback Status'
    }
  },

  data () {
    return {
      callbackStatus: this.value,
      options: [{
        value: CallbackStatus.CALLBACK_STATUS_INITIATED,
        label: 'Initiated'
      }, {
        value: CallbackStatus.CALLBACK_STATUS_REQUESTED,
        label: 'Requested'
      }]
    }
  },

  methods: {
    onSelect () {
      this.$emit('select', this.callbackStatus)
    }
  }
}
</script>

<style scoped>

</style>
