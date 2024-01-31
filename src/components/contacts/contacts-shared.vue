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

      <div class="d-flex justify-content-center border-top flex-grow-0 overflow-x-hidden"
         style="min-height: 56px; color:black"
         v-if="paginated">
        <q-pagination class="table-pagination"
                      padding="0 5px"
                      boundary-links
                      direction-links
                      dense
                      :max="lastPage"

                      :ellipses="false"
                      :boundary-numbers="false"
                      v-model="paginationPage"
                      @input="loadFolders"
                      >
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

export const XL_SCREEN_PAGES = 11
export const LG_SCREEN_PAGES = 7
export const DEFAULT_PAGES = 3

export default {

  props: {
    paginated: {
      type: Boolean,
      default: true
    },

    lastPage: {
      type: Number,
      default: 1
    }
  },

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
      paginationPage: 1,
      perPage: 5
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
        const total = response.data.total
        this.lastPage = Math.ceil(total > this.perPage ? Math.ceil(total / this.perPage) : 1)
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

    maxPaginationPages () {
      if (this.$q.screen.xl) {
        return XL_SCREEN_PAGES
      }

      if (this.$q.screen.lg) {
        return LG_SCREEN_PAGES
      }

      return DEFAULT_PAGES
    },

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
    },

    perPage: function () {
      this.$emit('paginated', { page: this.paginationPage, per_page: this.perPage })
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
