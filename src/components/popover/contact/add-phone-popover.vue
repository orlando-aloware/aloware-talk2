<template>
  <b-popover ref="popover"
             placement="right"
             custom-class="contact-phone-popover"
             :target="target"
             :triggers="triggers"
             :show.sync="show"
             @show="onShow"
             @shown="onShown"
             @hidden="onHidden">
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
        <b-button type="button" size="sm" variant="light" @click="onClose">Cancel</b-button>
        <b-button type="submit" size="sm" variant="primary">Save</b-button>
      </div>
    </b-form>
  </b-popover>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'add-phone-popover',
  props: {
    target: String,
    triggers: {
      type: String,
      default: 'focus'
    },
    custom_class: {
      type: String,
      default: 'contact-edit-popovers'
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  data () {
    return {
      show: false,
      is_busy: false,
      phone: {
        title: null,
        number: null
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact', 'addContactPhoneNumber']),
    onClose () {
      this.show = false
    },
    onShow () {
      // reset form here
    },
    onShown () {
      // Called just after the popover has been shown
      // Transfer focus to the first input
      this.focusRef(this.$refs.title)
    },
    onHidden () {
      // Called just after the popover has finished hiding
      // Bring focus back to the button
      // this.focusRef(this.$refs.button)
    },
    onSubmit (e) {
      this.is_busy = true
      this.$axios.post(`/api/v1/contact/${this.contact.id}/phone-number`, {
        title: this.phone.title,
        phone_number: this.phone.number
      }).then(response => {
        this.addContactPhoneNumber(response.data)
        this.is_busy = false
        this.$generalNotification('Phone number added')
        this.onClose()
      }).catch(err => {
        this.$handleErrors(err.response)
        this.is_busy = false
      })

      e.preventDefault()
    },
    focusRef (ref) {
      // Some references may be a component, functional component, or plain element
      // This handles that check before focusing, assuming a `focus()` method exists
      // We do this in a double `$nextTick()` to ensure components have
      // updated & popover positioned first
      this.$nextTick(() => {
        this.$nextTick(() => {
          (ref.$el || ref).focus()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .contact-phone-popover {
    left: -340px !important;
    width: 300px;
  }
</style>
