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
                :disabled="is_busy">
        <b-spinner v-if="is_busy"
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
      is_busy: false,
      phone: {
        title: null,
        number: null
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact', 'addContactPhoneNumber', 'setContactSelectedPhone', 'updateContactSelectedPhone']),
    onSubmit (e) {
      this.is_busy = true
      let request = null

      if (this.contact_selected_phone) {
        request = talk2Api.V1.contact.updatePhone(this.contact.id, this.contact_selected_phone.id, {
          title: this.phone.title,
          phone_number: this.phone.number
        }).then(response => {
          this.updateContactSelectedPhone(response.data)
        })
      } else {
        request = talk2Api.V1.contact.storePhone(this.contact.id, {
          title: this.phone.title,
          phone_number: this.phone.number
        }).then(response => {
          this.addContactPhoneNumber(response.data)
        })
      }

      request.catch(err => {
        this.$root.handleErrors(err.response)
      }).then(() => {
        this.removeSelectedPhone()
        this.onClose()
      }).finally(() => {
        this.is_busy = false
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
        number: this.contact_selected_phone.phone_number
      }
    }
  }
}
</script>

<style scoped>
/*is_primary: true*/
/*phone_number: "+18187977544"*/
/*title: "Sample"*/
</style>
