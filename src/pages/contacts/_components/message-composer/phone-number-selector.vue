<template>
  <div>
    <q-select class="inline-select show-caret__always caret__grey-90"
              input-debounce="0"
              option-value="id"
              option-label="phone_number"
              behavior="menu"
              v-model="selectedPhone"
              :options="contactPhoneNumbers"
              @input="onPhoneChange">
      <template v-slot:selected>
        <div class="selected-option-container" v-html="getSelectedPhoneLabel()"></div>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
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
  name: 'phone-number-selector',
  computed: {
    ...mapGetters('contacts', ['contactPhoneNumbers', 'contact', 'messageComposer'])
  },
  data () {
    return {
      selectedPhone: {}
    }
  },
  methods: {
    getSelectedPhoneLabel () {
      let title = (this.selectedPhone.phone_number === this.contact.phone_number) ? 'Primary' : this.selectedPhone.title
      let titleText = title && title.length > 0 ? `<i class="fa fa-circle selected-option-separator"></i> <span class="selected-option-title">${title}</span>` : ''
      return `<span class="selected-option">${this.$options.filters.fixPhone(this.selectedPhone.phone_number)}</span> ${titleText}`
    },

    getOptionLabel (phone) {
      let title = (phone.phone_number === this.contact.phone_number) ? 'Primary' : phone.title
      let titleText = title && title.length > 0 ? `<i class="fa fa-circle selected-option-separator"></i> <span class="selected-option-title">${title}</span>` : ''
      return `<span class="selected-option">${this.$options.filters.fixPhone(phone.phone_number)}</span> ${titleText}`
    },
    getPhoneVariableLabels (phone) {
      let title = (phone.phone_number === this.contact.phone_number) ? 'Primary' : ''

      let separator = (phone.title && phone.title.length > 0) && title && title.length > 0 ? '<i class="fa fa-circle option-separator"></i>' : ''

      let titleText = title && title.length > 0 ? `${separator} <span class="selected-option-title">${title}</span>` : ''
      return `<span class="custom-option">${phone.title}</span> ${titleText}`
    },
    getPhoneObject (phoneNumber) {
      return this.contactPhoneNumbers.find(phone => phone.phone_number === phoneNumber)
    },
    setPhone (phoneNumber) {
      let phone = this.getPhoneObject(phoneNumber)
      if (phone) {
        this.selectedPhone = phone
      }
    },
    onPhoneChange (phone) {
      this.$emit('setSelectedPhone', phone.phone_number)
    }
  },
  mounted () {
    this.setPhone(this.contact.phone_number)
  },
  watch: {
    'contact': function () {
      let phone = this.getPhoneObject(this.contact.phone_number)
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

<style lang="scss" scoped>
 .inline-select{
  padding-top: 10px;
  //width: 300px;
 }
</style>
