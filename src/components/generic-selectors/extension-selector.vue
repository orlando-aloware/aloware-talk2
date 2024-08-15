<template>
  <div>
    <q-select ref="wrapUpSelector"
              options-selected-class="text-primary"
              class="q-basic-selector"
              color="primary"
              option-value="value"
              option-label="label"
              input-debounce="300"
              style="word-break: break-all;"
              emit-value
              map-options
              dense
              outlined
              v-model="selectedId"
              use-input
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :class="[ highlighted ? highlightedClass : '', customClass]"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @popup-show="onShowMenu"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
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
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'extension-selector',

  mixins: [
    selectorMixin
  ],

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
        case this.multiple && (this.selectedId !== null && this.selectedId !== undefined) && this.selectedId.length < 1:
          return 'Select extensions'
        case !this.multiple && (this.selectedId === null || this.selectedId === undefined):
          return 'Select extension'
        case this.multiple && (this.selectedId !== null && this.selectedId !== undefined) && this.selectedId.length > 0:
        case !this.multiple && this.selectedId:
        default:
          return ''
      }
    },

    availableExtensions () {
      // find used extensions
      const usedExtensions = this.users ? this.users.map(user => (user.extension) ? user.extension : null).filter(o => o !== null) : []

      // remove used extensions from available extensions
      return this.allExtensions.filter((extension) => !usedExtensions.includes(extension))
    }
  },

  data () {
    return {
      selectedId: this.value,
      options: [],
      allExtensions: [],
      reference: 'wrapUpSelector',
      compareProperty: null,
      fullOptionsProperty: 'availableExtensions'
    }
  },

  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.availableExtensions.slice(0, 100)
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.availableExtensions.filter(item => item.toLowerCase().indexOf(needle) > -1).slice(0, 100)
      })
    },

    initializeExtensions () {
      const initialExtension = 100
      const extensionsLimit = 100000

      // fill the extensions array
      for (let i = initialExtension; i < extensionsLimit; i++) {
        this.allExtensions.push(i.toString())
      }
    }
  },
  mounted () {
    this.initializeExtensions()
    this.options = this.availableExtensions.slice(0, 100)
  },
  watch: {
    value () {
      this.selectedId = this.value
    },

    selectedId (val) {
      this.$emit('select', this.selectedId ? this.selectedId : null)
      this.showInputPlaceholder()
    }
  }
}
</script>
