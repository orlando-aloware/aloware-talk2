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
import { FROM_BULK_MENU } from 'src/constants/contacts-list-create-mode'

export default {
  name: 'bulk-action-menu',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters('contacts', ['selectedContacts']),
    getSelectedCount () {
      return this.selectedContacts[this.id].length || 0
    },
    selectedContactIds () {
      return this.selectedContacts[this.id].map(contact => contact.id)
    },
    isMyQueue () {
      return this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter'
    }
  },
  methods: {
    ...mapActions('contacts', [
      'removeContactOpen',
      'setBulkDelete',
      'createListOpen',
      'selectListOpen',
      'setSelectedStaticList'
    ]),
    ...mapActions('powerDialer', [
      'moveContactItems'
    ]),
    onDelete (e) {
      console.log('Deleting items...')
      this.setBulkDelete(true)
      this.$bvModal.show('remove-contact-dialog')
      e.preventDefault()
    },
    async onMoveToTop () {
      console.log('Moving to top...')
      await this.onMoveContacts('top')
    },
    async onMoveToBottom () {
      console.log('Moving to bottom...')
      await this.onMoveContacts('bottom')
    },
    async onMoveContacts (direction = 'top') {
      let res = await this.moveContactItems({
        id: this.isMyQueue ? 'my-queue' : this.id,
        params: {
          contact_ids: this.selectedContactIds,
          direction: direction === 'top' ? 1 : 2
        }
      })

      this.$generalNotification(
        res?.data ? `Successfully moved contacts to ${direction}.` : 'Unable to move contact items!',
        res?.data ? 'success' : 'error'
      )
    },
    onCreateStaticList (e) {
      this.createListOpen({
        type: 1,
        mode: FROM_BULK_MENU,
        contact_folder_id: null
      })
      e.preventDefault()
    },
    onAddToStaticList (e) {
      this.selectListOpen({
        contact_folder_id: null
      })
      this.setSelectedStaticList({ id: null, name: '', type: null })
      e.preventDefault()
    }
  }
}
</script>
