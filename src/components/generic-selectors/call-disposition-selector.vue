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
            bottom-slots
            :use-chips="useChips"
            :use-input="useInput"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            :options="options"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="selectorClass"
            v-model="selectedId"
            @popup-show="onShowMenu"
            @filter="filterFn">
    <template v-slot:prepend
              v-if="prepend">
      <span class="text-size-xs text-grey-80">--{{ prepend }}--</span>
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

    <template v-slot:selected-item="scope">
      <q-chip dense
              class="tag-selected-chip"
              text-color="secondary"
              color="white"
              :tabindex="scope.tabindex">
        <i class="fa fa-circle position-absolute"
           :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`" />
        <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
        <div role="button"
             class="custom__remove d-flex align-items-center position-absolute r-0"
             @click="scope.removeAtIndex(scope.index)">
          <remove-tag-icon class="ml-1 remove-tag-icon" />
        </div>
      </q-chip>
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
import _ from 'lodash'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import { dispositionsOptionsMixin } from 'src/plugins/mixins'

export default {
  name: 'call-disposition-selector',

  components: { RemoveTagIcon },

  mixins: [dispositionsOptionsMixin],

  props: {
    value: {
      required: false,
      default: null
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
      selectWidth: 0,
      type: 'call'
    }
  },

  computed: {
    ...mapState(['callDispositions']),

    placeholder () {
      switch (true) {
        case this.multiple && (!this.selectedId || (this.selectedId && this.selectedId.length < 1)):
          return 'Select Call Dispositions'
        case !this.multiple && !this.callDispositionId:
          return 'Select Call Disposition'
        case this.multiple && this.selectedId && this.selectedId.length > 0:
        case !this.multiple && this.callDispositionId:
        default:
          return ''
      }
    },

    callDispositionId () {
      if (!this.selectedId) {
        return null
      }

      if (this.multiple) {
        return this.selectedId.id
      }

      return this.selectedId
    },

    values () {
      return this.multiple ? _.filter(this.value, (item) => { return !!item }) : this.value
    },

    selectorClass () {
      const prependClass = this.prepend ? 'with-prepend' : ''
      const highlightedClass = this.highlighted ? this.highlightedClass : ''
      const requiredClass = this.required ? 'required mb-0' : ''

      return [
        prependClass,
        highlightedClass,
        requiredClass
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
    this.selectedId = this.multiple ? [] : this.selectedId
    this.getCallDisposition()
  },

  methods: {
    getCallDisposition () {
      if (!_.isEmpty(this.values) && this.multiple) {
        this.selectedId = []
        const callDispId = { data: null }
        for (callDispId.data in this.values) {
          const found = this.orderedDispositions.find(callDispo => callDispo.id === callDispId.data)

          if (found) {
            this.selectedId.push(found)
          }
        }
        return
      }

      if (!_.isEmpty(this.values) && !this.multiple) {
        this.selectedId = this.orderedDispositions.find(callDispo => callDispo.id === this.values)
      }
    },

    onShowMenu () {
      this.selectWidth = this.$refs.callDispositionSelect.$el.offsetWidth
    },

    filterFn (val, update) {
      if (this.callDispositionId && val === this.callDispositionId) {
        update(() => {
          this.options = this.orderedDispositions.filter(script => script.id === this.callDispositionId)
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
        this.options = this.orderedDispositions.filter(script => script.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.getCallDisposition()
      this.selectedId = this.value
    },

    selectedId (val) {
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
