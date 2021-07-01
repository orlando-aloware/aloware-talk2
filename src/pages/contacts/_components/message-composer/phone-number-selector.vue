<template>
  <div>
    <q-select class="inline-select"
              input-debounce="0"
              option-value="id"
              option-label="phone_number"
              behavior="menu"
              v-model="selected_phone"
              :options="contact_phone_numbers">
      <template v-slot:selected>
        <div class="selected-option-container" v-html="getSelectedPhoneLabel()"></div>
      </template>
    </q-select>
  </div>
</template>
s
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'phone-number-selector',
  computed: {
    ...mapGetters('contacts', ['contact_phone_numbers', 'contact'])
  },
  data () {
    return {
      selected_phone: {}
    }
  },
  methods: {
    getSelectedPhoneLabel () {
      let title = (this.selected_phone.phone_number === this.contact.phone_number) ? 'Primary' : this.selected_phone.title
      let titleText = title && title.length > 0 ? `<i class="fa fa-circle selected-option-separator"></i> <span class="selected-option-title">${title}</span>` : ''
      return `<span class="selected-option">${this.$options.filters.fixPhone(this.selected_phone.phone_number)}</span> ${titleText}`
    },
    getPhoneObject (phoneNumber) {
      return this.contact_phone_numbers.find(phone => phone.phone_number === phoneNumber)
    }
  },
  mounted () {
    let phone = this.getPhoneObject(this.contact.phone_number)
    if (phone) {
      this.selected_phone = phone
    }
  },
  watch: {
    'contact': function () {
      let phone = this.getPhoneObject(this.contact.phone_number)
      if (phone) {
        this.selected_phone = phone
      }
    },
    selected_phone: function () {
      this.$emit('setSelectedPhone', this.selected_phone.phone_number)
    }
  }
}
</script>

<style lang="scss" scoped>
 .inline-select{
  padding-top: 10px;
  width: 300px;
 }
</style>
