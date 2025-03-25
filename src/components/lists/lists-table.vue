<template>
  <div class="contacts lists-management mx-0 content-row d-flex overflow-hidden h-100">
    <lists-folders-management :is-loading="isLoading || isLoadingMore" />

    <div class="talk-table-container flex-grow-1 d-flex flex-column">
      <div class="d-flex justify-between items-start">
        <div class="px-3">
          <h3 class="title pl-3"> {{ title  }}</h3>
          <div class="count pl-3">
            <div class="d-flex align-items-center"
                v-if="!isPublic && !isLoading">
              <div class="d-flex align-items-center title-path mb-2">
                <router-link :to="buildFolderPath()">
                  <div class="title-breadcrumb-link d-flex align-items-center">All Folders</div>
                </router-link>
                <slash-icon class="title-slash d-flex align-items-center" v-if="foldersPath.length"/>
              </div>
              <template v-if="folderId">
                <div class="d-flex align-items-center title-path mb-2"
                     :key="folder.id"
                     v-for="(folder, index) in foldersPath">
                  <router-link :to="buildFolderPath(folder.id)">
                    <div class="title-breadcrumb-link d-flex align-items-center">
                      {{ folder.name == 'Root' ? 'Root Folder' : folder.name }}
                    </div>
                  </router-link>
                  <slash-icon class="title-slash d-flex align-items-center" v-if="(index + 1) < foldersPath.length"/>
                </div>
              </template>
            </div>

            <strong v-if="!isLoading">{{ listsCount }} List(s)</strong>

            <q-spinner-bars :class="`${isPublic ? 'my-1' : 'my-3'}`"
                            color="primary"
                            size="14px"
                            v-else />
        </div>
        <div class="d-flex align-items-center mt-2">
          <div class="filters pl-3 mt-0">
            <div class="search">
              <search-input class="width-260"
                            data-testid="lists-search-input"
                            limit-search-characters
                            placeholder="Search List Name"
                            :search="search"
                            :search-on-input="true"
                            @search="onSearch" />
            </div>
          </div>
          <div class="ml-2">
            <b-dropdown variant="primary"
                        class="m-2 b-compact-dropdown-button text-bold text-black dropdown-white filter-toggle-button"
                        toggle-class="dropdown-btn-text py-0 my-0 d-flex align-items-center"
                        right
                        no-caret>
              <template #button-content>
                <div class="dropdown-btn-text d-flex align-items-center">
                  Search Filters
                </div>
                <i class="fa fa-chevron-down fs-12 ml-2 text-grey-90" />
              </template>
              <b-overlay :show="isLoading">
                <template #overlay>
                  <q-spinner-bars color="primary"
                                  size="30px" />
                </template>
                <h5 class="form-label relative-time m-2" style="width: 185px;">Visibility</h5>
                <b-form-group class="px-2 py-1 d-flex align-items-center cursor-pointer w-100 text-sm mb-0">
                  <b-form-checkbox value="publicLists"
                                  v-model="visibilityFilters"
                                  @change="onFilterChange">
                    Public Lists
                  </b-form-checkbox>
                </b-form-group>
                <b-form-group class="px-2 py-1 d-flex align-items-center cursor-pointer w-100 text-sm mb-0">
                  <b-form-checkbox value="myLists"
                                   v-model="visibilityFilters"
                                  @change="onFilterChange">
                    {{ isAdmin ? 'Personal' : 'My' }} Lists
                  </b-form-checkbox>
                </b-form-group>
                <div class="d-flex align-items-center cursor-pointer"
                     v-if="isAdmin">
                  <b-form-group class="px-2 py-1 d-flex align-items-center cursor-pointer text-sm mb-0">
                    <b-form-checkbox value="personalLists"
                                     v-model="visibilityFilters"
                                    @change="onFilterChange">
                      All Personal Lists
                    </b-form-checkbox>
                  </b-form-group>
                  <information-circle-icon id="personal-lists-tooltip"
                                           color="#2F80ED"/>
                  <b-tooltip custom-class="talk-table__tooltip"
                             placement="bottom"
                             boundary="window"
                             target="personal-lists-tooltip">
                    Search through all users Personal Lists
                  </b-tooltip>
                </div>

                <h5 class="form-label relative-time m-2">Type</h5>
                <div :key="option.value"
                     v-for="option of listTypeOptions">
                  <b-form-group class="px-2 py-1 d-flex align-items-center cursor-pointer w-100 text-sm mb-0">
                    <b-form-checkbox :value="option.value"
                                     v-model="listTypesFilter"
                                     @change="onFilterChange">
                      {{ option.label }}
                    </b-form-checkbox>
                  </b-form-group>
                </div>
              </b-overlay>
            </b-dropdown>
          </div>
        </div>
      </div>

        <div class="d-flex justify-between">
          <b-dropdown variant="primary"
                      class="m-2 b-compact-dropdown-button text-bold text-black dropdown-white filter-toggle-button"
                      toggle-class="dropdown-btn-text py-0 my-0 d-flex align-items-center"
                      right
                      no-caret>
            <template #button-content>
              <div class="dropdown-btn-text d-flex align-items-center">
                Add List
              </div>
              <i class="fa fa-chevron-down fs-12 ml-2 text-grey-90" />
            </template>
            <b-dropdown-item href="#"
                            @click="onCreateList">
              <plus-icon />
              Create new List
            </b-dropdown-item>
            <b-dropdown-item href="#"
                            @click="openImportContactsModal">
              <csv-icon />
              Import from CSV
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>

      <datatable class="talk-table mt-0"
                 sticky-headers
                 scroll-area-class="lists-management-scroll-area"
                 use-empty-slot
                 :paginated="false"
                 :columns="fixedColumns"
                 :total-rows="pagination.rowsNumber"
                 :current-page="pagination.currentPage"
                 :last-page="pagination.totalPages"
                 :is-loading="isLoading"
                 :is-loading-more="isLoadingMore"
                 @sort="onSortByField"
                 @reordered="onColumnsReordered"
                 @more="onScroll">
        <template #tbody>
          <tr class=""
              :key="index"
              v-for="(row, index) in listsData">
            <td :class="{ 'actions-td': col.name === COLUMN_NAMES.actions }"
                :key="col.name"
                v-for="col in fixedColumns">
              <div class="ellipse"
                   v-if="col.name === COLUMN_NAMES.name">
                <router-link class="contact-name"
                             data-testid="lists-view-list-name-link"
                             :to="buildListLink(row)">
                    {{ row.name }}
                </router-link>
              </div>
              <div v-if="col.name === COLUMN_NAMES.owner_name && isColumnVisible(col.name)">
                {{ row.owner_name }}
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.date_created">
                <relative-time humanized
                               :from-time="row[col.field]" />
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.no_of_contacts">
                {{ row.no_of_contacts }}
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.show_in_public_folder">
                {{ row.show_in_public_folder ? 'Public' : 'Private' }}
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.type">
                {{ getContactListType(row) }}
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.source">
                <span v-if="row.source_name">
                  {{ row.source_name | ucwords }}
                </span>
                <span v-else>-</span>
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.import_status">
                <span v-if="row.import_status_name">
                  {{ row.import_status_name | ucwords }}
                </span>
                <span v-else>-</span>
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.imported_at">
                <relative-time humanized
                               :from-time="row[col.field]"
                              v-if="row[col.field]" />
                <span v-else>-</span>
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.actions">
                <div class="d-flex justify-content-center">
                  <b-dropdown class="m-2 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown"
                              text="..."
                              variant="light"
                              no-caret
                              data-testid="lists-options-dropdown"
                              alt="List Options"
                              title="List Options"
                              boundary="window"
                              right
                              :popper-opts="{ positionFixed: true }"
                              @hide="onHide"
                              @show="onShow">
                    <template #button-content>
                      <ellipse-icon />
                    </template>

                    <b-dropdown-item href="#"
                                     data-testid="lists-edit-option"
                                     @click="onEditList(row)">
                      <pencil-o-icon height="14"
                                     width="14"
                                     color="#62666E"/>
                      Edit List
                    </b-dropdown-item>

                    <b-dropdown-item href="#"
                                     data-testid="lists-rename-option"
                                     @click="onRenameList(row)">
                      <pencil-icon />
                      Rename List
                    </b-dropdown-item>

                    <b-dropdown-item href="#"
                                     data-testid="lists-duplicate-option"
                                     @click="onDuplicateList(row)">
                      <duplicate-icon />
                      Duplicate List
                    </b-dropdown-item>

                    <b-dropdown-item href="#"
                                     data-testid="change-list-owner-option"
                                     v-if="isAdmin"
                                     @click="openChangeListOwnerModal(row)">
                      <switch-icon />
                      Change List Owner
                    </b-dropdown-item>

                    <b-dropdown-item href="#"
                                     data-testid="lists-show-option"
                                     v-if="hasShowInPublicFolderPermission"
                                     @click="onShowInPublicFolderList(row)">
                      <template v-if="!row.show_in_public_folder">
                        <eye-icon />
                        Convert List to Public
                      </template>
                      <template v-else>
                        <eye-off-icon />
                        Convert List to Private
                      </template>
                    </b-dropdown-item>

                    <b-dropdown-item href="#"
                                     data-testid="lists-add-to-powerdialer-option"
                                     @click="onAddListToPowerDialer(row)">
                      <power-dialer-mobile-icon width="14"
                                                height="14"
                                                color="#62666E"/>
                      Add List to Power Dialer
                    </b-dropdown-item>

                    <b-dropdown-item href="#"
                                     data-testid="lists-add-to-sequence-option"
                                     @click="onEnrollContactsToSequence(row)">
                      <add-sequence-icon height="14"
                                         width="14"
                                         color="#62666E"/>
                      Add List to Sequence
                    </b-dropdown-item>

                    <b-dropdown-item href="#"
                                     data-testid="lists-assign-option"
                                     @click="openAssignContacts(row)">
                      <power-dialer-mobile-icon width="14"
                                                height="14"
                                                color="#62666E"/>
                      Assign Contact List
                    </b-dropdown-item>

                    <b-dropdown-item href="#"
                                     data-testid="lists-aloai-option"
                                     v-if="shouldShowAloAi"
                                     @click="openAloAiBotContactsEnrollmentModal(row)">
                      <add-user-icon width="14"
                                     height="14"
                                     color="#62666E"/>
                      Enroll List in AloAi Agent
                    </b-dropdown-item>

                    <b-dropdown-item href="#"
                                     data-testid="lists-move-option"
                                     :data-popper-target="'list-' + row.id"
                                     v-if="!row.show_in_public_folder"
                                     @click.stop="onMoveList(row)">
                      <move-icon />
                      Move List
                    </b-dropdown-item>

                    <b-dropdown-item href="#"
                                     data-testid="lists-pin-option"
                                     @click="onPinList(row)">
                      <pin-icon />
                      {{ pinnedLists.includes(row.id) ? 'Unpin from' : 'Pin to' }} Contacts page
                    </b-dropdown-item>

                    <b-dropdown-item href="#"
                                     data-testid="lists-delete-option"
                                     @click="onDeleteList(row)">
                      <delete-red-icon />
                      <span class="text-danger">Delete</span>
                    </b-dropdown-item>
                  </b-dropdown>
                </div>
              </div>
            </td>
          </tr>
        </template>

        <template #empty>
          <div class="text-center loading-spinner"
               v-if="listsData.length === 0 && isLoading">
            <q-spinner-bars class=""
                            color="primary"
                            size="28px" />

          </div>
          <div class="w-100 text-center"
              v-else-if="!isLoading && !isLoadingMore && listsData.length === 0">
            <h2> No data </h2>
          </div>
        </template>

      </datatable>

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

      <aloai-enrollment-control-modal
        ref="enrollContactsToAloAiModal"
        :params="attachedParams()"
        :contact-list="list"
        :total-contacts-count="list?.no_of_contacts"
        :multiple-phone-numbers="true" />

      <assign-contacts-modal :is-show="showAssignContacts"
                            :list="list"
                            @closeAssignContactsModal="closeAssignContacts" />

      <move-dialog :user-id="userId"
                   :from-admin-list="true"
                   @onListMoved="onListMoved"/>

      <create-list-modal from="lists"
                         :user-id="userId" />

      <change-list-owner-modal ref="changeListOwnerModal"
                               :contactList="list"
                               @listOwnerChanged="onListOwnerChanged"/>

      <import-contacts-modal ref="importContacts"
                             :user-id="userId"
                             :folder-id="folderId"
                             :is-public="isPublic"
                             @importStarted="onImportStarted" />
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
import RelativeTime from 'src/components/relative-time.vue'
import PencilIcon from 'components/icons/pencil-icon.vue'
import PencilOIcon from 'components/icons/pencil-o-icon.vue'
import DuplicateIcon from 'components/icons/duplicate-icon.vue'
import PinIcon from 'components/icons/pin-icon.vue'
import EyeIcon from 'components/icons/eye-icon.vue'
import EyeOffIcon from 'components/icons/eye-off-icon'
import AddSequenceIcon from 'components/icons/add-sequence-icon'
import MoveIcon from 'components/icons/move-icon.vue'
import PlusIcon from 'components/icons/plus-icon.vue'
import CsvIcon from 'components/icons/csv-icon.vue'
import PowerDialerMobileIcon from 'components/icons/mobile-menu/power-dialer-mobile-icon'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { COLUMNS, columnsByViewportConfig, COLUMN_NAMES } from 'src/constants/lists/home-columns'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import { aclMixin, dataTableMixin, mainViewMixin } from 'src/plugins/mixins'
import ListsFoldersManagement from './lists-folders-management'
import SlashIcon from 'components/icons/slash-icon'
import AddUserIcon from 'components/icons/add-user-icon'
import SwitchIcon from 'components/icons/switch-icon'
import ChangeListOwnerModal from './change-list-owner-modal.vue'
import EllipseIcon from 'components/icons/ellipse-icon'
import DeleteRedIcon from 'components/icons/delete-red-icon'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import ImportContactsModal from 'src/components/import-contacts-modal.vue'
import AloaiEnrollmentControlModal from 'src/components/aloai-enrollment-control-modal.vue'
import Datatable from 'src/components/datatable.vue'

export default {
  name: 'ListsTable',

  mixins: [
    aclMixin,
    dataTableMixin,
    mainViewMixin
  ],

  components: {
    AddSequenceIcon,
    DuplicateIcon,
    EyeIcon,
    EyeOffIcon,
    MoveIcon,
    PencilIcon,
    PencilOIcon,
    PinIcon,
    PlusIcon,
    CsvIcon,
    SearchInput,
    AssignContactsModal,
    ConvertListToPublicDialog,
    ListsRenameForm,
    MoveDialog,
    CreateListModal,
    PowerDialerAddModal,
    TagContactsWorkflowEnroller,
    RelativeTime,
    ListsFoldersManagement,
    SlashIcon,
    AddUserIcon,
    SwitchIcon,
    ChangeListOwnerModal,
    EllipseIcon,
    PowerDialerMobileIcon,
    DeleteRedIcon,
    InformationCircleIcon,
    ImportContactsModal,
    AloaiEnrollmentControlModal,
    Datatable
  },

  data () {
    return {
      search: '',
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
      sort: 'contact_lists.created_at',
      order: 'desc',
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
      fixedColumns: [],
      COLUMN_NAMES,
      foldersPath: [],

      // Filters
      visibilityFilters: [],
      listTypesFilter: [ContactListTypes.STATIC, ContactListTypes.DYNAMIC, ContactListTypes.DYNAMIC_REMOTE_LIST],
      listTypeOptions: [
        { value: ContactListTypes.STATIC, label: 'Static' },
        { value: ContactListTypes.DYNAMIC, label: 'Dynamic' },
        { value: ContactListTypes.DYNAMIC_REMOTE_LIST, label: 'Integration Dynamic' }
      ]
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'pinned',
      'folders',
      'moveDialog',
      'isAllContactsSelected'
    ]),

    ...mapGetters('listsModule', {
      lists: 'getLists',
      listsCount: 'getListsCount'
    }),

    ...mapState(['users']),

    ...mapState('listsModule', [
      'isListsLoading',
      'listsImportedFromCsv'
    ]),

    ...mapState('contacts', [
      'unsavedList'
    ]),

    hasShowInPublicFolderPermission () {
      return this.isBillingAdminOrAdminOrSupervisor
    },

    columnsByViewport () {
      return columnsByViewportConfig
    },

    isPinned () {
      return Array.isArray(this.pinnedLists) ? this.pinnedLists.includes(this.list.id) : false
    },

    isPublic () {
      return this.$route.params.type === 'public'
    },

    title () {
      if (this.isPublic) {
        return 'Public Lists'
      }

      if (this.isAdmin && this.userId !== this.profile.id && this.selectedUser) {
        return `${this.selectedUser.first_name} ${this.selectedUser.last_name} Lists`
      }

      return 'My Lists'
    },

    selectedUser () {
      return this.users.length > 0 ? this.users.find(user => user.id === +this.userId) : null
    },

    userId () {
      if (this.$route.params.userId && this.isAdmin) {
        return +this.$route.params.userId
      }

      return this.profile.id
    },

    folderId () {
      if (this.$route.params.folderId) {
        return +this.$route.params.folderId
      }

      return null
    },

    publicListsFilterSelected () {
      return this.visibilityFilters.includes('publicLists')
    },

    myListsFilterSelected () {
      return this.visibilityFilters.includes('myLists')
    },

    personalListsFilterSelected () {
      return this.isAdmin && this.visibilityFilters.includes('personalLists')
    },

    isGlobalSearch () {
      return this.publicListsFilterSelected && (this.myListsFilterSelected || this.personalListsFilterSelected)
    }
  },

  methods: {
    ...mapActions('contacts', [
      'listPinToggled',
      'addPowerDialerOpen',
      'openMoveDialog',
      'closeMoveDialog',
      'createListOpen',
      'setUnsavedList',
      'setCurrentListFilters'
    ]),

    ...mapActions('listsModule', [
      'fetchLists',
      'deleteList'
    ]),

    ...mapMutations('listsModule', [
      'SET_SEARCH',
      'SET_LISTS_COUNT'
    ]),

    initFixedColumns () {
      const allColumns = this.$jsonClone(this.COLUMNS)

      this.fixedColumns = this.getResponsiveColumns(allColumns, this.columnsByViewport)
        .filter((col) => this.isColumnVisible(col.field))
    },

    async initializeLists () {
      this.SET_SEARCH('')
      this.search = ''
      this.resetSearchFilters()
      this.getPinnedLists()
      await this.getLists()
      this.calculateTotalPages()
      this.listsData = this.lists
    },

    calculateTotalPages () {
      if (this.lists?.length === 0) {
        this.pagination.totalPages = 1
        return
      }

      this.pagination.totalPages = Math.ceil(this.listsCount / this.pagination.perPage)
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

    async getLists (isLoadMore = false) {
      if (this.isLoading) {
        return
      }

      this.setLoadingState(isLoadMore)

      const filters = {
        ...(this.userId && { user_id: this.userId }),
        ...(this.folderId && { folder_id: this.folderId })
      }

      if (this.myListsFilterSelected) {
        filters.private_only = true
      }

      if (this.personalListsFilterSelected) {
        filters.private_only = true
        delete filters.user_id
        delete filters.folder_id
      }

      if (this.publicListsFilterSelected) {
        if (filters.private_only) {
          delete filters.private_only
        } else {
          filters.private_only = false
          delete filters.user_id
          delete filters.folder_id
        }
      }

      if (this.isGlobalSearch) {
        filters.global_search = true
      }

      if (this.listTypesFilter.length > 0) {
        filters.list_types = this.listTypesFilter
      }

      const props = {
        page: this.pagination.currentPage,
        perPage: this.pagination.perPage,
        sort: this.sort,
        order: this.order,
        filters
      }

      try {
        await this.fetchLists(props)
      } catch (err) {
        console.error('error', err)
      } finally {
        this.isLoading = false
        this.isLoadingMore = false
      }
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

    resetLoadingState () {
      this.isLoading = false
      this.isLoadingMore = false
    },

    removeList (list) {
      this.deleteList(list.id)
        .then(() => {
          this.SET_LISTS_COUNT(this.listsCount - 1)
          this.listsData = this.listsData.filter(item => item.id !== list.id)
          this.$generalNotification(`${list.name} list has been successfully deleted.`)
          // Refresh folders
          this.$VueEvent.fire('fetchContactsLists')
        })
        .catch(err => {
          console.error(err)
          this.$generalNotification('Something went wrong while deleting list.', 'error')
        })
    },

    async onScroll () {
      if (this.isLoading) return

      this.loadMoreLists()
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
      this.getPinnedLists()
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
        this.$generalNotification('Unable to load pinned lists, please try again.', 'error')
      }
    },

    onPinList (list) {
      this.list = list
      const isPinned = !this.isPinned

      this.pinRequest(this.list.id, isPinned).finally(() => {
        this.$generalNotification(isPinned ? 'Contact list has been successfully pinned.' : 'Contact list has been unpinned.')
        if (isPinned) {
          this.pinnedLists.push(this.list.id)
        } else {
          this.pinnedLists = this.pinnedLists.filter(item => item !== this.list.id)
        }
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
        list_id: this.list?.id,
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
      this.convertToPublicDialog = false
      this.refreshLists()
    },

    onFolderSelected ({ id }) {
      this.$router.push(this.buildFolderPath(id)).catch(() => {})
    },

    buildFolderPath (id = null) {
      let path = '/lists-management/user'

      if (this.$route.params.userId) {
        path += `/${this.$route.params.userId}`
      }

      if (id) {
        path += `/folder/${id}`
      }

      return path
    },

    async onSearch (value) {
      this.SET_SEARCH(value)
      this.search = value
      await this.refreshLists()
    },

    onEditList (list) {
      this.list = list
      this.$router.push(this.buildListLink(list))
    },

    buildListLink (list) {
      let listLink

      if (list.show_in_public_folder) {
        listLink = `/lists/public`
      } else {
        listLink = `/lists/user/${list.contact_folder_created_by}`
      }

      if (this.folderId) {
        listLink += `/folder/${this.folderId}`
      }

      listLink += `/list/${list.id}`

      return listLink
    },

    async loadMoreLists () {
      if (this.isLoadingMore || this.pagination.currentPage >= this.pagination.totalPages) {
        return
      }

      this.pagination.currentPage += 1
      await this.getLists(true)
      this.listsData.push(...this.lists)
    },

    onCreateList (event) {
      if (event) {
        event.preventDefault()
      }

      this.showUnsavedListDialog(() => {
        const params = {}
        if (this.folderId) {
          params.contact_folder_id = this.folderId
        }

        this.createListOpen(params)
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
    },

    generatefoldersPath (folder, folders = []) {
      // Add the current folder's name to the path ignoring root
      if (folder.parent_id) {
        folders.push(folder)
      }

      // Check if we've found the folder with the given ID
      if (folder.id === +this.folderId) {
        return folders
      }

      // If not, check the child folders recursively
      if (folder.child_folders) {
        for (let child of folder.child_folders) {
          const result = this.generatefoldersPath(child, [...folders]) // Pass a copy of the path
          if (result) return result
        }
      }

      if (!folder.parent_id) {
        return folders
      }

      return null
    },

    refreshFoldersPath () {
      if (this.folders?.length) {
        this.foldersPath = this.generatefoldersPath(this.folders[0])
      }
    },

    isColumnVisible (field) {
      switch (field) {
        case this.COLUMN_NAMES.owner_name:
          return this.isPublic || this.publicListsFilterSelected || this.personalListsFilterSelected
        case this.COLUMN_NAMES.show_in_public_folder:
          return this.isGlobalSearch
        default:
          return true
      }
    },

    onListMoved () {
      this.refreshLists()
    },

    resetFolder () {
      if (this.$route.params.userId) {
        this.$router.push(`/lists/user/${this.$route.params.userId}`)
      } else {
        this.$router.push(`/lists/user`)
      }
    },

    openAloAiBotContactsEnrollmentModal (list) {
      this.list = list
      if (this.$refs.enrollContactsToAloAiModal) {
        this.$refs.enrollContactsToAloAiModal.isOpen = true
        this.$refs.enrollContactsToAloAiModal.mode = 'add-contact-list'
      }
    },

    openChangeListOwnerModal (list) {
      this.list = list
      if (this.$refs.changeListOwnerModal) {
        this.$refs.changeListOwnerModal.isOpen = true
      }
    },

    onListOwnerChanged () {
      this.refreshLists()
    },

    listTypeFilterSelected (type) {
      return this.listTypesFilter.includes(type)
    },

    resetSearchFilters () {
      this.visibilityFilters = this.isPublic ? ['publicLists'] : ['myLists']
    },

    onShow ({ target }) {
      if (this.moveDialog?.open) {
        this.closeMoveDialog()
      }

      const el = target.closest('td')
      el.style.zIndex = '4'
    },

    onHide (event) {
      if (this.moveDialog?.open) {
        event.preventDefault()
        return
      }

      const { target } = event
      const el = target.closest('td')
      el.style.zIndex = '0'
    },

    onFilterChange () {
      this.refreshLists()
    },

    openImportContactsModal () {
      if (this.$refs.importContacts) {
        this.$refs.importContacts.open()
      }
    },

    onImportStarted () {
      this.refreshLists()
    },

    listCsvImportFinished (event) {
      if (!event?.contact_list) {
        return
      }

      // notify user if is one of the Lists he imported
      const list = this.listsImportedFromCsv.find((c) => c.id === event.contact_list.id)
      if (!list) {
        return
      }

      const listName = event.contact_list.name
      this.$generalNotification(`Contacts successfully imported into ${listName}`)
      this.refreshLists()
    },

    onColumnsReordered (columns) {
      this.fixedColumns = columns
    },

    onSortByField ({ orderBy, order }) {
      if (orderBy !== 'owner_name') {
        orderBy = orderBy === 'date_created' ? 'created_at' : orderBy
        orderBy = `contact_lists.${orderBy}`
      }

      this.sort = orderBy
      this.order = order
      this.refreshLists()
    }
  },

  mounted () {
    this.initFixedColumns()
    this.initializeLists()

    this.$VueEvent.listen('lists-management-folder-click', this.onFolderSelected)
    this.$VueEvent.listen('contact_list_import_csv', this.listCsvImportFinished)
  },

  beforeDestroy () {
    this.$VueEvent.stop('lists-management-folder-click', this.onFolderSelected)
    this.$VueEvent.stop('contact_list_import_csv')
  },

  watch: {
    '$route.params': function () {
      this.resetSearchFilters()

      this.SET_SEARCH('')
      this.search = ''
      this.refreshLists()
      this.refreshFoldersPath()
    },
    isPublic () {
      this.initFixedColumns()
    },
    publicListsFilterSelected () {
      this.initFixedColumns()
    },
    personalListsFilterSelected () {
      this.initFixedColumns()
    },
    folders () {
      this.SET_SEARCH('')
      this.search = ''
      this.refreshFoldersPath()
    },
    list () {
      if (this.list) {
        this.setCurrentListFilters(this.list.filters)
      }
    },
    userId () {
      this.resetSearchFilters()
    }
  }
}
</script>
