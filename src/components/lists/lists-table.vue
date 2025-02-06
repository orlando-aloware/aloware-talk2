<template>
  <div class="contacts mx-0 content-row d-flex overflow-hidden h-100">
    <lists-folders-management :is-loading="isLoading || isLoadingMore" />

    <div class="lists-container flex-grow-1 d-flex flex-column">
      <div class="d-flex justify-between items-start">
        <div class="px-3">
          <h3 class="title pl-3"> {{ title  }}</h3>
          <div class="count pl-3">
            <div class="d-flex align-items-center"
                v-if="!isPublic && !isLoading">
              <div class="d-flex align-items-center title-path mb-2">
                <router-link :to="buildFolderPath()">
                  <div class="title-breadcrumb d-flex align-items-center">All Folders</div>
                </router-link>
                <slash-icon class="title-slash d-flex align-items-center" v-if="foldersPath.length"/>
              </div>
              <template v-if="folderId">
                <div class="d-flex align-items-center title-path mb-2"
                     :key="folder.id"
                     v-for="(folder, index) in foldersPath">
                  <router-link :to="buildFolderPath(folder.id)">
                    <div class="title-breadcrumb d-flex align-items-center">
                      {{ folder.name == 'Root' ? 'Root Folder' : folder.name }}
                    </div>
                  </router-link>
                  <slash-icon class="title-slash d-flex align-items-center" v-if="(index + 1) < foldersPath.length"/>
                </div>
              </template>
            </div>

            <strong v-if="!isLoading">{{ listsCount }} List(s)</strong>

            <q-spinner-bars class="mr-1"
                            color="primary"
                            size="14px"
                            v-else />
        </div>
        <div class="filters pl-3">
          <div class="search">
            <search-input class="width-260"
                          data-testid="lists-search-input"
                          limit-search-characters
                          :search="search"
                          :disabled="isLoadingDisabled"
                          @search="onSearch" />
          </div>
        </div>

      </div>

        <div class="d-flex justify-between">
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

      <q-table class="lists-table"
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
              <div v-if="col.name === COLUMN_NAMES.name">
                <router-link class="d-flex align-items-center item contact-name"
                             data-testid="lists-view-list-name-link"
                             :to="buildListLink(props.row)">
                    {{ props.row.name }}
                </router-link>
              </div>
              <div v-if="col.name === COLUMN_NAMES.owner_name && isColumnVisible(col.name)">
                {{ props.row.owner_name }}
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.date_created">
                <relative-time humanized
                              :from-time="props.row[col.field]" />
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.no_of_contacts">
                {{ props.row.no_of_contacts }}
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.type">
                {{ getContactListType(props.row) }}
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.show_in_public_folder">
                {{ props.row.show_in_public_folder }}
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.source">
                <span v-if="props.row.source_name">
                  {{ props.row.source_name | ucwords }}
                </span>
                <span v-else>-</span>
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.import_status">
                <span v-if="props.row.import_status_name">
                  {{ props.row.import_status_name | ucwords }}
                </span>
                <span v-else>-</span>
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.imported_at">
                <relative-time humanized
                              :from-time="props.row[col.field]"
                              v-if="props.row[col.field]" />
                <span v-else>-</span>
              </div>
              <div v-else-if="col.name === COLUMN_NAMES.actions">
                <div class="d-flex justify-content-center context-menu">
                  <div class="operation-button">
                    <span class="cursor-pointer"
                          data-testid="lists-edit-button"
                          :id="`edit-list-${_uid}`"
                          @click="onEditList(props.row)">
                      <pencil-o-icon height="20"
                                    width="20"
                                    color="#62666E"/>
                      <b-tooltip custom-class="talk-table__tooltip"
                                 :target="`edit-list-${_uid}`">
                        Edit this List
                      </b-tooltip>
                    </span>
                  </div>

                  <div class="operation-button">
                    <span class="cursor-pointer"
                          data-testid="lists-enroll-sequence-button"
                          :id="`enroll-sequence-${_uid}`"
                          @click="onEnrollContactsToSequence(props.row)">
                      <add-sequence-icon height="20"
                                        width="20"
                                        color="#62666E"/>
                      <b-tooltip custom-class="talk-table__tooltip"
                                 :target="`enroll-sequence-${_uid}`">
                        Enroll contacts to sequence
                      </b-tooltip>
                    </span>
                  </div>

                  <div class="operation-button">
                    <span class="cursor-pointer"
                          data-testid="lists-add-power-dialer-button"
                          :id="`add-power-dialer-${_uid}`"
                          @click="onAddListToPowerDialer(props.row)">
                      <add-call-icon height="20"
                                    width="20"
                                    color="#62666E"/>
                      <b-tooltip custom-class="talk-table__tooltip"
                                 :target="`add-power-dialer-${_uid}`">
                        Add this list to Power Dialer
                      </b-tooltip>
                    </span>
                  </div>

                  <div class="accordion" :id="`accordion-${props.row.id}`">
                    <div class="operation-button">
                      <span class="cursor-pointer"
                            data-testid="lists-rename-button"
                            :id="`rename-list-${_uid}`"
                            @click="onRenameList(props.row)">
                        <pencil-icon height="20"
                                    width="20"
                                    color="#62666E"/>
                        <b-tooltip custom-class="talk-table__tooltip"
                                   :target="`rename-list-${_uid}`">
                          Rename this list
                        </b-tooltip>
                      </span>
                    </div>

                    <div class="operation-button">
                      <span class="cursor-pointer"
                            data-testid="lists-duplicate-button"
                            :id="`duplicate-list-${_uid}`"
                            @click="onDuplicateList(props.row)">
                        <duplicate-icon height="20"
                                  width="20"
                                  color="#62666E"/>
                        <b-tooltip custom-class="talk-table__tooltip"
                                   :target="`duplicate-list-${_uid}`">
                          Duplicate this list
                        </b-tooltip>
                      </span>
                    </div>

                    <div class="operation-button"
                        :data-popper-target="'list-' + props.row.id"
                        v-if="!isPublic">
                      <span class="cursor-pointer"
                            data-testid="lists-move-button"
                            :id="`move-list-${_uid}`"
                            data-action="move-item"
                            @click="onMoveList(props.row)">
                        <move-icon height="20"
                                  width="20"
                                  color="#62666E"/>
                        <b-tooltip custom-class="talk-table__tooltip"
                                   :target="`move-list-${_uid}`">
                          Move this list
                        </b-tooltip>
                      </span>
                    </div>

                    <div class="operation-button"
                        v-if="isAdmin">
                      <span class="cursor-pointer"
                            data-testid="change-list-owner-button"
                            :id="`change-owner-${_uid}`"
                            @click="openChangeListOwnerModal(props.row)">
                        <switch-icon height="20"
                                    width="20"
                                    color="#62666E" />
                        <b-tooltip custom-class="talk-table__tooltip"
                                   :target="`change-owner-${_uid}`">
                          Change List Owner
                        </b-tooltip>
                      </span>
                    </div>

                    <div class="operation-button">
                      <span class="cursor-pointer"
                            data-testid="lists-pin-button"
                            :id="`pin-list-${_uid}`"
                            @click="onPinList(props.row)">
                        <pin-icon height="20"
                                  width="20"
                                  color="#62666E"/>
                        <b-tooltip custom-class="talk-table__tooltip"
                                   :target="`pin-list-${_uid}`">
                          {{ pinnedLists.includes(props.row.id) ? 'Unpin' : 'Pin' }} this list
                        </b-tooltip>
                      </span>
                    </div>

                    <div class="operation-button"
                        v-if="hasShowInPublicFolderPermission">
                      <span class="cursor-pointer"
                            data-testid="lists-show-button"
                            :id="`show-public-${_uid}`"
                            @click="onShowInPublicFolderList(props.row)">
                        <eye-icon height="20"
                                  width="20"
                                  color="#62666E"
                                  v-if="!props.row.show_in_public_folder"/>
                        <eye-off-icon height="20"
                                      width="20"
                                      color="#62666E"
                                      v-else/>
                        <b-tooltip custom-class="talk-table__tooltip"
                                   :target="`show-public-${_uid}`">
                          Convert this list to {{ props.row.show_in_public_folder ? 'private' : 'public' }}
                        </b-tooltip>
                      </span>
                    </div>

                    <div class="operation-button">
                      <span class="cursor-pointer"
                            data-testid="lists-delete-button"
                            :id="`delete-list-${_uid}`"
                            @click="onDeleteList(props.row)">
                        <trash-icon height="20"
                                    width="20"
                                    color="#62666E"/>
                        <b-tooltip custom-class="talk-table__tooltip"
                                   :target="`delete-list-${_uid}`">
                          Delete this list
                        </b-tooltip>
                      </span>
                    </div>

                    <div class="operation-button">
                      <span class="cursor-pointer"
                            data-testid="lists-assign-button"
                            :id="`assign-contacts-${_uid}`"
                            @click="openAssignContacts(props.row)">
                        <arrow-right-icon height="20"
                                          width="20"
                                          color="#62666E"/>
                        <b-tooltip custom-class="talk-table__tooltip"
                                   :target="`assign-contacts-${_uid}`">
                          Assign Contacts
                        </b-tooltip>
                      </span>
                    </div>

                    <div class="operation-button"
                        v-if="shouldShowAloAi">
                      <span class="cursor-pointer"
                            data-testid="lists-aloai-button"
                            :id="`aloai-enroll-${_uid}`"
                            @click="openAloAiBotContactsEnrollmentModal(props.row)">
                        <add-user-icon height="20"
                                      width="20"
                                      color="#62666E" />
                        <b-tooltip custom-class="talk-table__tooltip"
                                   :target="`aloai-enroll-${_uid}`">
                          Enroll List in AloAi Text Bot
                        </b-tooltip>
                      </span>
                    </div>
                  </div>

                  <div class="operation-button accordion-button" @click="toggleAccordion(props.row.id)">
                    <span class="cursor-pointer" data-testid="lists-accordion-button"
                          :id="`lists-accordion-button-${props.row.id}`">
                      <caret-right-icon height="20"
                                        width="20"
                                        :class="{ 'rotate-180': accordionStates[props.row.id] }"
                                        color="#4caf50"/>
                      <b-tooltip custom-class="talk-table__tooltip"
                                 :target="`lists-accordion-button-${props.row.id}`">
                        {{ accordionStates[props.row.id] ? 'Hide actions' : 'See more actions' }}
                      </b-tooltip>
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

      <enroll-contacts-to-aloai-modal ref="enrollContactsToAloAiModal"
                                      :params="attachedParams()"
                                      :contactList="list" />

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
import CaretRightIcon from 'components/icons/caret-right-icon.vue'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { COLUMNS, columnsByViewportConfig, COLUMN_NAMES } from 'src/constants/lists/home-columns'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import { aclMixin, dataTableMixin, mainViewMixin } from 'src/plugins/mixins'
import ListsFoldersManagement from './lists-folders-management'
import SlashIcon from 'components/icons/slash-icon'
import AddUserIcon from 'components/icons/add-user-icon'
import EnrollContactsToAloaiModal from 'src/components/aloai/enroll-contacts-to-aloai-modal'
import SwitchIcon from 'components/icons/switch-icon'
import ChangeListOwnerModal from './change-list-owner-modal.vue'

export default {
  name: 'ListsTable',

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
    ListsFoldersManagement,
    SlashIcon,
    CompactBtn,
    AddUserIcon,
    EnrollContactsToAloaiModal,
    SwitchIcon,
    ChangeListOwnerModal,
    CaretRightIcon
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
      COLUMN_NAMES,
      foldersPath: [],

      // Filters
      showInPublicFolder: false,
      accordionStates: {}
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'pinned',
      'folders',
      'moveDialog',
      'isAllContactsSelected'
    ]),
    ...mapState(['users']),
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
        .filter((col) => this.isColumnVisible(col.field))
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
      return +this.$route.params.folderId
    }
  },

  methods: {
    ...mapActions('contacts', [
      'listPinToggled',
      'addPowerDialerOpen',
      'openMoveDialog',
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

    async initializeLists () {
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

      if (this.isPublic) {
        delete filters.user_id
        delete filters.folderId
      }

      try {
        await this.fetchLists({
          page: this.pagination.currentPage,
          perPage: this.pagination.perPage,
          isPublic: this.isPublic,
          filters
        })
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

    async onScroll ({ to, ref }) {
      if (this.isLoading) return

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
      this.getPinnedLists()
      this.listsData = []
      this.SET_LISTS_COUNT(0)
      await this.getLists()
      this.calculateTotalPages()
      this.pagination.currentPage = 1
      this.listsData = this.lists
      this.accordionStates = {}
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
      let listLink = `/lists/user/${this.userId}`

      if (this.folderId) {
        listLink += `/folder/${this.folderId}`
      }

      listLink += `/list/${list.id}`

      return listLink
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
          return this.isPublic
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

    toggleAccordion (accordionId) {
      const accordion = this.$el.querySelector('#accordion-' + accordionId)

      if (!accordion) {
        return
      }

      const buttons = accordion.querySelectorAll('.operation-button')
      const buttonWidth = 26
      const totalWidth = buttons.length * buttonWidth

      if (!this.accordionStates[accordionId]) {
        this.$set(this.accordionStates, accordionId, false)
      }

      if (this.accordionStates[accordionId]) {
        accordion.style.width = '0'
      } else {
        accordion.style.width = `${totalWidth}px`
        void accordion.offsetHeight
        accordion.style.width = `${totalWidth}px`
      }

      this.$set(this.accordionStates, accordionId, !this.accordionStates[accordionId])
    }
  },

  mounted () {
    this.initializeLists()

    this.$VueEvent.listen('lists-management-folder-click', this.onFolderSelected)
  },

  beforeDestroy () {
    this.$VueEvent.stop('lists-management-folder-click', this.onFolderSelected)
  },

  watch: {
    '$route.params': function () {
      this.SET_SEARCH('')
      this.search = ''
      this.refreshLists()
      this.refreshFoldersPath()
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
    }
  }
}
</script>
