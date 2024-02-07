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

      <div class="paginated q-pa-lg flex flex-center"
           style="min-height: 56px;"
           v-if="paginated">
        <q-pagination class="table-pagination"
                      padding="0 5px"
                      direction-links
                      dense
                      :ellipses="false"
                      :boundary-numbers="false"
                      :max="lastPage"
                      v-model="paginationPage">
        </q-pagination>

      </div>

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
      layer: 1,
      listeners: {},
      paginated: false,
      lastPage: 1,
      paginationPage: 1,
      perPage: 20
    }
  },
  methods: {
    ...mapActions('contacts', [
      'foldersLoaded',
      'createListOpen',
      'setPublicListsLoaded'
    ]),
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
      this.setPublicListsLoaded(false)
      this.lists = []
      talk2Api.V2.contactList.public({
        page: this.paginationPage,
        size: this.perPage
      }).then(response => {
        this.total = response.data.total
        this.lastPage = Math.ceil(this.total > this.perPage ? Math.ceil(this.total / this.perPage) : 1)

        if (this.total > this.perPage) {
          this.paginated = true
        }

        this.lists = response.data.data
      }).catch((err) => {
        console.error(err)
        this.$generalNotification('Unable to load folders please try again.', 'error')
        this.setPublicListsLoaded(true)
        this.isLoading = false
      }).finally(() => {
        this.isLoading = false
        this.setPublicListsLoaded(true)
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
    this.listeners.fetchContactsLists = () => {
      this.loadFolders()
    }
    this.$VueEvent.listen('fetchContactsLists', this.listeners.fetchContactsLists)
  },
  watch: {

    paginationPage: function () {
      this.$emit('paginated', { page: this.paginationPage, per_page: this.perPage })
      this.loadFolders()
    },

    perPage: function () {
      this.$emit('paginated', { page: this.paginationPage, per_page: this.perPage })
      this.loadFolders()
    },

    $route (to) {
      if (to.name !== 'Contacts') {
        this.loadFolders()
      }
    }
  },
  beforeDestroy () {
    this.$VueEvent.stop('fetchContactsLists', this.listeners.fetchContactsLists)
  }
}
</script>
