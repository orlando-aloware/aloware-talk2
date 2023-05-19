<template>
  <q-select ref="device-selector"
            :options="options"
            v-model="selectedId"
            behavior="menu"
            class="has-margin-top-5 q-basic-selector"
            option-value="id"
            option-label="label"
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
    devices: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      selectedId: this.value,
      options: [],
      emitChange: true,
      reference: 'device-selector',
      fullOptionsProperty: 'options',
      compareProperty: 'id',
      textProperty: 'label'
    }
  },
  mounted () {
    this.options = this.devices
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
