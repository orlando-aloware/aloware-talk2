<template>
  <div class="bulk-action-menu">
    <div class="menu-actions d-flex flex-row">
      <div class="items">
        <span>{{ getSelectedCount }} selected</span>
      </div>
      <div class="items">
        <a disabled>
           <q-tooltip anchor="top middle"
                      self="bottom middle"
                      max-width="150px">
            In development
          </q-tooltip>
          <i class="fa fa-layer-group"></i>
          Enroll in Sequence
        </a>
      </div>
      <div class="items">
        <a href=""
           @click.prevent="onAddToPowerDialer">
          <i class="fa fa-crosshairs"></i>
          Power Dialer
        </a>
      </div>
      <div class="items">
        <a href=""
           @click="onAddToStaticList">
          <i class="fa fa-user-plus"></i>
          Add to Static List
        </a>
      </div>
      <div class="items">
        <a href=""
           @click="onCreateStaticList">
          <i class="fa fa-plus"></i>
          Create Static List
        </a>
      </div>
      <div class="items">
        <a href="" @click="onDelete">
          <i class="fa fa-trash"></i>
          Delete
        </a>
      </div>
    </div>
  </div>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'
import { FROM_BULK_MENU } from 'src/constants/contacts-list-create-mode'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

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
    }
  },
  methods: {
    ...mapActions('contacts', ['removeContactOpen', 'setBulkDelete', 'createListOpen', 'selectListOpen', 'setSelectedStaticList', 'setShouldUpdateSelectedListContactCount']),
    onDelete (e) {
      this.setBulkDelete(true)
      this.$bvModal.show('remove-contact-dialog')
      e.preventDefault()
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
    },
    onAddToPowerDialer (e) {
      const contactIds = this.selectedContacts.all.map(contact => contact.id)
      this.isLoading = true

      return this.$axios
        .post('api/v2/power-dialer-list-items', { contact_ids: contactIds })
        .then(() => {
          this.setShouldUpdateSelectedListContactCount(true)
          this.$router.push(`/power-dialer`)
          this.$generalNotification('Selected contacts were successfully added')
        })
        .catch((err) => {
          const { message, html } = extractErrorMessage(err)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
        .finally(() => {
          this.isLoading = false
        })
    }
  }
}
</script>
