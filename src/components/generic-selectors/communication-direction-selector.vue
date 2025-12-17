<template>
  <div data-testid="comm-direction-selector-wrapper">
    <q-select ref="communicationDirectionSelect"
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
              v-model="direction"
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :class="[ highlighted ? highlightedClass : '', customClass]"
              data-testid="comm-direction-selector-select"
              @popup-show="onShowMenu"
              @filter="filterFn">

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey" data-testid="comm-direction-selector-no-results">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                data-testid="comm-direction-selector-item"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label v-html="scope.opt.label"/>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>

import * as CommunicationDirection from 'src/constants/communication-direction'

export default {
  name: 'communication-direction-selector',

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
        case this.multiple && this.direction.length < 1:
          return 'Select Directions'
        case !this.multiple && !this.direction:
          return 'Select Direction'
        case this.multiple && this.direction.length > 0:
        case !this.multiple && this.direction:
        default:
          return ''
      }
    }
  },

  data () {
    return {
      direction: this.value,
      optsArray: [
        { value: 'all', label: 'All' },
        { value: 'inbound', label: 'Inbound' },
        { value: 'outbound', label: 'Outbound' }
      ],
      options: [],
      selectWidth: 0,
      CommunicationDirection
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
      this.selectWidth = this.$refs.communicationDirectionSelect.$el.offsetWidth
    }
  },
  mounted () {
    this.options = this.optsArray
  },
  watch: {
    value () {
      this.direction = this.value
    },

    direction (val) {
      this.$emit('select', this.direction ? this.direction : 'all')
    }
  }
}
</script>
