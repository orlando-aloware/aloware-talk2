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
        <div
          @click="onDelete">
          <i class="fa fa-trash"></i>
          Delete
        </div>
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
    ...mapGetters('powerDialer', ['selectedContacts']),
    getSelectedCount () {
      return this.selectedContacts[this.id].length || 0
    }
  },
  methods: {
    ...mapActions('powerDialer', ['removeContactOpen', 'setBulkDelete', 'createListOpen', 'selectListOpen', 'setSelectedStaticList']),
    onDelete (e) {
      console.log('Deleting items...')
      // this.setBulkDelete(true)
      // this.$bvModal.show('remove-contact-dialog')
      // e.preventDefault()
    },
    onMoveToTop () {
      console.log('Moving to top...')
    },
    onMoveToBottom () {
      console.log('Moving to bottom...')
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
