<template>
  <q-select ref="select"
            class="q-basic-selector"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            style="word-break: break-all;"
            use-input
            emit-value
            map-options
            dense
            v-model="selectedId"
            :hide-dropdown-icon="hideDropdownIcon"
            :clearable="clearable"
            :outlined="outlined"
            :borderless="borderless"
            :options="options"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', highlighted ? highlightedClass : '', customClass]"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            @input="onInput">
  </q-select>
</template>

<script>
import * as CommunicationTypes from '../../constants/communication-types'
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'communication-type-selector',

  mixins: [
    selectorMixin
  ],

  props: {
    value: {
      type: Number,
      required: false
    },

    from: {
      type: String,
      required: false,
      default: 'calendar'
    },

    disable: {
      type: Boolean,
      default: false,
      required: false
    },

    prepend: {
      type: String,
      required: false
    },

    genericStyling: {
      type: Boolean,
      default: true
    },

    highlighted: {
      type: Boolean,
      default: false
    },

    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    },

    customClass: {
      type: String,
      default: ''
    },

    outlined: {
      type: Boolean,
      default: true
    },

    borderless: {
      type: Boolean,
      default: false
    },

    showPlaceholder: {
      type: Boolean,
      default: true
    },

    clearable: {
      type: Boolean,
      default: false
    },

    hideDropdownIcon: {
      type: Boolean,
      default: false
    },

    customPlaceholder: {
      type: String,
      default: ''
    },

    showNumber: {
      type: Boolean,
      default: true
    },

    threshold: {
      type: Number,
      default: 3
    },

    searchOnScroll: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      isFocused: false,
      selectedId: this.value,
      reference: 'select',
      fullOptionsProperty: 'options',
      options: []
    }
  },

  computed: {
    placeholder () {
      return this.value ? '' : 'Select type'
    }
  },

  mounted () {
    this.loadTypes()
  },

  methods: {
    loadTypes () {
      switch (this.from) {
        case 'calendar':
          this.options = this.getCalendarTypes()
          break
      }
    },

    getCalendarTypes () {
      return [
        {
          name: 'Appointment',
          id: CommunicationTypes.APPOINTMENT
        },
        {
          name: 'Reminder',
          id: CommunicationTypes.REMINDER
        }
      ]
    },

    onInput () {
      this.$emit('input', this.selectedId)
    }
  }
}
</script>
