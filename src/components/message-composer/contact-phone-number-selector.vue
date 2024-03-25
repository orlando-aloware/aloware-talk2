<template>
  <div>
    <q-select class="inline-select show-caret__always caret__grey-90 q-basic-selector"
              ref="phoneNumberSelector"
              input-debounce="0"
              option-value="id"
              option-label="phone_number"
              behavior="menu"
              v-model="selectedId"
              data-testid="contact-phone-number-selector"
              :use-input="true"
              :options="options"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @popup-show="onShowMenu"
              @focus="onFocusField"
              @blur="onBlurField"
              @input="onInput"
              @filter="filterFn">
      <template v-slot:selected>
        <div class="selected-option-container"
             v-html="getSelectedPhoneLabel()"></div>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label v-html="$options.filters.fixPhone(scope.opt.phone_number)" />
            <q-item-label caption v-html="getPhoneVariableLabels(scope.opt)"></q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-phone-number-selector',
  mixins: [
    selectorMixin
  ],
  computed: {
    ...mapGetters('contacts', ['contactPhoneNumbers', 'contact', 'messageComposer']),
    contactAndPhoneNumbers () {
      return this.contact && this.contactPhoneNumbers
    },
    placeholder () {
      return ''
    },
    contactPhoneNumberOptions () {
      return this.contact.phone_numbers
    }
  },
  data () {
    return {
      selectedId: {},
      isFocused: false,
      options: [],
      reference: 'phoneNumberSelector',
      alterFunction: this.$options.filters.fixPhone,
      isCheckEmit: false,
      textProperty: 'phone_number',
      emitChange: true,
      emitChangeProperty: 'phone_number',
      emitEvent: 'setSelectedPhone',
      fullOptionsProperty: 'contactPhoneNumberOptions'
    }
  },
  methods: {
    onFocusField () {
      this.element.querySelector('.selected-option-container').style.display = 'none'
      this.onFocus()
    },

    onBlurField () {
      this.element.querySelector('.selected-option-container').style.display = 'block'
      this.onBlur()
    },

    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.contactPhoneNumberOptions
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.options = this.contactPhoneNumberOptions.filter(v => v.phone_number && (v.phone_number.toLowerCase().indexOf(needle) > -1 || v.title.toLowerCase().indexOf(needle) > -1))
      })
    },

    getSelectedPhoneLabel () {
      if (_.isEmpty(this.selectedId)) {
        return ''
      }
      const title = (this.selectedId.phone_number === this.contact.phone_number) ? 'Primary' : this.selectedId.title
      const titleText = title && title.length > 0 ? `<i class="fa fa-circle selected-option-separator"></i> <span class="selected-option-title">${title}</span>` : ''
      return `<span class="selected-option">${this.$options.filters.fixPhone(this.selectedId.phone_number)}</span> ${titleText}`
    },
    getOptionLabel (phone) {
      const title = (phone.phone_number === this.contact.phone_number) ? 'Primary' : phone.title
      const titleText = title && title.length > 0 ? `<i class="fa fa-circle selected-option-separator"></i> <span class="selected-option-title">${title}</span>` : ''
      return `<span class="selected-option">${this.$options.filters.fixPhone(phone.phone_number)}</span> ${titleText}`
    },
    getPhoneVariableLabels (phone) {
      const primaryLabel = { data: (phone.phone_number === this.contact.phone_number) ? 'Primary' : '' }

      // show only separator if it has both primary label and phone title
      const separator = phone.title && phone.title.length > 0 && primaryLabel.data && primaryLabel.data.length > 0 ? '<i class="fa fa-circle option-separator"></i>' : ''

      primaryLabel.data = primaryLabel.data && primaryLabel.data.length > 0 ? `${separator} <span class="selected-option-title">${primaryLabel.data}</span>` : ''
      const titleLabel = phone.title && phone.title.length > 0 ? `<span class="custom-option">${phone.title}</span>` : ''

      return `${titleLabel} ${primaryLabel.data}`
    },
    getPhoneObject (phoneNumber) {
      return this.contactPhoneNumbers.find(phone => phone.phone_number === phoneNumber)
    },
    setPhone (phoneNumber) {
      const phone = this.getPhoneObject(phoneNumber)
      if (phone) {
        this.selectedId = phone
      } else {
        if (this.contactPhoneNumbers.length) {
          this.selectedId = this.contactPhoneNumbers[0]
        }
      }
    }
  },
  mounted () {
    this.setPhone(this.contact.phone_number)
    this.options = this.contactPhoneNumberOptions
    this.showInputPlaceholder()
  },
  watch: {
    'contactAndPhoneNumbers': function () {
      const phone = this.getPhoneObject(this.contact.phone_number)
      if (phone) {
        this.selectedId = phone
      }
    },
    'contact.id': function () {
      this.options = this.contactPhoneNumberOptions
      this.selectedId = {}
      this.setPhone(this.contact.phone_number)
      this.showInputPlaceholder()
    },
    selectedId: function () {
      this.showInputPlaceholder()
    }
  }
}
</script>
