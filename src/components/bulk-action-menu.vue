<template>
  <div class="bulk-action-menu">
    <div class="menu-actions d-flex flex-row">
      <div class="items">
        <span v-if="!isAllContactsSelected">{{ getSelectedCount }} selected</span>
        <span v-else>Selected all {{ selectedList.contactCount | numFormat }} contact from this list</span>
      </div>
      <div class="items" v-if="!isAllContactsSelected && selectedList.contactCount > 25 && forceAllSelection">
        <a href="#" @click="onSetAllContactsSelected" data-testid="bulk-action-menu-select-all-link">
          Select all {{ selectedList.contactCount | numFormat }} contacts from this list
        </a>
      </div>
      <div class="items"
           v-if="false">
        <a href="#" disabled data-testid="bulk-action-menu-enroll-in-sequence-link">
          <i class="fa fa-layer-group"></i>
          Enroll in Sequence
        </a>
      </div>
      <div class="items"
           v-if="false">
        <a href="#" disabled data-testid="bulk-action-menu-power-dialer-link">
          <i class="fa fa-crosshairs"></i>
          Power Dialer
        </a>
      </div>
      <div class="items">
        <a href=""
           data-testid="bulk-action-menu-add-to-static-list-link"
           @click="onAddToStaticList">
          <i class="fa fa-user-plus"></i>
          Add to Static List
        </a>
      </div>
      <div class="items">
        <a href=""
           data-testid="bulk-action-menu-create-static-list-link"
           @click="onCreateStaticList">
          <i class="fa fa-plus"></i>
          Create Static List
        </a>
      </div>
      <div class="items"
           v-if="hasPermissionTo('archive contact')">
        <a href=""
           class="text-danger"
           data-testid="bulk-action-menu-delete-link"
           @click="onDelete">
          <i class="fa fa-trash text-danger"></i>
          Delete
        </a>
      </div>
    </div>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapState } from 'vuex'
import { FROM_BULK_MENU } from 'src/constants/contacts-list-create-mode'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'bulk-action-menu',

  mixins: [
    aclMixin
  ],

  props: {
    id: {
      type: String,
      required: true
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'selectedContacts',
      'selectedList'
    ]),

    ...mapState('contacts', [
      'isAllContactsSelected'
    ]),

    getSelectedCount () {
      return this.selectedContacts[this.id].length || 0
    },

    forceAllSelection () {
      return false
    }
  },

  methods: {
    ...mapActions('contacts', [
      'removeContactOpen',
      'setBulkDelete',
      'createListOpen',
      'selectListOpen',
      'setSelectedStaticList',
      'setAllContactsSelected'
    ]),

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

    onSetAllContactsSelected (e) {
      this.setAllContactsSelected(true)
      this.$emit('onSetAllContactsSelected')
      e.preventDefault()
    }
  }
}
</script>
