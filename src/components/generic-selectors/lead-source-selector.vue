<template>
  <q-select ref="leadSourceSelect"
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
            data-testid="lead-source-selector"
            :hide-dropdown-icon="hideDropdownIcon"
            :clearable="clearable"
            :outlined="outlined"
            :borderless="borderless"
            :options="availableOptions"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', specificClass ? specificClass : '' ]"
            :use-chips="useChips"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            @popup-show="onShowMenu"
            @focus="onFocus"
            @blur="onBlur"
            @input="onInput"
            @filter="filterFn">
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'lead-source-selector',
  mixins: [
    selectorMixin
  ],
  props: {
    value: {
      required: false
    },

    useChips: {
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

    specificClass: {
      type: String,
      required: false
    },

    outlined: {
      type: Boolean,
      default: true
    },

    borderless: {
      type: Boolean,
      default: false
    },

    clearable: {
      type: Boolean,
      default: false
    },

    hideDropdownIcon: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      isFocused: false,
      selectedId: this.value,
      availableOptions: [],
      reference: 'leadSourceSelect',
      fullOptionsProperty: 'options'
    }
  },

  computed: {
    ...mapState(['leadSources']),

    options () {
      return this.leadSources
    },

    placeholder () {
      return !this.selectedId ? 'Select Lead Source' : ''
    }
  },

  mounted () {
    this.availableOptions = this.options
  },

  methods: {
    filterFn (val, update) {
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.availableOptions = this.options.filter(source => source.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.availableOptions = this.options
        })
        return
      }

      update(() => {
        this.availableOptions = this.options.filter(source => source.name.toLowerCase().includes(val.toLowerCase()))
      })
    }
  },

  watch: {
    value () {
      this.selectedId = this.value
    },

    selectedId (val) {
      if (this.selectedId !== this.value) {
        this.$emit('change', this.selectedObject.name)
      }

      this.showInputPlaceholder()
    }
  }
}
</script>
