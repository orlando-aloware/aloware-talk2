<template>
  <q-select ref="select"
            class="q-basic-selector"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            style="word-break: break-all;"
            use-input
            emit-value
            map-options
            dense
            v-model="selectedId"
            :hide-dropdown-icon="hideDropdownIcon"
            :clearable="clearable"
            :outlined="outlined"
            :borderless="borderless"
            :options="options"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', highlighted ? highlightedClass : '', customClass]"
            :use-chips="useChips"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            @popup-show="onShowMenu"
            @focus="onFocus"
            @blur="onBlur"
            @input="onInput"
            @filter="filterFn">
    <template v-slot:prepend
              v-if="prepend">
      {{prepend}}
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="no-results text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:option="scope">
      <q-item v-if="!scope.opt.group"
              v-bind="scope.itemProps"
              v-on="scope.itemEvents">
        <q-item-section>
          <q-item-label>
            <div class="break-all">{{ scope.opt.name }}</div>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:selected-item="scope"
              v-if="useChips">
      <q-chip dense
              :tabindex="scope.tabindex"
              color="white"
              class="tag-selected-chip"
              text-color="secondary">
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
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'communication-disposition-status-selector',
  mixins: [
    selectorMixin
  ],
  components: { RemoveTagIcon },
  props: {
    value: {
      required: false
    },

    multiple: {
      type: Boolean,
      default: false,
      required: false
    },

    useChips: {
      type: Boolean,
      default: false,
      required: false
    },

    hideExtensions: {
      required: false,
      default: false,
      type: Boolean
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
    borderless: {
      type: Boolean,
      default: false
    },
    showPlaceholder: {
      type: Boolean,
      default: true
    },
    clearable: {
      type: Boolean,
      default: false
    },
    hideDropdownIcon: {
      type: Boolean,
      default: false
    },
    customPlaceholder: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      isFocused: false,
      selectedId: this.value,
      filteredOptions: [],
      reference: 'select',
      fullOptionsProperty: 'options'
    }
  },

  computed: {
    placeholder () {
      if (!this.showPlaceholder) {
        return ''
      }

      switch (true) {
        case this.multiple && this.selectedId && this.selectedId.length < 1:
          return this.customPlaceholder || 'Select Status'
        case !this.multiple && !this.selectedId:
          return this.customPlaceholder || 'Select Status'
        case this.multiple && this.selectedId && this.selectedId.length > 0:
        case !this.multiple && this.selectedId:
        default:
          return ''
      }
    },

    userObject () {
      if (!this.selectedId) {
        return null
      }

      return this.formattedOptions.find(item => item.id === this.selectedId)
    }
  },

  mounted () {
    this.filteredOptions = this.options
  },

  methods: {
    filterFn (val, update) {
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.filteredOptions = this.options.filter(s => s.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.filteredOptions = this.options
        })
        return
      }

      update(() => {
        this.filteredOptions = this.options.filter((s) => s.name && s.name.toLowerCase().includes(val.toLowerCase()))
      })
    }
  },

  watch: {
    value () {
      this.selectedId = this.value
    },

    selectedId (val) {
      if (this.selectedId !== this.value) {
        this.$emit('input', val)
      }

      this.showInputPlaceholder()
    }
  }
}
</script>
