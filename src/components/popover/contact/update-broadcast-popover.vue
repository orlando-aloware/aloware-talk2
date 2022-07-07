<template>
  <b-popover ref="popover"
             placement="right"
             :custom-class="custom_class"
             :target="target"
             :triggers="triggers"
             :show.sync="show"
             @show="onShow"
             @shown="onShown"
             @hidden="onHidden">
    <b-form @submit="onSubmit">
      <h6>Tags</h6>
      <q-select
        compact
        outlined
        use-chips
        multiple
        style="width: 250px;"
        v-model="tags"
        :options="options"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <div class="d-flex justify-content-between">
        <b-button type="button" size="sm" variant="light" @click="onClose">Cancel</b-button>
        <b-button type="submit" size="sm" variant="success">Save</b-button>
      </div>
    </b-form>
  </b-popover>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'add-tag-popover',
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
      },
      tags: [],
      options: ['Google', 'Facebook', 'Twitter', 'Apple', 'Oracle']
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

</style>
