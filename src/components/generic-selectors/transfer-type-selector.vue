<template>
  <div data-testid="transfer-type-selector-wrapper">
    <q-select ref="transferTypeSelect"
              options-selected-class="text-primary"
              color="primary"
              option-value="value"
              option-label="label"
              input-debounce="0"
              style="word-break: break-all;"
              :use-input="useInput"
              emit-value
              map-options
              dense
              clearable
              v-model="transferType"
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              :class="[ highlighted ? highlightedClass : '', customClass]"
              data-testid="transfer-type-selector-select"
              @popup-show="onShowMenu"
              @filter="filterFn">
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey" data-testid="transfer-type-selector-select-no-results">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                data-testid="transfer-type-selector-select-item">
          <q-item-section>
            <q-item-label v-html="scope.opt.label"/>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import * as CommunicationTransferTypes from 'src/constants/communication-transfer-types'
export default {
  name: 'transfer-type-selector',

  props: {
    value: {
      type: [String, Number],
      default: null
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
        case this.multiple && this.transferType.length < 1:
          return 'Select Transfer Types'
        case !this.multiple && !this.transferType:
          return 'Select Transfer Type'
        case this.multiple && this.transferType.length > 0:
        case !this.multiple && this.transferType:
        default:
          return ''
      }
    }
  },

  data () {
    return {
      transferType: this.value,
      optsArray: [
        { value: CommunicationTransferTypes.TRANSFER_TYPE_COLD, label: 'Cold Transfer' },
        { value: CommunicationTransferTypes.TRANSFER_TYPE_WARM, label: 'Warm Transfer' },
        { value: CommunicationTransferTypes.TRANSFER_TYPE_CONF, label: 'Conference' }
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
        this.options = this.optsArray.filter(item => item.label.toLowerCase().indexOf(needle) > -1)
      })
    },
    onShowMenu () {
      this.selectWidth = this.$refs.transferTypeSelect.$el.offsetWidth
    },
    setAlternativePlaceholder () {
      this.$el.querySelector('.q-field__native > span').classList.remove('text-muted')
      if (!this.value && !this.useInput) {
        setTimeout(() => {
          this.$el.querySelector('.q-field__native > span').innerText = 'None'
          this.$el.querySelector('.q-field__native > span').classList.add('text-muted')
        }, 300)
      }
    }
  },

  mounted () {
    this.options = this.optsArray
    this.setAlternativePlaceholder()
  },

  watch: {
    value () {
      this.transferType = this.value
      this.setAlternativePlaceholder()
    },

    transferType () {
      this.$emit('select', this.transferType)
    }
  }
}
</script>
