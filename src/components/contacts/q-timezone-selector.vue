<template>
  <div>
    <q-select class="inline-select"
              ref="timezoneSelector"
              use-input
              clearable
              input-debounce="0"
              map-options
              emit-value
              option-value="code"
              option-label="name"
              behavior="menu"
              v-model="timezone"
              data-testid="timezone-selector"
              :options="options"
              :disable="disabled"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @popup-show="onShowMenu"
              @filter="filterFn"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'q-timezone-selector',

  props: {
    value: {
      required: false
    },

    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    ...mapState('cache', ['timezones']),

    placeholder () {
      if (!this.showPlaceholder) {
        return ''
      }

      switch (true) {
        case this.multiple && this.timezone.length < 1:
          return 'Select timezones'
        case !this.multiple && !this.timezone:
          return 'Select timezone'
        case this.multiple && this.timezone.length > 0:
        case !this.multiple && this.timezone:
        default:
          return ''
      }
    }
  },

  data () {
    return {
      timezone: this.value,
      options: [],
      selectWidth: 0
    }
  },

  methods: {
    onShowMenu () {
      this.selectWidth = this.$refs.timezoneSelector.$el.offsetWidth
    },
    onFocus () {
      this.isFocused = true
      this.$el.querySelector('.inline-select .q-field__input').placeholder = this.timezone || 'Select timezone'
      this.$el.querySelector('.inline-select .q-field__native span').style.display = 'none'
    },
    onBlur () {
      this.isFocused = false
      this.$el.querySelector('.inline-select .q-field__input').placeholder = ''
      this.$el.querySelector('.inline-select .q-field__native span').style.display = ''
    },
    onInput (val) {
      this.$el.querySelector('.inline-select .q-field__input').blur()
      this.$emit('select', val)
    },

    filterFn (val, update) {
      if (this.timezone && val === this.timezone) {
        update(() => {
          this.options = this.timezones.filter(item => item === this.timezone)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.timezones
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.timezones.filter(item => item.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  mounted () {
    this.options = this.timezones
  },
  watch: {
    value: function () {
      this.timezone = this.value
    }
  }
}
</script>
