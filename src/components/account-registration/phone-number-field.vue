<template>
  <div :class="['col-xs-12', colMd, paddingClasses]">
    <label class="flex mb-1 text-weight-medium">
      {{ label }}
    </label>
    <div class="phone-row">
      <q-input
        class="col-md-2"
        rounded
        outlined
        placeholder="+1"
        mask="+###"
        type="text"
        v-model="countryCode"
      >
      </q-input>
      <q-input
        class="col-md-10 pl-2"
        rounded
        outlined
        type="text"
        :placeholder="placeholder"
        :rules="rules"
        :mask="phoneMask"
        :value="innerValue"
        @input="emitUpdateEvent"
      >
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
    }
  },

  data () {
    return {
      countryCode: '+1',
      innerValue: this.value
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
      this.$emit('input', this.innerValue)
    }
  },

  watch: {
    value (value) {
      this.innerValue = value
    }
  }
}
</script>
