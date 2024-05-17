<template>
  <div data-testid="talk-time-selector-wrapper">
    <q-select ref="talkTimeSelect"
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
              v-model="talkTime"
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              :class="[ highlighted ? highlightedClass : '', customClass]"
              data-testid="talk-time-selector-select"
              @popup-show="onShowMenu"
              @filter="filterFn">

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey" data-testid="talk-time-selector-select-no-results">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                data-testid="talk-time-selector-select-item">
          <q-item-section>
            <q-item-label v-html="scope.opt.label"/>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
export default {
  name: 'talk-time-selector',

  props: {
    value: {
      type: [String, Number],
      default: '0'
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
        case this.multiple && this.talkTime.length < 1:
          return 'Select Talk Times'
        case !this.multiple && !this.talkTime:
          return 'Select Talk Time'
        case this.multiple && this.talkTime.length > 0:
        case !this.multiple && this.talkTime:
        default:
          return ''
      }
    }
  },

  data () {
    return {
      talkTime: this.value.toString(),
      optsArray: [
        { value: '0', label: 'Any Talk Time' },
        { value: '15', label: 'Greater than 15 seconds' },
        { value: '30', label: 'Greater than 30 seconds' },
        { value: '60', label: 'Greater than 60 seconds' },
        { value: '90', label: 'Greater than 90 seconds' },
        { value: '120', label: 'Greater than 2 minutes' },
        { value: '300', label: 'Greater than 5 minutes' }
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
      this.selectWidth = this.$refs.talkTimeSelect.$el.offsetWidth
    }
  },

  mounted () {
    this.options = this.optsArray
  },

  watch: {
    value () {
      this.talkTime = this.value
    },

    talkTime (val) {
      this.$emit('select', this.talkTime ? this.talkTime : '0')
    }
  }
}
</script>
