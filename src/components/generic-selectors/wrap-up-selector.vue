<template>
  <div>
    <q-select ref="wrapUpSelector"
              options-selected-class="text-primary"
              color="primary"
              option-value="value"
              option-label="label"
              input-debounce="0"
              style="word-break: break-all;"
              emit-value
              map-options
              dense
              outlined
              v-model="model"
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :class="[ highlighted ? highlightedClass : '', customClass]"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
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
  name: 'wrap-up-selector',

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
    }
  },

  computed: {
    placeholder () {
      switch (true) {
        case this.multiple && this.model.length < 1:
          return 'Select wrap ups'
        case !this.multiple && !this.model:
          return 'Select wrap up'
        case this.multiple && this.model.length > 0:
        case !this.multiple && this.model:
        default:
          return ''
      }
    }
  },

  data () {
    return {
      model: this.value,
      optionsArray: [
        {
          label: 'No Wrap up',
          value: -1
        },
        {
          label: '5 seconds',
          value: 5
        },
        {
          label: '10 seconds',
          value: 10
        },
        {
          label: '15 seconds',
          value: 15
        },
        {
          label: '30 seconds',
          value: 30
        },
        {
          label: '45 seconds',
          value: 45
        },
        {
          label: '60 seconds',
          value: 60
        },
        {
          label: '120 seconds',
          value: 120
        },
        {
          label: '180 seconds',
          value: 180
        },
        {
          label: '300 seconds',
          value: 300
        },
        {
          label: 'Indefinitely',
          value: 0
        }
      ],
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
      this.selectWidth = this.$refs.wrapUpSelector.$el.offsetWidth
    }
  },
  mounted () {
    this.options = this.optionsArray
  },
  watch: {
    value () {
      this.model = this.value
    },

    model (val) {
      this.$emit('select', this.model ? this.model : 0)
    }
  }
}
</script>
