<template>
  <div data-testid="comm-type-selector-wrapper">
    <q-select options-selected-class="text-primary"
              color="primary"
              option-value="value"
              option-label="label"
              input-debounce="0"
              style="word-break: break-all;"
              :use-input="useInput"
              emit-value
              map-options
              dense
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :class="[ highlighted ? highlightedClass : '', customClass]"
              data-testid="comm-type-selector-select"
              ref="communicationTypeSelect"
              v-model="selectedValue"
              @popup-show="onShowMenu"
              @filter="filterFn">
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey"
                          data-testid="comm-type-selector-no-results">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                data-testid="comm-type-selector-item"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label v-html="scope.opt.label" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import { ANY_COMMUNICATION_TYPE, CALL_TYPE, SMS_TYPE, EMAIL_TYPE, FAX_TYPE } from 'src/constants/communication-types'
export default {
  name: 'CommunicationTypeFilterSelector',

  props: {
    value: {
      type: [String, Number],
      default: 0
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
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
    useInput: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    placeholder () {
      switch (true) {
        case this.multiple && this.selectedValue.length < 1:
          return 'Select Types'
        case !this.multiple && !this.selectedValue:
          return 'Select Type'
        case this.multiple && this.selectedValue.length > 0:
        case !this.multiple && this.selectedValue:
        default:
          return ''
      }
    }
  },

  data () {
    return {
      selectedValue: this.value,
      optsArray: [
        { value: ANY_COMMUNICATION_TYPE, label: 'All' },
        { value: CALL_TYPE, label: 'Calls' },
        { value: SMS_TYPE, label: 'Text Message' },
        { value: EMAIL_TYPE, label: 'Email' },
        { value: FAX_TYPE, label: 'Fax' }
      ],
      options: [],
      selectWidth: 0
    }
  },

  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.optsArray
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.optsArray.filter(item => item.value.toLowerCase().indexOf(needle) > -1)
      })
    },
    onShowMenu () {
      this.selectWidth = this.$refs.communicationTypeSelect.$el.offsetWidth
    }
  },
  mounted () {
    this.options = this.optsArray
  },
  watch: {
    value () {
      this.selectedValue = this.value
    },

    selectedValue (val) {
      this.$emit('select', this.selectedValue ? this.selectedValue : ANY_COMMUNICATION_TYPE)
    }
  }
}
</script>
