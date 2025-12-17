<template>
  <b-form @submit.prevent="onSubmit" data-testid="contact-name-form">
    <b-form-group label="First Name">
      <b-form-input
        type="text"
        placeholder="First Name"
        ref="first_name"
        required
        autofocus
        data-testid="contact-first-name-form-input"
        v-model="selected_contact.first_name"
      ></b-form-input>
    </b-form-group>

    <b-form-group label="Last Name">
      <b-form-input
        type="text"
        placeholder="Last Name"
        required
        data-testid="contact-last-name-form-input"
        v-model="selected_contact.last_name"
      ></b-form-input>
    </b-form-group>
    <div class="d-flex justify-content-between">
      <b-button type="button"
                size="sm"
                variant="light"
                data-testid="contact-name-form-cancel-button"
                @click="onCancel">Cancel</b-button>
      <b-button type="button"
                size="sm"
                variant="primary"
                :disabled="is_busy"
                data-testid="contact-name-form-submit-button"
                @click="onSubmit">
        <b-spinner v-if="is_busy"
                   data-testid="contact-name-form-spinner"
                   small label="Small Spinner"
                   type="grow">
        </b-spinner>
        Submit
      </b-button>
    </div>
  </b-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'contact-name-form',
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  data () {
    return {
      show: false,
      is_busy: false,
      selected_contact: {
        first_name: null,
        last_name: null
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact']),
    onSubmit (e) {
      this.is_busy = true
      this.$axios.patch('/api/v1/contact/' + this.contact.id, {
        first_name: this.selected_contact.first_name,
        last_name: this.selected_contact.last_name
      }).then(response => {
        this.$generalNotification('Contact updated.')
        if (response.data.id === this.contact.id) {
          this.setContact(response.data)
        }
        this.$emit('close')
        this.$VueEvent.fire('contact_updated', response.data)
      }).catch(err => {
        this.$handleErrors(err.response)
      }).finally(() => {
        this.is_busy = false
      })

      e.preventDefault()
    },
    onCancel () {
      this.$emit('close')
    }
  },
  mounted () {
    this.selected_contact = {
      first_name: this.contact.first_name,
      last_name: this.contact.last_name
    }

    this.$refs.first_name.focus()
  }
}
</script>
