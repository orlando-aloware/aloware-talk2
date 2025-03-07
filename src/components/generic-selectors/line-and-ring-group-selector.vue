<template>
  <q-select ref="userSelect"
            class="q-line-and-ring-group-selector"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            style="word-break: break-all;"
            use-input
            dense
            v-model="selected"
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
            <div class="break-all pl-3">{{ scope.opt.name }}</div>
          </q-item-label>

        </q-item-section>
      </q-item>
      <q-item v-if="scope.opt.group"
              v-bind="scope.itemProps"
              v-on="scope.itemEvents">
        <q-item-label header class="text-size-rg text-grey-10">{{ scope.opt.group }}</q-item-label>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'

export default {
  name: 'line-and-ring-group-selector',

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

  data () {
    return {
      selected: this.value,
      options: [],
      selectWidth: 0,
      isFocused: false
    }
  },

  computed: {
    ...mapState(['campaigns', 'ringGroups']),

    campaignsAlphabeticalOrder () {
      if (this.campaigns) {
        return _.clone(this.campaigns).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    },

    placeholder () {
      if (!this.showPlaceholder) {
        return ''
      }

      switch (true) {
        case this.multiple && this.selected.length < 1:
          return this.customPlaceholder || 'Select Lines or Einbox'
        case !this.multiple && !this.selected:
          return this.customPlaceholder || 'Select Line or Einbox'
        case this.multiple && this.selected.length > 0:
        case !this.multiple && this.selected:
        default:
          return this.customPlaceholder
      }
    },

    formattedOptions () {
      const campaignOptions = [...this.sortToAlphabeticalOrder(this.campaigns.map(function (item) { return { ...item, model: 'lines' } }))]

      if (campaignOptions && campaignOptions.length > 0) {
        campaignOptions.unshift({
          group: 'Filter by Line',
          disable: true
        })
      }

      const ringGroupOptions = [...this.sortToAlphabeticalOrder(this.ringGroups.map(function (item) { return { ...item, model: 'ring_groups' } }))]

      if (ringGroupOptions && ringGroupOptions.length > 0) {
        ringGroupOptions.unshift({
          group: 'Filter by Einbox',
          disable: true
        })
      }

      return [...campaignOptions, ...ringGroupOptions]
    }
  },

  created () {
    this.options = this.formattedOptions
  },

  methods: {

    onFocus () {
      this.isFocused = true
      this.$el.querySelector('.q-line-and-ring-group-selector .q-field__input').placeholder = this.selected ? this.selected.name : this.placeholder
      this.$el.querySelector('.q-line-and-ring-group-selector .q-field__input').style.display = 'block'
      if (this.selected) {
        this.$el.querySelector('.q-line-and-ring-group-selector .q-field__native span').style.display = 'none'
      }
    },

    onBlur () {
      this.isFocused = false
      this.$el.querySelector('.q-line-and-ring-group-selector .q-field__input').placeholder = ''
      this.showInputPlaceholder()
      if (this.selected) {
        this.$el.querySelector('.q-line-and-ring-group-selector .q-field__native span').style.display = ''
      }
    },

    showInputPlaceholder () {
      if (!this.selected) {
        this.$el.querySelector('.q-line-and-ring-group-selector .q-field__input').placeholder = this.placeholder
        this.$el.querySelector('.q-line-and-ring-group-selector .q-field__input').style.display = 'block'
      } else {
        this.$el.querySelector('.q-line-and-ring-group-selector .q-field__input').style.display = 'none'
      }
    },

    onInput () {
      this.$el.querySelector('.q-line-and-ring-group-selector .q-field__input').blur()
    },

    onShowMenu () {
      this.selectWidth = this.$refs.userSelect.$el.offsetWidth
    },

    filterFn (val, update) {
      if (this.selected && val === this.selected) {
        update(() => {
          this.options = this.formattedOptions.filter(item => item.id === this.selected)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.formattedOptions
        })
        return
      }

      update(() => {
        this.options = this.formattedOptions.filter((user) =>
          (user.name && user.name.toLowerCase().includes(val.toLowerCase())) ||
          (user.phone_number && user.phone_number.includes(val)) ||
          (user.email && user.email.toLowerCase().includes(val.toLowerCase()))
        )
      })
    },

    sortToAlphabeticalOrder (items) {
      if (items) {
        return _.clone(items).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  watch: {
    value () {
      this.selected = this.value
    },

    selected (val) {
      if (this.selected !== this.value) {
        this.$emit('change', val)
      }
      this.showInputPlaceholder()
    }
  }
}
</script>
