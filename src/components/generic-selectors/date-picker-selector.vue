<template>
  <label class="w-100 position-relative"
    :class="wrapperClass">
    <q-input :class="contentClass"
             :mask="inputMask"
             :disabled="!canEdit"
             v-model="selectedId"
             data-testid="date-picker-selector-input"
             @input="onInput">
      <template v-slot:append>
        <b-button variant="info"
                  class="q-field__focusable-action bg-transparent border-0"
                  data-testid="date-picker-selector-button"
                  :id="popoverId">
          <q-icon name="event" />
        </b-button>
        <b-popover :show.sync="showDatePicker"
                   target="popover-date-picker-sync"
                   data-testid="date-picker-selector-popover"
                   placement="bottom">
          <div :class="popoverClass">
            <q-date ref="datePickerSelect"
                    minimal
                    :mask="datePickerMask"
                    v-model="selectedId"
                    data-testid="date-picker-selector-date-picker"
                    @input="onDateOfBirthSelected">
              <div class="row items-center justify-end">
                <q-btn color="primary"
                       class="close-button"
                       no-caps
                       dense
                       v-show="showCloseButton"
                       data-testid="date-picker-selector-close-button"
                       @click="showDatePicker = false">
                  <div class="px-1">
                    Close
                  </div>
                </q-btn>
              </div>
            </q-date>
          </div>
        </b-popover>
      </template>
    </q-input>
  </label>
</template>

<script>
export default {
  name: 'date-picker-selector',
  props: {
    wrapperClass: {
      type: String,
      reqiured: false,
      default: ''
    },
    contentClass: {
      type: String,
      required: false,
      default: ''
    },
    popoverClass: {
      type: String,
      required: false,
      default: ''
    },
    popoverId: {
      type: String,
      required: true
    },
    canEdit: {
      type: Boolean,
      required: true,
      default: false
    },
    value: {
      required: false
    },
    inputMask: {
      type: String,
      required: false,
      default: '####-##-##'
    },
    datePickerMask: {
      type: String,
      required: false,
      default: 'YYYY-MM-DD'
    }
  },
  data () {
    return {
      selectedId: null,
      showDatePicker: false,
      showCloseButton: true,
      datePickerReference: null
    }
  },
  computed: {
    datePickerView () {
      if (this.datePickerReference) {
        return this.datePickerReference.$data.view
      }

      return null
    }
  },
  created () {
    this.selectedId = this.value === null ? '' : this.value
  },
  methods: {
    onInput (value) {
      this.$emit('change', value)
    },
    onDateOfBirthSelected (value) {
      this.onInput(value)
      this.showDatePicker = false
    }
  },
  watch: {
    value (val) {
      this.selectedId = val === null ? '' : val
    },
    showDatePicker (value) {
      if (value) {
        this.datePickerReference = this.$refs.datePickerSelect
        return
      }

      this.datePickerReference = null
    },
    datePickerView (value) {
      if (value && ['Months', 'Years'].includes(value)) {
        this.showCloseButton = false
        return
      }

      this.showCloseButton = true
    }
  }
}
</script>
