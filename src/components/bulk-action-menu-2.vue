<template>
  <div class="bulk-action-menu bulk-action-menu__power-dialer">
    <div class="menu-actions d-flex flex-row">
      <div class="items">
        <span>{{ getSelectedCount }} selected</span>
      </div>
      <div class="items">
        <div
          @click="onMoveToTop"
          class="cursor-pointer">
          <i class="fa fa-chevron-up"></i>
          Move to Top
        </div>
      </div>
      <div class="items">
        <div
          @click="onMoveToBottom"
          class="cursor-pointer">
          <i class="fa fa-chevron-down"></i>
          Move to Bottom
        </div>
      </div>
      <div class="items">
        <a
          href=""
          @click="onDelete">
          <i class="fa fa-trash text-primary"></i>
          Delete
        </a>
      </div>
    </div>
  </div>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'
import { MOVE_CONTACTS_DIRECTION } from 'src/constants/power-dialer/power-dialer'

export default {
  name: 'bulk-action-menu',
  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },
  computed: {
    ...mapGetters('contacts', ['selectedContacts']),
    ...mapGetters('powerDialer', ['myQueue']),
    getSelectedCount () {
      return this.selectedContacts[this.id].length || 0
    },
    selectedContactIds () {
      return this.selectedContacts[this.id].map(contact => contact.contact_list_item_id)
    },
    isMyQueue () {
      return this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter'
    }
  },
  methods: {
    ...mapActions('contacts', [
      'setBulkDelete',
      'setListSelectedContacts'
    ]),
    ...mapActions('powerDialer', [
      'moveContactItems'
    ]),
    onDelete (e) {
      this.setBulkDelete(true)
      this.$bvModal.show('remove-contact-dialog')
      e.preventDefault()
    },
    async onMoveToTop () {
      await this.onMoveContacts(MOVE_CONTACTS_DIRECTION.top)
    },
    async onMoveToBottom () {
      await this.onMoveContacts(MOVE_CONTACTS_DIRECTION.bottom)
    },
    async onMoveContacts (direction = MOVE_CONTACTS_DIRECTION.top) {
      const res = await this.moveContactItems({
        id: this.isMyQueue ? this.myQueue.id : this.id,
        params: {
          // contact_ids: this.selectedContactIds,
          contact_list_item_ids: this.selectedContactIds,
          direction: direction
        }
      })
      this.setListSelectedContacts({ id: this.id, contacts: [] })

      if (res.data?.message) {
        this.$VueEvent.fire('clearContacts')
        this.$emit('moved-contacts', true)
      }
      this.$generalNotification(
        res?.data?.message || 'Error in moving contact list items.',
        res?.data ? 'success' : 'error'
      )
    }
  }
}
</script>
