<template>
  <div>
    <q-select class="inline-select q-basic-selector"
              ref="countrySelect"
              use-input
              clearable
              input-debounce="0"
              map-options
              emit-value
              option-value="code"
              option-label="name"
              behavior="menu"
              v-model="contact.cnam_country"
              data-testid="location-country-selector"
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
import _ from 'lodash'
import * as Countries from 'src/constants/countries'
import { selectorMixin } from 'src/plugins/mixins'
export default {
  name: 'location-country-selector',
  mixins: [
    selectorMixin
  ],
  props: {
    contact: {
      type: Object,
      required: false,
      default: () => {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      countries: Countries.COUNTRIES,
      options: Countries.COUNTRIES,
      selectedId: _.get(this.contact, 'cnam_country', null),
      compareProperty: 'code',
      reference: 'countrySelect',
      emitEvent: 'select',
      emitChange: true,
      fullOptionsProperty: 'countries'
    }
  },
  computed: {
    placeholder () {
      return ''
    }
  },
  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.countries
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.countries.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },
  watch: {
    'contact.cnam_country': function (value) {
      this.selectedId = value
      this.showInputPlaceholder()
    }
  }
}
</script>
