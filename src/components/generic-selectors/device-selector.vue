<template>
  <q-select ref="device-selector"
            :options="options"
            v-model="selectedId"
            class="has-margin-top-5 q-basic-selector"
            option-value="id"
            option-label="label"
            use-input
            emit-value
            map-options
            outlined
            dense
            @focus="onFocus"
            @blur="onBlur"
            @input="onInput">
  </q-select>
</template>

<script>
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'device-selector',
  mixins: [
    selectorMixin
  ],
  props: {
    value: {
      required: false
    },
    options: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      selectedId: this.value,
      emitChange: true,
      reference: 'device-selector',
      fullOptionsProperty: 'options'
    }
  },
  watch: {
    value: function (value) {
      this.selectedId = value
    },
    selectedId () {
      this.showInputPlaceholder()
    }
  }
}
</script>
