<template>
  <div class="shared border-top ">
    <div class="folders__header d-flex align-items-center list--header">
      <div class="header__header__title font-weight-bold flex-grow-1 d-flex align-items-center">
        Public Lists
        <q-icon name="info"
                class="material-icons-outlined ml-2 cursor-pointer"
                color="#62666E"
                size="14px">
          <q-tooltip anchor="top middle"
                     self="center middle">
            These are the contact list your admin shares with you.
          </q-tooltip>
        </q-icon>
      </div>
    </div>

    <div class="folders__content"
         :class="[ !folders.length ? 'no-folder' : '' ]">
      <div class="d-flex justify-content-center flex-column h-100">
        <span class="fs-12 text-muted">
          No public list available
        </span>
      </div>
      <template v-if="folders.length">
        <tree-folder
          v-for="folder in folders[0].child_folders"
          :name="folder.name"
          :key="folder.id"
          :id="folder.id"
          :order="folder.order"
          :hasEdit="folders[0].has_edit"
          :hasDelete="folders[0].has_delete"
          :folders="folder.child_folders"
          :lists="folder.lists"
          :layer="0"
        />
        <tree-folder
          :name="folders[0].name"
          :id="folders[0].id"
          :order="folders[0].order"
          :hasEdit="folders[0].has_edit"
          :hasDelete="folders[0].has_delete"
          :isRootList="true"
          :folders="[]"
          :lists="folders[0].lists"
          :layer="0"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import TreeFolder from '../tree/tree-folder.vue'
export default {
  components: {
    TreeFolder
  },
  data () {
    return {
      isCreatingFolder: false,
      isLoading: false,
      folders: []
    }
  },
  methods: {
    ...mapActions('contacts', ['foldersLoaded', 'createListOpen']),
    onCreateFolderToggle () {
      this.isCreatingFolder = !this.isCreatingFolder
    },
    onCreateList () {
      this.createListOpen({
        contact_folder_id: null
      })
    },
    loadFolders () {
      this.isLoading = false
      this.$axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .finally(() => {
          this.isLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    }
  },
  computed: {
    foldersWithoutRoot () {
      return this.folders.filter(folder => folder.name !== 'Root')
    },
    rootFolder () {
      return this.folders.find(folder => folder.name === 'Root')
    }
  },
  mounted () {
    // this.loadFolders()
  }
}
</script>
