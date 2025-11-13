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
        <q-item v-if="scope.opt.disable"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-label header class="text-size-xs">{{ scope.opt.name }}</q-item-label>
        </q-item>
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                v-else>
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

    inUseExtensions () {
      if (!this.users) {
        return []
      }

      return this.users.map(user => (user.extension) ? user.extension : null)
        .filter(o => o !== null)
        .sort((a, b) => a - b)
    },

    groupedInUseExtensions () {
      return [
        {
          name: 'In Use',
          disable: true
        },
        ...this.inUseExtensions.map((ext) => ({
          name: ext,
          disable: true
        }))
      ]
    },

    availableExtensions () {
      // remove used extensions from available extensions
      return this.allExtensions.filter((extension) => !this.inUseExtensions.includes(extension))
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
          this.options = this.combineExtensionsWithInUse(this.availableExtensions.slice(0, 100))
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.combineExtensionsWithInUse(this.availableExtensions.filter(item => item.toLowerCase().indexOf(needle) > -1).slice(0, 100))
      })
    },

    loadExtensions () {
      const storedExtensions = localStorage.getItem('extensions')
      if (storedExtensions) {
        this.allExtensions = JSON.parse(storedExtensions)
      } else {
        this.initializeExtensions()
        localStorage.setItem('extensions', JSON.stringify(this.allExtensions))
      }
    },

    initializeExtensions () {
      const extensionInitial = 100
      const extensionLimit = 100000

      // fill the extensions array
      for (let i = extensionInitial; i < extensionLimit; i++) {
        this.allExtensions.push(i.toString())
      }
    },

    combineExtensionsWithInUse (extensions) {
      return [
        ...extensions,
        ...this.groupedInUseExtensions
      ]
    }
  },

  mounted () {
    this.loadExtensions()
    this.options = this.combineExtensionsWithInUse(this.availableExtensions.slice(0, 100))
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
