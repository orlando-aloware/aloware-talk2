<template>
  <b-form data-testid="contact-phones-form" @submit.prevent="onSubmit">
    <b-form-group label="Title">
      <b-form-input
        type="text"
        placeholder="e.g. Wireless"
        ref="title"
        autofocus
        data-testid="contact-phones-form-title-input"
        v-model="phone.title">
      </b-form-input>
    </b-form-group>

    <b-form-group :invalid-feedback="invalidPhoneNumber"
                  :state="validPhoneNumber">
      <template #label>
        <span>
          Phone Number
          <b-icon class='ml-2 contact-phones-form-locked-by-integration-info-icon'
                  icon='info-circle'
                  data-testid='contact-phones-form-locked-by-integration-info-icon'
                  style='color: #F3B803;'
                  v-if='phoneCanNotBeEdited(phone)'/>
          <q-tooltip target='.contact-phones-form-locked-by-integration-info-icon'
                     anchor='top middle'
                     self='top middle'
                     data-testid='contact-phones-form-locked-by-integration-info-tooltip'>
          It's not possible to edit phone number which came from integration.
            </q-tooltip>
        </span>
      </template>
      <b-form-input type="text"
                    placeholder="Phone Number"
                    :disabled="phoneCanNotBeEdited(phone)"
                    data-testid="contact-phones-form-phone-number-input"
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
        data-testid="contact-phones-form-make-primary-checkbox"
        :unchecked-value="false">
        <span class="make-primary-label">Make Primary</span>
      </b-form-checkbox>
    </b-form-group>

    <b-form-group v-if="this.contactSelectedPhone"
                  id="input-group-2"
                  class="checkbox-wrapper">
      <b-form-checkbox
        v-model="phone.isOptedOut"
        :value="true"
        :unchecked-value="false"
        data-testid="contact-phones-form-sms-opt-out-checkbox"
        :disabled="this.contactSelectedPhone.is_opted_out">
        <span class="make-primary-label">SMS Opt-Out</span>
        <b-icon
          class="ml-2 info-icon"
          icon="exclamation-circle-fill"
          data-testid="contact-phones-form-sms-opt-out-info-icon"
          variant="dark" />
        <q-tooltip target=".info-icon" anchor="top middle" self="top middle" data-testid="cant-uncheck-it-tooltip">
          Once the phone number is opted out, you can't uncheck it.
        </q-tooltip>
      </b-form-checkbox>
    </b-form-group>

    <div class="d-flex justify-content-between">
      <b-button
                type="button"
                size="sm"
                variant="light"
                data-testid="contact-phones-form-cancel-button"
                @click="onClose">
                Cancel
      </b-button>
      <b-button type="button"
                size="sm"
                variant="primary"
                :disabled="isBusy || !validPhoneNumber || !phone.number || phone.number.length < 1"
                data-testid="contact-phones-form-save-button"
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
import _ from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'contact-phones-form',

  computed: {
    ...mapGetters('contacts', ['contact', 'contactSelectedPhone']),
    ...mapState('cache', ['currentCompany']),
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
    phoneCanNotBeEdited (phone) {
      return this.currentCompany.activate_multi_entity ? phone.hasExternalData : false
    },
    onClose () {
      this.removeSelectedPhone()
      this.$emit('close')
    },
    getContact () {
      const contactId = _.get(this.contact, 'id', null)

      if (!contactId) {
        console.log('Failed to fetch contact: Missing contact id!')
        return
      }

      talk2Api.V2.contacts.get(contactId).then(response => {
        if (response.data.id === contactId) {
          this.setContact(response.data)
        }
      })
    },
    removeSelectedPhone () {
      this.setContactSelectedPhone(null)
    },
    handleUpdate () {
      return talk2Api.V1.contact.updatePhone(this.contact.id, this.phone.id, {
        title: this.phone.title,
        phone_number: this.phone.number,
        is_primary: this.phone.isPrimary,
        is_opted_out: this.phone.isOptedOut
      }).then(response => {
        this.getContact()
        this.updateContactSelectedPhone(response.data)
        this.removeSelectedPhone()
        this.onClose()
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
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
        this.$generalNotification('Phone number added')
        this.removeSelectedPhone()
        this.onClose()
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
      }).finally(() => {
        this.isBusy = false
      })
    }
  }
}
</script>
