<template>
  <div data-testid="callback-status-selector-wrapper">
    <q-select ref="callbackStatusSelect"
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
              v-model="callbackStatus"
              :clearable="clearable"
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              :class="[ highlighted ? highlightedClass : '', customClass]"
              data-testid="callback-status-selector-select"
              @popup-show="onShowMenu"
              @filter="filterFn">
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey" data-testid="callback-status-selector-select-no-results">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                data-testid="callback-status-selector-select-item">
          <q-item-section>
            <q-item-label v-html="scope.opt.label"/>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import * as CallbackStatus from 'src/constants/callback-status'
export default {
  name: 'callback-status-selector',

  props: {
    value: {
      type: [Number],
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
    clearable: {
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
        case this.multiple && this.callbackStatus.length < 1:
          return 'Select Callback Statuses'
        case !this.multiple && !this.callbackStatus:
          return 'Select Callback Status'
        case this.multiple && this.callbackStatus.length > 0:
        case !this.multiple && this.callbackStatus:
        default:
          return ''
      }
    }
  },

  data () {
    return {
      callbackStatus: this.value,
      optsArray: [{
        value: CallbackStatus.CALLBACK_STATUS_INITIATED,
        label: 'Initiated'
      }, {
        value: CallbackStatus.CALLBACK_STATUS_REQUESTED,
        label: 'Requested'
      }],
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
      this.selectWidth = this.$refs.callbackStatusSelect.$el.offsetWidth
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
      this.setAlternativePlaceholder()
      this.callbackStatus = this.value
    },

    callbackStatus () {
      this.$emit('select', this.callbackStatus)
    }
  }
}
</script>
