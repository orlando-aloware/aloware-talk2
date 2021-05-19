<template>
  <div class="row mx-0 overflow-auto">
    <div class="col-lg-2 px-0 pl-lg-2 pr-lg-3 mb-3">
      <contacts-sidebar></contacts-sidebar>
    </div>
    <div class="col-lg-10 px-0 pr-lg-3 mb-3 main">
      <router-view></router-view>
    </div>
    <remove-folder-dialog />
    <remove-list-dialog />
    <contacts-filters />
    <column-headers />
  </div>
</template>

<script>
import ContactsSidebar from 'src/pages/contacts/_components/contacts-sidebar.vue'
import RemoveListDialog from 'src/pages/contacts/_components/remove-list.vue'
import RemoveFolderDialog from 'src/pages/contacts/_components/remove-folder.vue'
import ContactsFilters from 'src/pages/contacts/_components/contacts-filters.vue'
import ColumnHeaders from './_components/column-headers.vue'

export default {
  name: 'Contacts',
  components: {
    ContactsSidebar,
    RemoveListDialog,
    RemoveFolderDialog,
    ContactsFilters,
    ColumnHeaders
  }
}
</script>
