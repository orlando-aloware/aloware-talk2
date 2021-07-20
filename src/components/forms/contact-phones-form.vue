<template>
  <b-form @submit="onSubmit">
    <b-form-group label="Title">
      <b-form-input
        type="text"
        placeholder="e.g. Wireless"
        ref="title"
        v-model="phone.title"
      ></b-form-input>
    </b-form-group>

    <b-form-group label="Phone Number">
      <b-form-input
        type="text"
        placeholder="Phone Number"
        required
        v-model="phone.number"
      ></b-form-input>
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
      <b-button type="button" size="sm" variant="light" v-on:click="onClose">Cancel</b-button>
      <b-button type="submit"
                size="sm"
                variant="primary"
                :disabled="isBusy">
        <b-spinner v-if="isBusy"
                   small label="Small Spinner"
                   type="grow"></b-spinner>
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
    ...mapGetters('contacts', ['contact', 'contactSelectedPhone'])
  },
  data () {
    return {
      isBusy: false,
      phone: {
        title: null,
        number: null,
        isPrimary: false
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact', 'addContactPhoneNumber', 'setContactSelectedPhone', 'updateContactSelectedPhone']),
    onSubmit (e) {
      this.isBusy = true
      let request = null

      if (this.contactSelectedPhone) {
        request = talk2Api.V1.contact.updatePhone(this.contact.id, this.contactSelectedPhone.id, {
          title: this.phone.title,
          phone_number: this.phone.number,
          is_primary: this.phone.isPrimary
        }).then(response => {
          this.getContact()
          this.updateContactSelectedPhone(response.data)
          this.removeSelectedPhone()
          this.onClose()
        })
      } else {
        request = talk2Api.V1.contact.storePhone(this.contact.id, {
          title: this.phone.title,
          phone_number: this.phone.number
        }).then(response => {
          this.addContactPhoneNumber(response.data)
          this.removeSelectedPhone()
          this.onClose()
        })
      }

      request.catch(err => {
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
    }
  },
  mounted () {
    this.$refs.title.focus()
    if (this.contactSelectedPhone) {
      this.phone = {
        id: this.contactSelectedPhone.id,
        title: this.contactSelectedPhone.title,
        number: this.contactSelectedPhone.phone_number,
        isPrimary: this.contactSelectedPhone ? this.contactSelectedPhone.phone_number === this.contact.phone_number : false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .make-primary-label {
    display: inline-block;
    margin-top: 1px;
    cursor: pointer;
  }
</style>
