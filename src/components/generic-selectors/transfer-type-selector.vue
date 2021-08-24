<template>
  <div>
    <q-select
      :options="options"
      :multiple="multiple"
      :placeholder="placeholder"
      :disable="disable"
      v-model="transferType"
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
import * as CommunicationTransferTypes from 'src/constants/communication-transfer-types'
export default {
  name: 'transfer-type-selector',

  props: {
    value: {
      type: [String, Number],
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
    placeholder: {
      type: String,
      default: 'Select Transfer Type'
    }
  },

  data () {
    return {
      transferType: this.value,
      options: [
        { value: CommunicationTransferTypes.TRANSFER_TYPE_COLD, label: 'Cold Transfer' },
        { value: CommunicationTransferTypes.TRANSFER_TYPE_WARM, label: 'Warm Transfer' },
        { value: CommunicationTransferTypes.TRANSFER_TYPE_CONF, label: 'Conference' }
      ]
    }
  },

  methods: {
    onSelect () {
      this.$emit('select', this.transferType)
    }
  }
}
</script>

<style scoped>

</style>
