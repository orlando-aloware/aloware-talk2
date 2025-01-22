<template>
  <div class="contacts mx-0 content-row d-flex overflow-hidden h-100">
    <lists-folders-management />

  <div class="lists-container flex-grow-1 d-flex flex-column">

    <div>
      <div class="d-flex items-start">
        <div class="pl-3">
          <h3 class="title">{{ title }}</h3>
          <div class="count">
            <strong v-if="!isLoading && !isListsLoading">{{ listsCount }} Lists</strong>
            <q-spinner-bars class="mr-1"
                            color="primary"
                            size="14px"
                            v-else />
          </div>
        </div>
        <div class="pl-4 ml-4 border-left">
          <div>
            <h4>Filters</h4>
            <div>
              Show in Public Folder
              <q-toggle size="md"
                        val="md"
                        v-model="showInPublicFolder" />
            </div>
          </div>
        </div>
      </div>

      <div class="filters  pl-3">
        <div class="search">
          <search-input class="width-260"
                        limit-search-characters
                        :search="search"
                        :disabled="isLoadingDisabled"
                        data-testid="lists-search-input"
                        @search="onSearch" />
        </div>

        <div class="setting pr-3 align-items-center">
          <compact-btn variant="success"
                       class="mr-2"
                       data-testid="create-list-menu-item"
                       @clicked="onCreateList($event)">
            <plus-icon class="mr-1"
                       color="white"/>
            Add List
          </compact-btn>
        </div>
      </div>
    </div>
    <q-table class="lists-table flex-grow-1"
             row-key="index"
             virtual-scroll
             :data="listsData"
             :columns="fixedColumns"
             :loading="isLoadingMore || isLoading || isListsLoading"
             :virtual-scroll-item-size="100"
             :virtual-scroll-sticky-size-start="100"
             :pagination="pagination"
             :rows-per-page-options="[0]"
             @virtual-scroll="onScroll">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td :props="props"
                :key="col.name"
                v-for="col in props.cols">
            <div v-if="col.name === 'name'">
              <router-link class="d-flex align-items-center item contact-name"
                                 data-testid="lists-view-list-name-link"
                                 :to="`/contacts/list/${props.row.id}${props.row.show_in_public_folder ? '?type=public' : ''}`">
                {{ props.row.name }}
              </router-link>
            </div>
            <div v-if="col.name === 'owner_name'">
              {{ props.row.owner_name }}
            </div>
            <div v-else-if="col.name === 'date_created'">
              <relative-time humanized
                             :from-time="props.row[col.field]" />
            </div>
            <div v-else-if="col.name === 'no_of_contacts'">
              {{ props.row.no_of_contacts }}
            </div>
            <div v-else-if="col.name === 'type'">
              {{ getContactListType(props.row) }}
            </div>
            <div v-else-if="col.name === 'show_in_public_folder'">
              {{ props.row.show_in_public_folder }}
            </div>
            <div v-else-if="col.name === 'source'">
              <span v-if="props.row.source_name">
                {{ props.row.source_name | ucwords }}
              </span>
              <span v-else>-</span>
            </div>
            <div v-else-if="col.name === 'import_status'">
              <span v-if="props.row.import_status_name">
                {{ props.row.import_status_name | ucwords }}
              </span>
              <span v-else>-</span>
            </div>
            <div v-else-if="col.name === 'imported_at'">
              <relative-time humanized
                             :from-time="props.row[col.field]"
                             v-if="props.row[col.field]" />
              <span v-else>-</span>
            </div>
            <div v-else-if="col.name === 'actions'">
              <div class="d-flex justify-content-center context-menu">
                <div class="operation-button mx-1">
                  <span class="cursor-pointer"
                        data-testid="lists-edit-button"
                        @click="onEditList(props.row)">
                    <pencil-o-icon height="16"
                                width="16"
                                color="#62666E"/>
                    <q-tooltip>
                      Edit this List
                    </q-tooltip>
                  </span>
                </div>

                <div class="operation-button mx-1">
                  <span class="cursor-pointer"
                        data-testid="lists-rename-button"
                        @click="onRenameList(props.row)">
                    <pencil-icon height="16"
                                width="16"
                                color="#62666E"/>
                    <q-tooltip>
                      Rename this list
                    </q-tooltip>
                  </span>
                </div>

                <div class="operation-button mx-1">
                  <span class="cursor-pointer"
                        data-testid="lists-duplicate-button"
                        @click="onDuplicateList(props.row)">
                    <duplicate-icon height="16"
                               width="16"
                               color="#62666E"/>
                    <q-tooltip>
                      Duplicate this list
                    </q-tooltip>
                  </span>
                </div>

                <div class="operation-button mx-1"
                     :data-popper-target="'list-' + props.row.id">
                  <span class="cursor-pointer"
                        data-testid="lists-move-button"
                        data-action="move-item"
                        @click="onMoveList(props.row)">
                    <move-icon height="16"
                               width="16"
                               color="#62666E"/>
                    <q-tooltip>
                      Move this list
                    </q-tooltip>
                  </span>
                </div>

                <div class="operation-button mx-1">
                  <span class="cursor-pointer"
                        data-testid="lists-pin-button"
                        @click="onPinList(props.row)">
                    <pin-icon height="16"
                               width="16"
                               color="#62666E"/>
                    <q-tooltip>
                      {{ pinnedLists.includes(props.row.id) ? 'Unpin' : 'Pin' }} this list
                    </q-tooltip>
                  </span>
                </div>

                <div class="operation-button mx-1"
                     v-if="hasShowInPublicFolderPermission">
                  <span class="cursor-pointer"
                        data-testid="lists-show-button"
                        @click="onShowInPublicFolderList(props.row)">
                    <eye-icon height="16"
                              width="16"
                              color="#62666E"
                              v-if="!props.row.show_in_public_folder"/>
                    <eye-off-icon height="16"
                                  width="16"
                                  color="#62666E"
                                  v-else/>
                    <q-tooltip>
                      Convert this list to {{ props.row.show_in_public_folder ? 'private' : 'public' }}
                    </q-tooltip>
                  </span>
                </div>

                <div class="operation-button mx-1">
                  <span class="cursor-pointer"
                        data-testid="lists-enroll-sequence-button"
                        @click="onEnrollContactsToSequence(props.row)">
                    <add-sequence-icon height="16"
                                   width="16"
                                   color="#62666E"/>
                    <q-tooltip>
                      Enroll contacts to sequence
                    </q-tooltip>
                  </span>
                </div>

                <div class="operation-button mx-1">
                  <span class="cursor-pointer"
                        data-testid="lists-add-power-dialer-button"
                        @click="onAddListToPowerDialer(props.row)">
                    <add-call-icon height="16"
                                   width="16"
                                   color="#62666E"/>
                    <q-tooltip>
                      Add this list to Power Dialer
                    </q-tooltip>
                  </span>
                </div>

                <div class="operation-button mx-1">
                  <span class="cursor-pointer"
                        data-testid="lists-delete-button"
                        @click="onDeleteList(props.row)">
                    <trash-icon height="16"
                                width="16"
                                color="#62666E"/>
                    <q-tooltip>
                      Delete this list
                    </q-tooltip>
                  </span>
                </div>

                <div class="operation-button mx-1">
                  <span class="cursor-pointer"
                        data-testid="lists-duplicate-button"
                        @click="openAssignContacts(props.row)">
                    <arrow-right-icon height="16"
                                      width="16"
                                      color="#62666E"/>
                    <q-tooltip>
                      Assign Contacts
                    </q-tooltip>
                  </span>
                </div>
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:loading>
        <div class="d-flex justify-center">
          <q-spinner-bars color="primary"
                          size="30px" />
        </div>
      </template>

      <template v-slot:no-data>
        <div class="w-100 text-center"
             v-if="!isLoadingMore && !isLoading">
          <h2> No data </h2>
        </div>
      </template>
    </q-table>

    <lists-rename-form :is-show="isOpenListForm"
                       :editable-list="list"
                       data-testid="lists-form"
                       @closeListForm="closeListForm"
                       @listUpdated="listUpdated"/>

    <convert-list-to-public-dialog :list-id="list.id"
                                   :list-name="list.name"
                                   :list-show-in-public-folder="list.show_in_public_folder"
                                   :from-admin-list="true"
                                   v-model="convertToPublicDialog"
                                   v-if="list"
                                   @closed="convertToPublicDialog = false"
                                   @converted="onListConvertedToPublic"/>

    <tag-contacts-workflow-enroller :is-show="showAddToSequence"
                                    :list="list"
                                    @closeEnrollTagContactsToSequenceDialog="closeAddToSequence" />

    <power-dialer-add-modal :params="attachedParams()"
                            :contact-list="list"
                            :mode="addToPowerDialerMode"
                            :show-in-contacts-page="true"
                            :selected-all-count="list.no_of_contacts"
                            :is-manual-selection="addToPowerDialerIsManualSelection"
                            v-if="openPDModal"
                            @hidden="openPDModal = false">
      </power-dialer-add-modal>

      <assign-contacts-modal :is-show="showAssignContacts"
                             :list="list"
                             @closeAssignContactsModal="closeAssignContacts" />

      <move-dialog />

      <create-list-modal />
  </div>

  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import SearchInput from 'src/components/search-input'
import ListsRenameForm from 'src/components/lists/lists-rename-form'
import ConvertListToPublicDialog from 'components/convert-list-to-public-dialog'
import TagContactsWorkflowEnroller from 'components/tags/tag-contacts-workflow-enroller'
import PowerDialerAddModal from 'src/components/power-dialer/power-dialer-add-modal'
import AssignContactsModal from 'src/components/assign-contacts-modal'
import MoveDialog from 'src/components/move-dialog'
import CreateListModal from 'components/create-list-modal.vue'
import CompactBtn from 'src/components/compact-btn.vue'
import RelativeTime from 'src/components/relative-time.vue'
import PencilIcon from 'components/icons/pencil-icon.vue'
import PencilOIcon from 'components/icons/pencil-o-icon.vue'
import DuplicateIcon from 'components/icons/duplicate-icon.vue'
import TrashIcon from 'components/icons/trash-icon.vue'
import PinIcon from 'components/icons/pin-icon.vue'
import EyeIcon from 'components/icons/eye-icon.vue'
import EyeOffIcon from 'components/icons/eye-off-icon'
import AddCallIcon from 'components/icons/add-call-icon.vue'
import AddSequenceIcon from 'components/icons/add-sequence-icon'
import ArrowRightIcon from 'components/icons/arrow-right-icon'
import MoveIcon from 'components/icons/move-icon.vue'
import PlusIcon from 'components/icons/plus-icon.vue'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { COLUMNS, columnsByViewportConfig } from 'src/constants/lists/home-columns'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import { aclMixin, dataTableMixin, mainViewMixin } from 'src/plugins/mixins'
import ListsFoldersManagement from './lists-folders-management'

export default {
  name: 'ListsTable',

  props: {
    title: {
      type: String,
      default: 'Lists'
    }
  },

  mixins: [
    aclMixin,
    dataTableMixin,
    mainViewMixin
  ],

  components: {
    AddCallIcon,
    AddSequenceIcon,
    ArrowRightIcon,
    DuplicateIcon,
    EyeIcon,
    EyeOffIcon,
    MoveIcon,
    PencilIcon,
    PencilOIcon,
    PinIcon,
    TrashIcon,
    PlusIcon,
    SearchInput,
    AssignContactsModal,
    ConvertListToPublicDialog,
    ListsRenameForm,
    MoveDialog,
    CreateListModal,
    PowerDialerAddModal,
    TagContactsWorkflowEnroller,
    RelativeTime,
    CompactBtn,
    ListsFoldersManagement
  },

  data () {
    return {
      search: '',
      isLoadingDisabled: false,
      isLoading: false,
      isLoadingMore: false,
      loading: false,
      pagination: {
        rowsPerPage: 0,
        rowsNumber: this.listsCount,
        perPage: 30,
        totalPages: 1,
        currentPage: 1
      },
      listsData: [],
      list: null,
      isUnsavedListModalShown: false,
      isOpenListForm: false,
      convertToPublicDialog: false,
      pinnedLists: [],
      showAddToSequence: false,
      showAssignContacts: false,
      openPDModal: false,
      addToPowerDialerMode: 'add',
      addToPowerDialerIsManualSelection: false,
      COLUMNS,

      // Filters
      showInPublicFolder: false
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'pinned',
      'moveDialog',
      'isAllContactsSelected'
    ]),
    ...mapState('listsModule', [
      'isListsLoading'
    ]),
    ...mapState('contacts', [
      'unsavedList'
    ]),
    ...mapGetters('listsModule', {
      lists: 'getLists',
      listsCount: 'getListsCount'
    }),

    hasShowInPublicFolderPermission () {
      return this.isBillingAdminOrAdminOrSupervisor
    },

    columnsByViewport () {
      return columnsByViewportConfig
    },

    fixedColumns () {
      const allColumns = this.$jsonClone(this.COLUMNS)
      return this.getResponsiveColumns(allColumns, this.columnsByViewport)
    },

    isPinned () {
      return Array.isArray(this.pinnedLists) ? this.pinnedLists.includes(this.list.id) : false
    },

    userId () {
      return this.$route.query.user_id
    }
  },

  methods: {
    ...mapActions('contacts', [
      'listPinToggled',
      'addPowerDialerOpen',
      'openMoveDialog',
      'createListOpen',
      'setUnsavedList'
    ]),

    ...mapActions('listsModule', [
      'fetchLists',
      'deleteList'
    ]),

    ...mapMutations('listsModule', [
      'SET_SEARCH',
      'SET_LISTS_COUNT'
    ]),

    async initializeLists () {
      await this.getLists()
      this.calculateTotalPages()
      this.listsData = this.lists
      await this.getPinnedLists()
    },

    getContactListType (contactList) {
      switch (contactList.type) {
        case ContactListTypes.STATIC:
          return 'Static'
        case ContactListTypes.DYNAMIC:
          return 'Dynamic'
        case ContactListTypes.DYNAMIC_REMOTE_LIST:
          return 'Integration Dynamic'
        default:
          return 'Unknown'
      }
    },

    calculateTotalPages () {
      if (this.lists?.length === 0) {
        this.pagination.totalPages = 1
        return
      }

      this.pagination.totalPages = Math.ceil(this.listsCount / this.pagination.perPage)
    },

    async getLists (isLoadMore = false) {
      if (this.isLoading) {
        return
      }

      this.setLoadingState(isLoadMore)

      if (!isLoadMore) {
        this.isLoading = true
        this.pagination.currentPage = 1
        this.listsData = []
      } else {
        this.isLoadingMore = true
      }

      const filters = {
        ...(this.search && { search: this.search }),
        ...(this.userId && { user_id: this.userId }),
        private_only: !this.showInPublicFolder
      }

      return this.fetchLists({
        page: this.pagination.currentPage,
        perPage: this.pagination.perPage,
        filters
      })
        .finally(() => {
          this.isLoading = false
          this.isLoadingMore = false
        })
    },

    setLoadingState (isLoadMore) {
      if (!isLoadMore) {
        this.isLoading = true
        this.pagination.currentPage = 1
        this.listsData = []
      } else {
        this.isLoadingMore = true
      }
    },

    removeList (list) {
      this.deleteList(list.id)
        .then(() => {
          this.SET_LISTS_COUNT(this.listsCount - 1)
          this.listsData = this.listsData.filter(item => item.id !== list.id)
          this.$generalNotification(`${list.name} list has been successfully deleted.`)
        })
        .catch(err => {
          console.error(err)
          this.$generalNotification('Something went wrong while deleting list.', 'error')
        })
    },

    async onScroll ({ to, ref }) {
      const lastIndex = this.listsData.length - 1
      if (!this.isLoadingMore && this.pagination.currentPage < this.pagination.totalPages && to === lastIndex) {
        await this.loadMoreLists()
        ref.refresh()
      }
    },

    openListForm () {
      this.isOpenListForm = true
    },

    closeListForm () {
      this.isOpenListForm = false
      setTimeout(() => (this.list = null), 200) // Fix UI glitch
    },

    listUpdated (list) {
      this.listsData = this.listsData.map(item =>
        item.id === list.id ? { ...item, name: list.name } : item
      )
    },

    openAssignContacts (list) {
      this.list = list
      this.showAssignContacts = true
    },

    closeAssignContacts () {
      this.showAssignContacts = false
    },

    onRenameList (list) {
      this.list = list
      this.openListForm()
    },

    onDuplicateList (list) {
      this.list = list
      this.duplicateList({
        id: list.id,
        type: list.type,
        from_admin_list: true
      })
    },

    async duplicateList (params) {
      try {
        const response = await this.$axios.post(`/api/v2/contacts-list/${this.list.id}/duplicate`, params)
        this.$generalNotification(response.data.message)
        await this.refreshLists()
      } catch (error) {
        const { message } = extractErrorMessage(error)
        console.error(error)
        this.$generalNotification(message, 'error')
      }
    },

    async refreshLists () {
      this.listsData = []
      this.SET_LISTS_COUNT(0)
      await this.getLists()
      this.calculateTotalPages()
      this.pagination.currentPage = 1
      this.listsData = this.lists
    },

    onDeleteList (list) {
      this.$bvModal
        .msgBoxConfirm(
          'Are you sure you want to delete this contact list? This action is irreversible.',
          {
            buttonSize: 'sm',
            okTitle: 'Yes',
            cancelTitle: 'No',
            centered: true
          }
        )
        .then(confirm => confirm && this.removeList(list))
    },

    async getPinnedLists () {
      try {
        const { data } = await this.$axios.get('/api/v2/contact-list-bookmark')
        this.pinnedLists = data.map(item => item.contact_list_id)
      } catch (err) {
        console.error(err)
        this.$generalNotification('Unable to load lists, please try again.', 'error')
      }
    },

    onPinList (list) {
      this.list = list
      const isPinned = !this.isPinned

      this.pinRequest(this.list.id, isPinned).finally(() => {
        this.getPinnedLists()
        this.$generalNotification(isPinned ? 'Contact list has been successfully pinned.' : 'Contact list has been unpinned.')
      })
    },

    pinRequest (id, isPinned) {
      return isPinned
        ? this.$axios.post('/api/v2/contact-list-bookmark', { contact_list_id: id, order: id })
        : this.$axios.delete(`/api/v2/contact-list-bookmark/${id}`)
    },

    onEnrollContactsToSequence (list) {
      this.list = list
      this.showAddToSequence = true
    },

    closeAddToSequence () {
      this.showAddToSequence = false
    },

    onAddListToPowerDialer (list) {
      this.list = list
      this.addToPowerDialerList(true)
    },

    addToPowerDialerList (isManualSelection = false) {
      this.openPDModal = true
      this.addPowerDialerOpen(true)
      this.addToPowerDialerMode = 'add-contact-list'
      this.addToPowerDialerIsManualSelection = isManualSelection
    },

    attachedParams () {
      return {
        list_id: this.list.id,
        selected_all: true,
        contact_ids: []
      }
    },

    onMoveList (list) {
      this.list = list
      this.openMoveDialog({ id: list.id, type: 'list' })
    },

    onShowInPublicFolderList (list) {
      this.list = list
      this.convertToPublicDialog = true
    },

    onListConvertedToPublic () {
      const { id, show_in_public_folder: showInPublicFolder } = this.list
      this.listsData = this.listsData.map(item =>
        item.id === id ? { ...item, show_in_public_folder: !showInPublicFolder } : item
      )
      this.convertToPublicDialog = false
    },

    async onSearch (value) {
      this.SET_SEARCH(value)
      this.search = value
      await this.refreshLists()
    },

    onEditList (list) {
      this.list = list
      this.$router.push(`/contacts/list/${this.list.id}${this.list.show_in_public_folder ? '?type=public' : ''}`)
    },

    async loadMoreLists (done) {
      if (this.isLoadingMore || this.pagination.currentPage >= this.pagination.totalPages) {
        if (typeof done === 'function') {
          done()
        }
        return
      }

      this.pagination.currentPage += 1
      await this.getLists(true)
      this.listsData.push(...this.lists)

      if (typeof done === 'function') {
        done()
      }
    },

    onCreateList (event) {
      if (event) {
        event.preventDefault()
      }

      this.showUnsavedListDialog(() => {
        this.createListOpen({
          contact_folder_id: null
        })
      })
    },

    showUnsavedListDialog (callback) {
      if (this.unsavedList && !this.isUnsavedListModalShown) {
        this.isUnsavedListModalShown = true
        this.$bvModal.msgBoxConfirm('You have an unsaved contact list. This action may caused unsaved contact list data loss. Do you wish to continue?', {
          buttonSize: 'sm',
          okTitle: 'Yes',
          cancelTitle: 'No',
          centered: true
        }).then(confirm => {
          if (confirm) {
            this.setUnsavedList(null)
            callback()
          }

          this.isUnsavedListModalShown = false
        })
      }

      if (!this.unsavedList) {
        callback()
      }
    }
  },

  async mounted () {
    await this.initializeLists()
  },

  watch: {
    userId () {
      this.refreshLists()
    }
  }
}
</script>
