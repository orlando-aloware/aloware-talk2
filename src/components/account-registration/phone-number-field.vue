<template>
  <div :class="['col-xs-12', colMd, paddingClasses]">
    <label class="flex mb-1 text-weight-medium">
      {{ label }}
    </label>
    <div class="phone-row">
      <q-input class="col-md-3"
               rounded
               outlined
               placeholder="+1"
               mask="+###"
               type="text"
               :disable="disabled"
               v-model="countryCode">
      </q-input>
      <q-input class="col-md-9 pl-2"
               ref="inputRef"
               type="text"
               rounded
               outlined
               :placeholder="placeholder"
               :rules="rules"
               :mask="phoneMask"
               :value="formattedValue"
               :disable="disabled"
               @input="emitUpdateEvent">
      </q-input>
    </div>

    <slot name="hint"></slot>
  </div>
</template>

<script>
import { maskMixin } from 'src/plugins/mixins'

export default {
  name: 'PhoneNumberField',

  mixins: [maskMixin],

  props: {
    label: {
      type: String,
      required: true
    },

    placeholder: {
      type: String,
      required: true
    },

    value: {
      type: String,
      default: ''
    },

    colMd: {
      type: String,
      default: 'col-md-5'
    },

    paddingClasses: {
      type: String,
      default: ''
    },

    rules: {
      type: Array,
      default: () => []
    },

    type: {
      type: String,
      default: 'text'
    },

    isPassword: {
      type: Boolean,
      default: false
    },

    disabled: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      innerValue: this.value,
      countryCode: '+1'
    }
  },

  computed: {
    phoneMask () {
      return this.getMaskByCountry(this.countryCode?.replace('+', ''))
    }
  },

  methods: {
    emitUpdateEvent (value) {
      this.innerValue = value
      this.$emit('input', this.countryCode + ' ' + this.innerValue)
    },

    validate () {
      if (this.$refs.inputRef && typeof this.$refs.inputRef.validate === 'function') {
        return this.$refs.inputRef.validate()
      }
    }
  },

  watch: {
    value (value) {
      if (value && value.includes('//')) {
        const [countryCode, phoneNumber] = value.split('//')
        this.countryCode = countryCode
        this.innerValue = phoneNumber
        this.formattedValue = phoneNumber
      } else {
        this.innerValue = value
      }
    }
  }
}
</script>
