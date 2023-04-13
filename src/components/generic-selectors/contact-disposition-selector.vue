<template>
  <q-select options-selected-class="text-primary"
            class="q-basic-selector"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            ref="contactDispositionSelect"
            map-options
            dense
            bottom-slots
            :use-input="useInput"
            :use-chips="useChips"
            :emit-value="emitValue"
            :options="options"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="selectorClass"
            :outlined="outlined"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            v-model="selectedId"
            @popup-show="onShowMenu"
            @filter="filterFn"
            @focus="onFocus"
            @blur="onBlur"
            @input="onInput">
    <template v-slot:prepend
              v-if="prepend">
      <span class="text-size-xs text-grey-80">{{ prepend }}</span>
    </template>

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
        <q-item-section avatar>
          <q-icon name="fa fa-bolt"
                  :style="{ color: scope.opt.color, fontSize: '14px' }"
                  v-show="!scope.opt.is_external">
          </q-icon>
          <q-icon name="fa fa-lock"
                  :style="{ color: scope.opt.color, fontSize: '14px' }"
                  v-show="scope.opt.is_external">
          </q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label v-html="scope.opt.name"/>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:hint>
      <span :class="hintClass">
        {{ hint }}
      </span>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import { selectorMixin, dispositionsOptionsMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-disposition-selector',

  mixins: [
    selectorMixin,
    dispositionsOptionsMixin
  ],

  props: {
    value: {
      required: false
    },

    multiple: {
      type: Boolean,
      default: false,
      required: false
    },

    disable: {
      type: Boolean,
      default: false,
      required: false
    },

    prepend: {
      type: String,
      required: false
    },

    genericStyling: {
      type: Boolean,
      default: true
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

    outlined: {
      type: Boolean,
      default: true
    },

    showPlaceholder: {
      type: Boolean,
      default: true
    },

    emitValue: {
      type: Boolean,
      default: true
    },

    useChips: {
      type: Boolean,
      default: true
    },

    useInput: {
      type: Boolean,
      default: true
    },

    required: {
      type: Boolean,
      default: false
    }
  },

  model: {
    prop: 'value',
    event: 'change'
  },

  data () {
    return {
      options: [],
      type: 'contact',
      reference: 'contactDispositionSelect',
      fullOptionsProperty: 'orderedDispositions'
    }
  },

  computed: {
    ...mapState(['dispositionStatuses']),

    placeholder () {
      if (!this.showPlaceholder) {
        return ''
      }

      switch (true) {
        case this.multiple && this.selectedId.length < 1:
          return 'Select Contact Dispositions'
        case !this.multiple && !this.selectedId:
          return 'Select Contact Disposition'
        case this.multiple && this.selectedId.length > 0:
        case !this.multiple && this.selectedId:
        default:
          return ''
      }
    },

    selectorClass () {
      const prependClass = this.prepend ? 'with-prepend' : ''
      const genericStylingClass = this.genericStyling ? 'generic-selector' : ''
      const highlightedClass = this.highlighted ? this.highlightedClass : ''
      const requiredClass = this.required ? 'required mb-0' : ''

      return [
        prependClass,
        genericStylingClass,
        highlightedClass,
        requiredClass,
        this.customClass
      ]
    },

    hint () {
      return this.required ? 'Required' : ''
    },

    hintClass () {
      const requiredClass = this.required ? 'text-danger' : ''
      return [
        requiredClass
      ]
    }
  },

  created () {
    this.options = this.orderedDispositions
  },

  methods: {
    filterFn (val, update) {
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.options = this.orderedDispositions.filter(contactDisposition => contactDisposition.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.orderedDispositions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.orderedDispositions.filter(contactDisposition => contactDisposition.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.selectedId = this.value
    },

    selectedId (val) {
      if (this.selectedId !== this.value) {
        this.$emit('change', val)
      }
      this.showInputPlaceholder()
    }
  }
}
</script>
