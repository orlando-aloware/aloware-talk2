<template>
  <div>
    <q-select ref="creatorTypeSelect"
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
              v-model="creatorType"
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              :class="[ highlighted ? highlightedClass : '', customClass]"
              @popup-show="onShowMenu"
              @filter="filterFn">

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
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
export default {
  name: 'creator-type-selector',

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
        case this.multiple && this.creatorType.length < 1:
          return 'Select Creator Types'
        case !this.multiple && !this.creatorType:
          return 'Select Creator Type'
        case this.multiple && this.creatorType.length > 0:
        case !this.multiple && this.creatorType:
        default:
          return ''
      }
    },
    optionsArray () {
      return [
        { value: 1, label: 'Manual' },
        { value: 2, label: 'API' },
        { value: 3, label: 'Workflow' },
        { value: 4, label: 'Broadcast' },
        { value: 5, label: 'Power Dialer' },
        { value: 6, label: 'SMS Reminder' },
        { value: 7, label: 'APP Notifications' },
        { value: 8, label: 'HubSpot' },
        { value: 9, label: 'Zapier' }
      ]
    }
  },

  data () {
    return {
      creatorType: this.value,
      options: [],
      selectWidth: 0
    }
  },

  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.optionsArray
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.optionsArray.filter(item => item.value.toLowerCase().indexOf(needle) > -1)
      })
    },
    onShowMenu () {
      this.selectWidth = this.$refs.creatorTypeSelect.$el.offsetWidth
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
    this.options = this.optionsArray
    this.setAlternativePlaceholder()
  },

  watch: {
    value () {
      this.creatorType = this.value
      this.setAlternativePlaceholder()
    },

    creatorType (val) {
      this.$emit('select', this.creatorType)
    }
  }
}
</script>
