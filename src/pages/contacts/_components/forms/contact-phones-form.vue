<template>
  <b-form @submit="onSubmit">
    <b-form-group label="Title">
      <b-form-input
        type="text"
        placeholder="e.g. Wireless"
        ref="title"
        required
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
    ...mapGetters('contacts', ['contact', 'contact_selected_phone'])
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

      if (this.contact_selected_phone) {
        request = talk2Api.V1.contact.updatePhone(this.contact.id, this.contact_selected_phone.id, {
          title: this.phone.title,
          phone_number: this.phone.number,
          is_primary: this.phone.isPrimary
        }).then(response => {
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
    removeSelectedPhone () {
      this.setContactSelectedPhone(null)
    }
  },
  mounted () {
    this.$refs.title.focus()
    if (this.contact_selected_phone) {
      this.phone = {
        id: this.contact_selected_phone.id,
        title: this.contact_selected_phone.title,
        number: this.contact_selected_phone.phone_number,
        isPrimary: this.contact_selected_phone ? this.contact_selected_phone.phone_number === this.contact.phone_number : false
      }
    }
  }
}
</script>

<style scoped>

</style>
