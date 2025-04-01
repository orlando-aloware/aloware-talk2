<template>
  <b-modal title="Select A List"
           size="lg"
           modal-class="select-list-modal"
           scrollable
           centered
           hide-footer
           hide-header
           no-close-on-esc
           v-model="isOpen">
    <b-overlay spinner-variant="primary"
               spinner-type="grow"
               spinner-small
               rounded="sm"
               :show="isLoading">
      <div class="d-flex flex-column select-list-modal__body position-relative">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1 select-list-modal__title">{{ getTitle }}</div>
          <button class="btn btn-link small text-muted select-list-modal__close"
                  @click="onClose">
            <i class="fa fa-times"/>
          </button>
        </div>
        <div class="pt-3">
          <b-form-row>
            <b-col md="10">
              <search placeholder="Search static list..."
                      searchOnKeyup
                      @search="onSearch"/>
            </b-col>
            <b-col md="2">
              <b-form-group>
                <b-button variant="primary"
                          size="sm"
                          block
                          :disabled="isLoading || !selectedStaticList.id"
                          @click="onSubmit">
                  Add to
                </b-button>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>
          <div class="tree-container">
            <select-list-tree-folder class="select-list-tree-folder"
                                     name="Public Lists"
                                     key="publicLists"
                                     :layer="0"
                                     :order="0"
                                     :has-edit="1"
                                     :has-delete="0"
                                     :folders="null"
                                     :lists="publicLists"
                                     :has-more="hasMorePublic"
                                     :is-loading-more="isLoadingMorePublic"
                                     :type="1"
                                     @load-more="loadMorePublic"
            />
          </div>
          <div class="tree-container">
            <select-list-tree-folder class="select-list-tree-folder"
                                     name="My Lists"
                                     :layer="0"
                                     :id="folder.id"
                                     :key="folder.id"
                                     :order="folder.order"
                                     :hasEdit="folder.has_edit"
                                     :hasDelete="folder.has_delete"
                                     :folders="folder.child_folders"
                                     :lists="privateLists"
                                     :has-more="hasMorePrivate"
                                     :is-loading-more="isLoadingMorePrivate"
                                     :type="1"
                                     @load-more="loadMorePrivate"
                                     v-for="folder in folders"/>
          </div>
      </div>
    </b-overlay>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import SelectListTreeFolder from 'src/components/select-list-tree-folder/select-list-tree-folder'
import Search from 'src/components/search'
import { chunk, isEmpty } from 'lodash'
import talk2Api from 'src/plugins/api/api'

export default {
  inject: [
    'selectedContacts'
  ],

  components: { Search, SelectListTreeFolder },

  computed: {
    ...mapGetters('contacts', [
      'selectList',
      'currentListFilters',
      'selectedStaticList',
      'selectedList',
      'folders',
      'search'
    ]),
    ...mapState(['isDatatableSelectedAll']),
    ...mapGetters('auth', ['profile']),
    getTitle () {
      return 'Add to Static Lists'
    }
  },

  data () {
    return {
      isOpen: false,
      contact_list_id: null,
      isLoading: false,
      ContactListTypes,
      publicLists: [],
      privateLists: [],
      publicPage: 1,
      privatePage: 1,
      hasMorePublic: false,
      hasMorePrivate: false,
      isLoadingMorePublic: false,
      isLoadingMorePrivate: false,
      hasLoadedLists: false
    }
  },

  methods: {
    ...mapActions('contacts', [
      'selectListClose',
      'foldersLoaded',
      'setSelectListSearchValue'
    ]),

    onClose () {
      if (!this.isLoading) {
        this.selectListClose()
      }
    },

    onSearch (searchValue) {
      this.setSelectListSearchValue(searchValue)
      this.resetLists()
      this.fetchLists()
    },

    resetLists () {
      this.publicLists = []
      this.privateLists = []
      this.publicPage = 1
      this.privatePage = 1
      this.hasMorePublic = false
      this.hasMorePrivate = false
      this.hasLoadedLists = false
    },

    fetchLists () {
      if (this.hasLoadedLists && !this.selectList.search_value) {
        return
      }

      this.isLoading = true
      Promise.all([this.fetchPublicLists(), this.fetchPrivateLists()])
        .finally(() => {
          this.isLoading = false
          this.hasLoadedLists = true
        })
    },

    fetchPublicLists () {
      const params = {
        page: this.publicPage,
        size: 20,
        list_type: ContactListTypes.STATIC
      }

      if (this.selectList.search_value && this.selectList.search_value.length > 0) {
        params.search = this.selectList.search_value
      }

      return talk2Api.V2.contactList.public(params)
        .then((response) => {
          const data = response.data
          if (this.publicPage === 1) {
            this.publicLists = data.data
          } else {
            this.publicLists = [...this.publicLists, ...data.data]
          }
          this.hasMorePublic = data.data.length === 20
        })
        .catch((error) => {
          this.$generalNotification(extractErrorMessage(error), 'error')
        })
    },

    fetchPrivateLists () {
      const params = {
        page: this.privatePage,
        size: 20,
        list_type: ContactListTypes.STATIC,
        user_id: this.profile.id,
        private_only: true
      }

      if (this.selectList.search_value && this.selectList.search_value.length > 0) {
        params.search = this.selectList.search_value
      }

      return talk2Api.V2.contactList.get(params)
        .then((response) => {
          const data = response.data
          if (this.privatePage === 1) {
            this.privateLists = data.data
          } else {
            this.privateLists = [...this.privateLists, ...data.data]
          }
          this.hasMorePrivate = data.data.length === 20
        })
        .catch((error) => {
          this.$generalNotification(extractErrorMessage(error), 'error')
        })
    },

    loadMorePublic () {
      this.isLoadingMorePublic = true
      this.publicPage++
      this.fetchPublicLists()
        .finally(() => {
          this.isLoadingMorePublic = false
        })
    },

    loadMorePrivate () {
      this.isLoadingMorePrivate = true
      this.privatePage++
      this.fetchPrivateLists()
        .finally(() => {
          this.isLoadingMorePrivate = false
        })
    },

    processRequest (params, isChunked = false, chunkedContactIds = []) {
      if (chunkedContactIds.length > 0) {
        params.contact_ids = chunkedContactIds[0]
      }

      const url = `/api/v2/contacts-list/${this.selectedStaticList.id}/items`
      this.$axios
        .post(url, params)
        .then((response) => {
          if (isChunked) {
            // remove the used set of contact ids
            chunkedContactIds.splice(0, 1)
            const hasMoreChunks = chunkedContactIds.length > 1

            // process the next set of contact ids
            if (chunkedContactIds.length > 0) {
              this.processRequest(params, hasMoreChunks, chunkedContactIds)

              return
            } else {
              isChunked = false
            }
          }

          const message = response.data.message

          this.$router.push(`/contacts/list/${this.selectedStaticList.id}`)

          this.selectListClose()

          this.$generalNotification(message)

          this.loadFolders()
        })
        .catch((error) => {
          if (!isChunked) {
            this.$VueEvent.fire('addContactsProgress', {
              id: null,
              loading: false
            })

            const { message, html } = extractErrorMessage(error)
            console.log(html)
            this.$generalNotification(message, 'error')
          } else {
            this.$generalNotification('Unable to add Contact to Static List. Please check if You are authorized to edit this list.', 'error')
            this.isLoading = false
          }
        })
        .finally(() => {
          if (!isChunked) {
            this.isLoading = false
          }
        })
    },

    processSubmit () {
      this.isLoading = true

      let params = {}
      let ids = []

      if (this.isDatatableSelectedAll) {
        params.selected_all = true
      } else {
        ids = this.selectedContacts[this.selectedList.id].map(item => item.id)
        ids = chunk(ids, 50)
      }

      const allFilters = this.$jsonClone(this.currentListFilters)
      // delete attributes that wont be considered as filter
      delete allFilters.order
      delete allFilters.relations
      delete allFilters.sort
      delete allFilters.search

      // we have to use the dynamic list's filters deconstructed if the source list is DYNAMIC
      if (this.selectedStaticList.type === this.ContactListTypes.DYNAMIC && !isEmpty(allFilters)) {
        Object.keys(allFilters).forEach(index => {
          // include all other filters
          if (!this.$isNumeric(index)) {
            params[index] = allFilters[index]
            delete allFilters[index]
          }
        })

        // include the filter groups
        params.filter_groups = allFilters
      } else if (!isEmpty(allFilters)) {
        // just pass the filters when not empty
        params.filter_groups = allFilters
      }

      if (ContactListTypes.CONTACTS_STRING_KEYS.indexOf(this.selectedList.id) === -1) {
        // else, list is of type STATIC. Just pass the contacts list id filter
        const contactListFilter = [
          {
            value: [this.selectedList.id],
            operator: 1
          }
        ]

        // Verify if filter_groups is already set and merge it with the contact_lists filter
        if (Array.isArray(params.filter_groups)) {
          params.filter_groups[0].filters.contact_lists = contactListFilter
        } else {
          params.filter_groups = [
            {
              filters: {
                contact_lists: contactListFilter
              }
            }
          ]
        }

        params.filter_groups[0].is_conjunction = true
      }

      // only show list's loading view if all contacts were selected
      if (params?.selected_all) {
        this.$VueEvent.fire('addContactsProgress', {
          id: this.selectedStaticList.id,
          loading: true
        })
      }

      if (this.search) {
        params.search = this.search
      }

      const isChunked = !params?.selected_all && ids.length > 0
      this.processRequest(params, isChunked, ids)
    },

    onSubmit () {
      if (!this.selectedStaticList.hasEdit) {
        this.$generalNotification('You are not authorized to edit this resource.', 'error')
        return
      }

      this.processSubmit()
    },

    loadFolders () {
      this.$axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    }
  },

  watch: {
    selectList ({ open }) {
      this.isOpen = open
      if (open) {
        if (!this.hasLoadedLists || this.selectList.search_value) {
          this.resetLists()
          this.fetchLists()
        }
      }
      this.name = null
      this.type = this.ContactListTypes.STATIC
    }
  }
}
</script>
