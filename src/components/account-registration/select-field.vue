<template>
  <div :class="['col-xs-12', colMd, paddingClasses]">
    <label class="flex mb-1 text-weight-medium">
      {{ label }}
    </label>
    <q-select
      rounded
      outlined
      map-options
      :placeholder="placeholder"
      :option-label="optionLabel"
      :option-value="optionValue"
      :options="options"
      v-model="innerValue"
    />
    <slot name="hint"></slot>
  </div>
</template>

<script>
export default {
  name: 'SelectField',

  props: {
    label: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Select'
    },
    value: {
      default: null
    },
    colMd: {
      type: String,
      default: 'col-md-5'
    },
    paddingClasses: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      required: true
    },
    optionLabel: {
      type: String,
      default: 'label'
    },
    optionValue: {
      type: String,
      default: 'value'
    }
  },

  data () {
    return {
      innerValue: this.value
    }
  },

  watch: {
    value (newValue) {
      this.innerValue = newValue
    },

    innerValue (newValue) {
      this.$emit('input', newValue)
    }
  }
}
</script>
