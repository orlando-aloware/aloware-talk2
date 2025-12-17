<template>
  <q-select ref="deviceSelector"
            v-model="selectedId"
            behavior="menu"
            class="has-margin-top-5 q-basic-selector break-all"
            option-value="id"
            option-label="label"
            :options="options"
            :popup-content-style="`width: ${width}px; word-break: break-all;`"
            emit-value
            map-options
            outlined
            dense
            @popup-show="width = $refs.deviceSelector.$el.offsetWidth"
            @input="onInputNew">
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
      reference: 'deviceSelector',
      fullOptionsProperty: 'options',
      compareProperty: 'id',
      textProperty: 'label',
      width: 0
    }
  },
  mounted () {
    this.options = this.devices
  },
  watch: {
    value: function (value) {
      this.selectedId = value
    }
  }
}
</script>
