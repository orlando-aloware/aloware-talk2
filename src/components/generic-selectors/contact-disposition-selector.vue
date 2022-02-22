<template>
  <q-select options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            ref="contactDispositionSelect"
            use-input
            use-chips
            emit-value
            map-options
            dense
            :options="contactDispositionsOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', highlighted ? highlightedClass : '', customClass]"
            :outlined="outlined"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            v-model="contactDispositionId"
            @popup-show="onShowMenu"
            @filter="filterFn">
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

export default {
  name: 'contact-disposition-selector',

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
    }
  },

  model: {
    prop: 'value',
    event: 'change'
  },

  data () {
    return {
      contactDispositionId: this.value,
      contactDispositionsOptions: [],
      selectWidth: 0
    }
  },

  computed: {
    ...mapState(['dispositionStatuses']),

    placeholder () {
      if (!this.showPlaceholder) {
        return ''
      }

      switch (true) {
        case this.multiple && this.contactDispositionId.length < 1:
          return 'Select Contact Dispositions'
        case !this.multiple && !this.contactDispositionId:
          return 'Select Contact Disposition'
        case this.multiple && this.contactDispositionId.length > 0:
        case !this.multiple && this.contactDispositionId:
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

  created () {
    this.contactDispositionsOptions = this.contactDispositionsAlphabeticalOrder
  },

  methods: {
    onShowMenu () {
      this.selectWidth = this.$refs.contactDispositionSelect.$el.offsetWidth
    },
    filterFn (val, update) {
      if (this.contactDispositionId && val === this.contactDispositionId) {
        update(() => {
          this.contactDispositionsOptions = this.contactDispositionsAlphabeticalOrder.filter(contactDisposition => contactDisposition.id === this.contactDispositionId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.contactDispositionsOptions = this.contactDispositionsAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.contactDispositionsOptions = this.contactDispositionsAlphabeticalOrder.filter(contactDisposition => contactDisposition.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.contactDispositionId = this.value
    },

    contactDispositionId (val) {
      if (this.contactDispositionId !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
