<template>
  <div class="pinned border-top ">
    <div class="d-flex pinned__content flex-column">
      <div v-if="!computedPublicLists.length && !isLoading"
           class="item-empty">
        <span class="fs-12 text-muted" data-testid="contact-shared-no-public-list-available">
          No public list available
        </span>
      </div>
      <contacts-shared-item v-else
                            v-for="item in computedPublicLists"
                            :data-testid="'contacts-shared-'+item.name.toLowerCase().replace(/ /g, '-')"
                            :item="item"
                            :key="item.id">
      </contacts-shared-item>
      <contacts-sidebar-loader v-if="isLoading" data-testid="contacts-sidebar-loader"></contacts-sidebar-loader>

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
                      data-testid="contacts-shared-pagination"
                      v-model="paginationPage">
        </q-pagination>

      </div>

    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ContactsSharedItem from 'components/contacts/contacts-shared-item'
import ContactsSidebarLoader from 'components/contacts/contacts-sidebar-loader'
import { contactLists } from 'src/plugins/mixins'

export default {

  mixins: [contactLists],
  components: {
    ContactsSidebarLoader,
    ContactsSharedItem
  },
  data () {
    return {
      isCreatingFolder: false,
      isLoading: false,
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
      'setPublicLists',
      'setPublicListsLoaded'
    ]),
    ...mapGetters('contacts', [
      'publicLists'
    ]),
    onCreateFolderToggle () {
      this.isCreatingFolder = !this.isCreatingFolder
    },
    onCreateList () {
      this.createListOpen({
        contact_folder_id: null
      })
    }
  },
  computed: {
    foldersWithoutRoot () {
      return this.computedPublicLists.filter(folder => folder.name !== 'Root')
    },
    rootFolder () {
      return this.computedPublicLists.find(folder => folder.name === 'Root')
    },
    computedPublicLists () {
      return this.$store.getters['contacts/publicLists']
    }
  },
  mounted () {
    this.loadPublicLists()
    this.listeners.fetchContactsLists = () => {
      this.loadPublicLists()
    }
    this.$VueEvent.listen('fetchContactsLists', this.listeners.fetchContactsLists)
  },
  watch: {
    paginationPage () {
      this.$emit('paginated', { page: this.paginationPage, per_page: this.perPage })
      this.loadPublicLists()
    },

    perPage () {
      this.$emit('paginated', { page: this.paginationPage, per_page: this.perPage })
      this.loadPublicLists()
    },

    $route (to) {
      if (to.name !== 'Contacts') {
        this.loadPublicLists()
      }
    }
  },
  beforeDestroy () {
    this.$VueEvent.stop('fetchContactsLists', this.listeners.fetchContactsLists)
  }
}
</script>
