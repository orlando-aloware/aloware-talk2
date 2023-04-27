<template>
  <div>
    <vue-ctk-date-time-picker :formatted="formatted"
                              :label="placeholder"
                              :only-date="dateOnly"
                              :no-label="noLabel"
                              :no-header="noHeader"
                              :min-date="minDate"
                              :no-button-now="noNowButton"
                              :auto-close="autoClose"
                              :minute-interval="minuteInterval"
                              :disabled-hours="disabledHours"
                              :no-value-to-custom-elem="noValueToCustomElem"
                              :no-clear-button="noClearButton"
                              no-keyboard
                              v-model="date"
                              @input="onInput">
      <slot></slot>
    </vue-ctk-date-time-picker>
  </div>
</template>

<script>
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'

export default {
  name: 'date-selector',

  components: {
    VueCtkDateTimePicker
  },

  props: {
    value: {
      required: false
    },
    minDate: {
      type: String,
      required: false,
      default: '-'
    },
    dateOnly: {
      type: Boolean,
      required: false,
      default: true
    },
    noLabel: {
      type: Boolean,
      required: false,
      default: true
    },
    noHeader: {
      type: Boolean,
      required: false,
      default: true
    },
    autoClose: {
      type: Boolean,
      required: false,
      default: true
    },
    noNowButton: {
      type: Boolean,
      required: false,
      default: true
    },
    placeholder: {
      type: String,
      required: false,
      default: 'Select date'
    },
    minuteInterval: {
      type: Number,
      required: false,
      default: 1
    },
    disabledHours: {
      type: Array,
      required: false,
      default: () => { return [] }
    },
    formatted: {
      type: String,
      required: false,
      default: 'l'
    },
    noValueToCustomElem: {
      type: Boolean,
      default: false
    },
    noClearButton: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      date: this.value
    }
  },

  methods: {
    onInput (value) {
      this.$emit('dateSelected', value)
    }
  },

  created () {
    if (this.value) {
      this.date = window.moment(this.value)
    }
  },

  watch: {
    value (date) {
      this.date = date ? window.moment(date) : null
    }
  }
}
</script>
