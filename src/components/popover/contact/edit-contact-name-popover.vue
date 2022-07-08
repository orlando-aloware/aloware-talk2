<template>
  <b-popover custom-class="edit-contact-name-popover"
             ref="popover"
             :target="target"
             :triggers="triggers"
             :show.sync="show"
             @show="onShow"
             @shown="onShown"
             @hidden="onHidden">
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
        <b-button type="button" size="sm" variant="light" @click="onClose">Cancel</b-button>
        <b-button type="submit" size="sm" variant="success">Submit</b-button>
      </div>
    </b-form>
  </b-popover>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'edit-contact-name-popover',
  props: {
    target: String,
    triggers: {
      type: String,
      default: 'click'
    },
    custom_class: {
      type: String,
      default: 'contact-edit-popovers'
    },
    left: {
      type: Number,
      default: 0
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact']),
    cssVars () {
      return {
        '--offset-left': this.left
      }
    }
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
    onClose () {
      this.show = false
    },
    onShow () {
      this.selected_contact = this.contact
      // reset form here
    },
    onShown () {
      // Called just after the popover has been shown
      // Transfer focus to the first input
      this.focusRef(this.$refs.first_name)
    },
    onHidden () {
      // Called just after the popover has finished hiding
      // Bring focus back to the button
      // this.focusRef(this.$refs.button)
    },
    onSubmit (e) {
      this.is_busy = true
      this.$axios.patch('/api/v1/contact/' + this.contact.id, {
        first_name: this.selected_contact.first_name,
        last_name: this.selected_contact.last_name
      }).then(response => {
        if (response.data === this.contact.id) {
          this.setContact(response.data)
        }
        this.is_busy = false
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
  .edit-contact-name-popover {
    left: -250px !important;

    .popover .arrow::before, .popover .arrow::after {
      content: none !important;
    }
  }
</style>
