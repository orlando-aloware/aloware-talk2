<template>
  <q-select ref="callDispositionSelect"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            style="word-break: break-all;"
            emit-value
            map-options
            outlined
            dense
            :use-chips="useChips"
            :use-input="useInput"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            :options="callDispositionsOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '', highlighted ? highlightedClass : '' ]"
            v-model="callDisposition"
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

    <template v-slot:selected-item="scope">
      <q-chip
        dense
        :tabindex="scope.tabindex"
        color="white"
        class="tag-selected-chip"
        text-color="secondary"
      >
        <i class="fa fa-circle position-absolute"
           :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`"></i>
        <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
        <div role="button" class="custom__remove d-flex align-items-center position-absolute r-0"
             @click="scope.removeAtIndex(scope.index)">
          <remove-tag-icon class="ml-1 remove-tag-icon">
          </remove-tag-icon>
        </div>
      </q-chip>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'

export default {
  name: 'call-disposition-selector',
  components: { RemoveTagIcon },
  props: {
    value: {
      required: false,
      default: () => { return [] }
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
    highlighted: {
      type: Boolean,
      default: false
    },
    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    },
    useChips: {
      type: Boolean,
      default: false
    },
    useInput: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      callDisposition: null,
      callDispositionsOptions: [],
      selectWidth: 0
    }
  },

  computed: {
    ...mapState(['callDispositions']),

    placeholder () {
      switch (true) {
        case this.multiple && (!this.callDisposition || (this.callDisposition && this.callDisposition.length < 1)):
          return 'Select Call Dispositions'
        case !this.multiple && !this.callDispositionId:
          return 'Select Call Disposition'
        case this.multiple && this.callDisposition && this.callDisposition.length > 0:
        case !this.multiple && this.callDispositionId:
        default:
          return ''
      }
    },

    callDispositionsAlphabeticalOrder () {
      if (this.callDispositions) {
        let callDispositions = _.clone(this.callDispositions)
        return callDispositions.sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    },

    callDispositionId () {
      if (!this.callDisposition) {
        return null
      }

      if (this.multiple) {
        return this.callDisposition.id
      }

      return this.callDisposition
    },

    values () {
      return this.multiple ? _.reject(this.value, _.isEmpty) : this.value
    }
  },

  created () {
    this.callDispositionsOptions = this.callDispositionsAlphabeticalOrder
    this.callDisposition = this.multiple ? [] : this.callDisposition
    this.getCallDisposition()
  },

  methods: {
    getCallDisposition () {
      if (!_.isEmpty(this.values) && this.multiple) {
        this.callDisposition = []
        for (let callDispId in this.values) {
          let found = this.callDispositionsAlphabeticalOrder.find(callDispo => callDispo.id === callDispId)
          this.callDisposition.push(found)
        }
        return
      }

      if (!_.isEmpty(this.values) && !this.multiple) {
        let found = this.callDispositionsAlphabeticalOrder.find(callDispo => callDispo.id === this.values)
        this.callDisposition = found
      }
    },

    onShowMenu () {
      this.selectWidth = this.$refs.callDispositionSelect.$el.offsetWidth
    },

    filterFn (val, update) {
      if (this.callDispositionId && val === this.callDispositionId) {
        update(() => {
          this.callDispositionsOptions = this.callDispositionsAlphabeticalOrder.filter(script => script.id === this.callDispositionId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.callDispositionsOptions = this.callDispositionsAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.callDispositionsOptions = this.callDispositionsAlphabeticalOrder.filter(script => script.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.getCallDisposition()
    },

    callDisposition (val) {
      if (!this.multiple && val !== this.values) {
        this.$emit('change', val)
        return
      }

      if (this.multiple && !_.isEqual(val, this.values)) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
