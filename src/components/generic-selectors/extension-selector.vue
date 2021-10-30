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
              use-input
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
            <q-item-label v-html="scope.opt"/>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>

import { mapState } from 'vuex'

export default {
  name: 'extension-selector',

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
    ...mapState(['users']),

    placeholder () {
      switch (true) {
        case this.multiple && this.model.length < 1:
          return 'Select extensions'
        case !this.multiple && !this.model:
          return 'Select extension'
        case this.multiple && this.model.length > 0:
        case !this.multiple && this.model:
        default:
          return ''
      }
    },

    availableExtensions () {
      let availableExtensions = []
      // fill the extensions array
      for (let i = 100; i < 1000; i++) {
        availableExtensions.push(i.toString())
      }

      // find used extensions
      let usedExtensions = []
      if (this.users) {
        usedExtensions = this.users.map(user => (user.extension) ? user.extension : null).filter(o => o !== null)
      }

      // remove used extensions from available extensions
      availableExtensions = availableExtensions.filter((extension) => !usedExtensions.includes(extension))

      return availableExtensions
    }
  },

  data () {
    return {
      model: this.value,
      options: [],
      selectWidth: 0
    }
  },

  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.availableExtensions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.availableExtensions.filter(item => item.toLowerCase().indexOf(needle) > -1)
      })
    },
    onShowMenu () {
      this.selectWidth = this.$refs.wrapUpSelector.$el.offsetWidth
    }
  },
  mounted () {
    this.options = this.availableExtensions
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
