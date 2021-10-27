<template>
  <div class="pinned border-top ">
    <div class="pinned__header d-flex align-items-center list--header">
      <div class="header__header__title font-weight-bold flex-grow-1">
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
    <div class="d-flex pinned__content flex-column">
      <div v-if="!lists.length"
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
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import ContactsSharedItem from 'components/contacts/contacts-shared-item'

export default {
  components: {
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
      this.isLoading = false
      talk2Api.V2.contactList.public().then(response => {
        this.lists = response.data.data
      }).catch((err) => {
        console.error(err)
        this.$generalNotification('Unable to load folders please try again.', 'error')
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
