<template>
  <div class="bulk-action-menu">
    <div class="menu-actions d-flex justify-content-around">
      <span>{{ getSelectedCount }} selected</span>
      <a href="#" :disabled="true">
        <i class="fa fa-layer-group"></i>
        Enroll in Sequence
      </a>
      <a href="#" :disabled="true">
        <i class="fa fa-crosshairs"></i>
        Power Dialer
      </a>
      <a href=""
         @click="onAddToStaticList">
        <i class="fa fa-user-plus"></i>
        Add to Static List
      </a>
      <a href=""
         @click="onCreateStaticList">
        <i class="fa fa-plus"></i>
        Create Static List
      </a>
      <a href="" @click="onDelete">
        <i class="fa fa-trash"></i>
        Delete
      </a>
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
    }
  },
  methods: {
    ...mapActions('contacts', ['removeContactOpen', 'setBulkDelete', 'createListOpen', 'selectListOpen', 'setSelectedStaticList']),
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
    }
  }
}
</script>

<style scoped lang="scss">
  .bulk-action-menu{
    margin-left: 34px;
    margin-top: 49px;
    position: absolute;
    z-index: 9;
    background: white;
    height: 35px !important;
    padding: 8px 10px;
    width: 95% !important;
  }
  .menu-actions a{
    text-decoration: none;
    font-weight: 500;
    .fa {
      color: #6F6F6F;
    }
    svg{
      margin-top: -5px;
    }
  }
  .menu-actions{
    font-size: 0.75rem;
  }
</style>
