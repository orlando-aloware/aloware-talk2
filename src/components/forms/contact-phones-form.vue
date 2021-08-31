<template>
  <b-form @submit.prevent="onSubmit">
    <b-form-group label="Title">
      <b-form-input
        type="text"
        placeholder="e.g. Wireless"
        ref="title"
        autofocus
        v-model="phone.title">
      </b-form-input>
    </b-form-group>

    <b-form-group label="Phone Number"
                  :invalid-feedback="invalidPhoneNumber"
                  :state="validPhoneNumber">
      <b-form-input type="text"
                    placeholder="Phone Number"
                    v-model="phone.number"
                    required>
      </b-form-input>
    </b-form-group>

    <b-form-group v-if="this.contactSelectedPhone && this.contactSelectedPhone.phone_number !== contact.phone_number"
                  id="input-group-2"
                  class="checkbox-wrapper">
      <b-form-checkbox
        v-model="phone.isPrimary"
        :value="true"
        :unchecked-value="false">
        <span class="make-primary-label">Make Primary</span>
      </b-form-checkbox>
    </b-form-group>

    <div class="d-flex justify-content-between">
      <b-button type="button" size="sm" variant="light" @click="onClose">Cancel</b-button>
      <b-button type="button"
                size="sm"
                variant="primary"
                :disabled="isBusy || !validPhoneNumber || !phone.number || phone.number.length < 1"
                @click="onSubmit">
        <b-spinner v-if="isBusy"
                   small label="Small Spinner"
                   type="grow">
        </b-spinner>
        Save
      </b-button>
    </div>
  </b-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'contact-phones-form',

  computed: {
    ...mapGetters('contacts', ['contact', 'contactSelectedPhone']),
    validPhoneNumber () {
      return this.$options.filters.fixPhone(this.phone.number) !== false
    },
    invalidPhoneNumber () {
      return 'Please enter a valid phone number'
    }
  },

  props: {
    phone: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data () {
    return {
      isBusy: false
    }
  },

  methods: {
    ...mapActions('contacts', ['setContact', 'addContactPhoneNumber', 'setContactSelectedPhone', 'updateContactSelectedPhone']),
    onSubmit (e) {
      this.isBusy = true
      if (this.phone.id) {
        this.handleUpdate()
      } else {
        this.handleCreate()
      }
      e.preventDefault()
    },
    onClose () {
      this.removeSelectedPhone()
      this.$emit('close')
    },
    getContact () {
      talk2Api.V1.contact.get(this.contact.id).then(response => {
        this.setContact(response.data)
      })
    },
    removeSelectedPhone () {
      this.setContactSelectedPhone(null)
    },
    handleUpdate () {
      return talk2Api.V1.contact.updatePhone(this.contact.id, this.phone.id, {
        title: this.phone.title,
        phone_number: this.phone.number,
        is_primary: this.phone.isPrimary
      }).then(response => {
        this.getContact()
        this.updateContactSelectedPhone(response.data)
        this.removeSelectedPhone()
        this.onClose()
      }).catch(err => {
        console.log(err)
        this.$q.notify({
          message: 'Error while updating phone number.',
          type: 'negative',
          textColor: 'white',
          position: 'bottom-right'
        })
      }).finally(() => {
        this.isBusy = false
      })
    },
    handleCreate () {
      return talk2Api.V1.contact.storePhone(this.contact.id, {
        title: this.phone.title,
        phone_number: this.phone.number
      }).then(response => {
        this.addContactPhoneNumber(response.data)
        this.removeSelectedPhone()
        this.onClose()
      }).catch(err => {
        console.log(err)
        this.$q.notify({
          message: 'Error while creating phone number.',
          type: 'negative',
          textColor: 'white',
          position: 'bottom-right'
        })
      }).finally(() => {
        this.isBusy = false
      })
    }
  }
}
</script>
