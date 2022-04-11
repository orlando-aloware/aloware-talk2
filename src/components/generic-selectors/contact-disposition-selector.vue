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
            :use-input="useInput"
            :use-chips="useChips"
            :emit-value="emitValue"
            :options="options"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', highlighted ? highlightedClass : '', customClass]"
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
                  v-show="!scope.opt.is_external"
                  :style="{ color: scope.opt.color, fontSize: '14px' }">
          </q-icon>
          <q-icon name="fa fa-lock"
                  v-show="scope.opt.is_external"
                  :style="{ color: scope.opt.color, fontSize: '14px' }">
          </q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label v-html="scope.opt.name"/>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-disposition-selector',

  mixins: [
    selectorMixin
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
    }
  },

  model: {
    prop: 'value',
    event: 'change'
  },

  data () {
    return {
      selectedId: this.value,
      options: [],
      reference: 'contactDispositionSelect'
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

    contactDispositionsAlphabeticalOrder () {
      if (this.dispositionStatuses) {
        return _.clone(this.dispositionStatuses).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  mounted () {
    this.options = this.contactDispositionsAlphabeticalOrder
  },

  methods: {
    filterFn (val, update) {
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.options = this.contactDispositionsAlphabeticalOrder.filter(contactDisposition => contactDisposition.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.contactDispositionsAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.contactDispositionsAlphabeticalOrder.filter(contactDisposition => contactDisposition.name.toLowerCase().indexOf(needle) > -1)
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
    },
    contactDispositionsAlphabeticalOrder () {
      this.options = this.contactDispositionsAlphabeticalOrder
    }
  }
}
</script>
