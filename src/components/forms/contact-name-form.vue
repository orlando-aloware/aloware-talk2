<template>
  <b-form @submit="onSubmit">
    <b-form-group label="First Name">
      <b-form-input
        type="text"
        placeholder="First Name"
        ref="first_name"
        required
        v-model="selected_contact.first_name"
      ></b-form-input>
    </b-form-group>

    <b-form-group label="Last Name">
      <b-form-input
        type="text"
        placeholder="Last Name"
        required
        v-model="selected_contact.last_name"
      ></b-form-input>
    </b-form-group>
    <div class="d-flex justify-content-between">
      <b-button type="button"
                size="sm"
                variant="light"
                @click="onCancel">Cancel</b-button>
      <b-button type="submit"
                size="sm"
                variant="primary"
                :disabled="is_busy">
        <b-spinner v-if="is_busy"
                   small label="Small Spinner"
                   type="grow"></b-spinner>
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
      window.axios.patch('/api/v1/contact/' + this.contact.id, {
        first_name: this.selected_contact.first_name,
        last_name: this.selected_contact.last_name
      }).then(response => {
        this.setContact(response.data)
        this.$emit('close')
      }).catch(err => {
        this.$root.handleErrors(err.response)
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

<style scoped>

</style>
