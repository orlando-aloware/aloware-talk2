<template>
  <div>
    <q-select ref="usAreaCodeSelector"
              class="aloware-q-selector"
              options-selected-class="text-primary"
              color="primary"
              option-value="value"
              option-label="value"
              input-debounce="0"
              style="word-break: break-all;"
              use-input
              emit-value
              map-options
              dense
              v-model="model"
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
              <div class="break-all">{{ scope.opt.value }}</div>
            </q-item-label>
            <q-item-label caption>
              <div class="break-all">{{ scope.opt.label }}</div>
            </q-item-label>

          </q-item-section>
        </q-item>
        <q-item v-if="scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-label header class="text-size-xs">{{ scope.opt.state_name }}</q-item-label>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>

import AreaCodes from 'src/us-area-code-state.json'

export default {
  name: 'us-area-code-selector',

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
    }
  },

  computed: {
    placeholder () {
      switch (true) {
        case this.multiple && this.model.length < 1:
          return 'Select Area Codes'
        case !this.multiple && !this.model:
          return 'Select Area Code'
        case this.multiple && this.model.length > 0:
        case !this.multiple && this.model:
        default:
          return ''
      }
    },
    optsArray () {
      const groupedOptions = { data: [] }
      AreaCodes.forEach((value) => {
        groupedOptions.data.push({ state_code: value.state_code, state_name: value.state_name, group: true, disable: true })
        if (value.area_codes.length > 0) {
          groupedOptions.data = [...groupedOptions.data, ...value.area_codes]
        }
      })

      return groupedOptions.data
    },
    areaObject () {
      if (!this.model) {
        return null
      }

      return this.optsArray.find(item => item.value === this.model)
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
          this.options = this.optsArray
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.optsArray.filter((item) => (item.value && item.value.toLowerCase().indexOf(needle) > -1) ||
          (item.label && item.label.toLowerCase().indexOf(needle) > -1))
        // (item.state_code && item.state_code.toLowerCase().indexOf(needle) > -1) ||
        // (item.state_name && item.state_name.toLowerCase().indexOf(needle) > -1) ||
        // this.options = this.formattedOptions.filter((user) =>
        //   (user.name && user.name.toLowerCase().includes(val.toLowerCase())) ||
        //   (user.phone_number && user.phone_number.includes(val)) ||
        //   (user.email && user.email.toLowerCase().includes(val.toLowerCase()))
        // )
      })
    },

    onFocus () {
      this.isFocused = true

      this.$refs.usAreaCodeSelector.$el.querySelector('.aloware-q-selector .q-field__input').placeholder = this.areaObject ? this.areaObject.value : this.placeholder
      this.$refs.usAreaCodeSelector.$el.querySelector('.aloware-q-selector .q-field__input').style.display = 'block'
      if (this.areaObject) {
        this.$refs.usAreaCodeSelector.$el.querySelector('.aloware-q-selector .q-field__native span').style.display = 'none'
      }
    },

    onBlur () {
      this.isFocused = false
      this.$refs.usAreaCodeSelector.$el.querySelector('.aloware-q-selector .q-field__input').placeholder = ''
      this.showInputPlaceholder()
      if (this.areaObject) {
        this.$refs.usAreaCodeSelector.$el.querySelector('.aloware-q-selector .q-field__native span').style.display = ''
      }
    },

    onInput () {
      this.$refs.usAreaCodeSelector.$el.querySelector('.aloware-q-selector .q-field__input').blur()
    },

    showInputPlaceholder () {
      if (!this.areaObject) {
        this.$refs.usAreaCodeSelector.$el.querySelector('.aloware-q-selector .q-field__input').placeholder = this.placeholder
        this.$refs.usAreaCodeSelector.$el.querySelector('.aloware-q-selector .q-field__input').style.display = 'block'
      } else {
        this.$refs.usAreaCodeSelector.$el.querySelector('.aloware-q-selector .q-field__input').style.display = 'none'
      }
    },

    onShowMenu () {
      this.selectWidth = this.$refs.usAreaCodeSelector.$el.offsetWidth
    }
  },

  mounted () {
    this.options = this.optsArray
  },

  watch: {
    value () {
      this.model = this.value
    },

    model (val) {
      this.$emit('select', val)

      this.showInputPlaceholder()
    }
  }
}
</script>
