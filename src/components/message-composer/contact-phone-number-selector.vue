<template>
  <div>
    <q-select class="inline-select show-caret__always caret__grey-90"
              ref="phoneNumberSelector"
              input-debounce="0"
              option-value="id"
              option-label="phone_number"
              behavior="menu"
              v-model="selectedPhone"
              :options="contactPhoneNumbers"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @popup-show="onShowMenu"
              @input="onPhoneChange">
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

export default {
  name: 'contact-phone-number-selector',
  computed: {
    ...mapGetters('contacts', ['contactPhoneNumbers', 'contact', 'messageComposer']),
    contactAndPhoneNumbers () {
      return this.contact && this.contactPhoneNumbers
    }
  },
  data () {
    return {
      selectedPhone: {},
      isFocused: false,
      selectWidth: 0
    }
  },
  methods: {
    onShowMenu () {
      this.selectWidth = this.$refs.phoneNumberSelector.$el.offsetWidth
    },
    getSelectedPhoneLabel () {
      const title = (this.selectedPhone.phone_number === this.contact.phone_number) ? 'Primary' : this.selectedPhone.title
      const titleText = title && title.length > 0 ? `<i class="fa fa-circle selected-option-separator"></i> <span class="selected-option-title">${title}</span>` : ''
      return `<span class="selected-option">${this.$options.filters.fixPhone(this.selectedPhone.phone_number)}</span> ${titleText}`
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
        this.selectedPhone = phone
      } else {
        if (this.contactPhoneNumbers.length) {
          this.selectedPhone = this.contactPhoneNumbers[0]
        }
      }
    },
    onPhoneChange (phone) {
      if (phone) {
        this.$emit('setSelectedPhone', phone.phone_number)
      }
    }
  },
  mounted () {
    this.setPhone(this.contact.phone_number)
  },
  watch: {
    'contactAndPhoneNumbers': function () {
      const phone = this.getPhoneObject(this.contact.phone_number)
      if (phone) {
        this.selectedPhone = phone
      }
    },
    'messageComposer.sms.phone_number': function (phone) {
      if (phone !== this.selectedPhone.phone_number) {
        this.setPhone(phone)
      }
    }
  }
}
</script>
