<template>
  <div class="pinned border-top ">
    <div class="d-flex pinned__content flex-column">
      <div v-if="!lists.length && !isLoading"
           class="item-empty">
        <span class="fs-12 text-muted">
          No public list available
        </span>
      </div>
      <contacts-shared-item v-else
                            v-for="item in lists"
                            :item="item"
                            :key="item.id">
      </contacts-shared-item>
      <contacts-sidebar-loader v-if="isLoading"></contacts-sidebar-loader>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import ContactsSharedItem from 'components/contacts/contacts-shared-item'
import ContactsSidebarLoader from 'components/contacts/contacts-sidebar-loader'

export default {
  components: {
    ContactsSidebarLoader,
    ContactsSharedItem

  },
  data () {
    return {
      isCreatingFolder: false,
      isLoading: false,
      lists: [],
      layer: 1
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
      this.isLoading = true
      talk2Api.V2.contactList.public().then(response => {
        this.lists = response.data.data
      }).catch((err) => {
        console.error(err)
        this.$generalNotification('Unable to load folders please try again.', 'error')
      }).finally(() => {
        this.isLoading = false
      })
    }
  },
  computed: {
    foldersWithoutRoot () {
      return this.lists.filter(folder => folder.name !== 'Root')
    },
    rootFolder () {
      return this.lists.find(folder => folder.name === 'Root')
    }
  },
  mounted () {
    this.loadFolders()
  }
}
</script>
