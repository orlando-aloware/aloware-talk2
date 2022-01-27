<template>
  <contacts-screen v-if="list"
                   :loading="isLoadingDisabled">
    <template slot="title">
      <div class="d-flex flex-column">
        <div class="pr-2 contacts__title d-flex align-items-center">
          <back-button class="p-0"
                       v-if="$q.screen.lt.md"
                       @click="toggleSidebar"/>
          <div class="d-flex align-items-center">
            <div v-for="folderName in folderPath"
                 :key="folderName"
                 class="d-flex align-items-center title-path">
              <div class="title-breadcrumb d-flex align-items-center">{{ folderName }}</div>
              <slash-icon class="title-slash d-flex align-items-center" />
            </div>
          </div>
          <folder-static-icon class="title-static-icon mr-3"
                              v-if="list.type === ContactListTypes.STATIC">
          </folder-static-icon>
          <folder-dynamic-icon class="mr-3"
                               v-if="list.type === ContactListTypes.DYNAMIC">
          </folder-dynamic-icon>
          <div class="d-flex align-items-center">
            <span
              :class="`list-name ${isUnsavedList ? 'text-grey-30' : ''}`">
              {{ list.name || unsavedList.name }}
              <q-chip
                class="m-0 p-0"
                text-color="white"
                color="grey-80"
                style="margin-left:10px !important;"
                size="sm"
                v-if="isUnsavedList">
                Unsaved
              </q-chip>
            </span>
          </div>
        </div>
      </div>
    </template>
    <template slot="options" v-if="!isStartState">
      <compact-btn
        :class="`${isUnsavedList ? 'hidden' : ''}`"
        variant="primary"
        v-if="list.type === ContactListType.DYNAMIC && isEditable"
        :disabled="isFiltersOpen"
        @clicked="onFiltersClicked"
      >
        <i class="fa fa-plus mr-2"></i> Add Filters
      </compact-btn>
    </template>

    <template slot="actions">
      <div class="col-lg-6 px-0 mb-2 mb-lg-0 d-flex align-items-center">
        <div class="d-flex justify-content-between align-items-center">
          <search
            class="width-250"
            :search="search"
            @search="onSearch"
            :disabled="isLoadingDisabled">
          </search>
          <div class="contacts-total mobile">
            <div class="small text-muted fs-13 text-right" v-if="selectedList.type === ContactListTypes.DYNAMIC">{{ listItemsTotalContacts }} Contacts</div>
            <div class="small text-muted fs-13 text-right" v-else> {{ listItemsTotalContacts }} of {{ selectedList.contactCount }} Contacts</div>
          </div>
        </div>
        <div class="px-3 d-inline-flex"
             v-if="!isMyContactsView && !isTabletOrMobile">
          <q-tooltip
            class="text-center"
            anchor="top middle"
            self="bottom middle"
            max-width="185px"
            v-if="$route.params.id === 'unassigned'">
            Unable to modify Filters. Duplicate this list if you want to modify
          </q-tooltip>
          <label class="text-primary mr-2 mt-2 cursor-pointer"
                 :class="{ disabled: (isLoading || $route.params.id === 'unassigned') }">My Contacts</label>
          <b-form-checkbox
            id="my-contacts"
            class="mt-2 cursor-pointer"
            name="check-button"
            size="sm"
            switch
            :class="{ disabled: (isLoading || $route.params.id === 'unassigned') }"
            :disabled="isLoading || $route.params.id === 'unassigned'"
            v-model="myContacts"
            @change="onFetchMyContacts"
          >
          </b-form-checkbox>
        </div>
      </div>
      <div class="col-lg-6 px-0 d-flex align-items-center pr-2">
        <div class="flex-grow-1"></div>
        <div class="px-3 d-inline-flex"
             v-if="!isMyContactsView && isTabletOrMobile">
          <q-tooltip
            class="text-center"
            anchor="top middle"
            self="bottom middle"
            max-width="185px"
            v-if="$route.params.id === 'unassigned'">
            Unable to modify Filters. Duplicate this list if you want to modify
          </q-tooltip>
          <label class="text-primary mr-2 mt-2 cursor-pointer"
                 :class="{ disabled: (isLoading || $route.params.id === 'unassigned') }">My Contacts</label>
          <b-form-checkbox
            id="my-contacts"
            class="mt-2 cursor-pointer"
            name="check-button"
            size="sm"
            switch
            :class="{ disabled: (isLoading || $route.params.id === 'unassigned') }"
            :disabled="isLoading || $route.params.id === 'unassigned'"
            v-model="myContacts"
            @change="onFetchMyContacts"
          >
          </b-form-checkbox>
        </div>
        <div class="contacts-total desktop">
          <div
            class="small text-muted fs-13 text-right"
            v-if="selectedList.type === ContactListTypes.DYNAMIC">
            {{ listItemsTotalContacts }} Contacts
          </div>
          <div
            class="small text-muted fs-13 text-right"
            v-else>
            {{ listItemsTotalContacts }} of {{ selectedList.contactCount }} Contacts
          </div>
        </div>
        <hr role="separator" aria-orientation="vertical" class="contacts-header-separator q-separator height-28margin-auto position-relative q-separator q-separator--vertical">
        <div class="d-flex align-items-center pr-2"
             :class="['btn-filter-wrapper mr-2', isFiltersOpen ? 'background' : '' ]">
          <compact-btn borderless
                       customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable filter-toggle-button d-flex align-items-center"
                       variant="outlined-light"
                       v-if="hasAppliedFilters"
                       :disabled="isResetDisabled"
                       @clicked="resetFilters">
            <close-icon width="14px"
                        height="14px"
                        icon-color="#62666E">
            </close-icon>
          </compact-btn>
          <compact-btn borderless
                       variant="outlined-light"
                       customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable filter-toggle-button d-flex align-items-center"
                       :disabled="isStartState"
                       @clicked="onFiltersClicked">
            <span class="pl-2 pr-2 d-flex filter-toggle-button align-items-center">Filters</span>
            <b-badge v-if="hasAppliedFilters"
                     class="d-flex align-items-center contact-filter-count"
                     pill
                     variant="primary">
              {{ filtersCount }}
            </b-badge>
          </compact-btn>
        </div>

        <compact-btn
          variant="primary"
          v-if="selectedList.type !== ContactListType.STATIC && !['all', 'my-contacts', 'unassigned', 'unanswered', 'new-leads'].includes(selectedList.id)"
          :disabled="!filterHasChanges || this.defaultIds.includes(this.id) || isUpdatingList"
          :customClass="saveFilterButtonCustomClass"
          @clicked="onUpdateContactList">
          <q-spinner-bars v-if="isUpdatingList"
                          color="white"
                          class="mr-1"/>
          {{ isUpdatingList ? ' Saving...' : 'Save' }}
        </compact-btn>
        <b-dropdown text="Add Contacts"
                    right
                    no-caret
                    variant="light"
                    class="m-2 b-compact-dropdown-button text-bold text-black dropdown-white filter-toggle-button"
                    toggle-class="filter-toggle-button py-0 my-0 d-flex align-items-center"
                    v-if="(list.type === ContactListType.STATIC && isEditable) || this.id === 'all'">
          <template #button-content class="filter-toggle-button">
            <div class="filter-toggle-button d-flex align-items-center">
              Add Contacts
            </div>
            <i class="fa fa-chevron-down fs-12 filter-toggle-button d-flex align-items-center ml-2 text-grey-90"
               style="margin-top: 2px;"></i>
          </template>
          <b-dropdown-item href="#"
                           :disabled="!(list.type === ContactListType.STATIC && isEditable)"
                           v-b-tooltip.hover="{ placement: 'top', title: (!(list.type === ContactListType.STATIC && isEditable) ? 'Unable to modify Filters. Duplicate this list if you want to modify' : null), customClass: 'q-tooltip q-tooltip--style no-pointer-events' }"
                           @click="onAddContactsToList">
            <search-icon color="#62666E">
            </search-icon>
            Select Existing Contacts & Add to List
          </b-dropdown-item>
          <b-dropdown-item href="#"
                           @click="onShowCreateContact">
            <plus-icon color="#62666E"></plus-icon>
            Create New Contact & Add to List
          </b-dropdown-item>
        </b-dropdown>

        <contact-create-modal :id="createContactModalId"
                              @created="onContactCreated"></contact-create-modal>

        <b-dropdown text="..."
                    no-caret
                    right
                    variant="light"
                    class="m-2 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown">
          <template #button-content>
            <ellipse-icon></ellipse-icon>
          </template>
          <b-dropdown-item href="" @click="onEditColumnsClicked">
            <edit-hamburger-icon></edit-hamburger-icon>
            Edit Columns
          </b-dropdown-item>
          <b-dropdown-item href="#" :disabled="true">
            <power-dialer-mobile-icon width="14" height="14" color="#62666E"></power-dialer-mobile-icon>
            Power Dialer
          </b-dropdown-item>
          <b-dropdown-item href="#" :disabled="true">
            <export-icon></export-icon>
            Export as CSV
          </b-dropdown-item>
          <b-dropdown-item href=""
                           :disabled="isListDeletable"
                           v-b-tooltip.hover="{ placement: 'top', title: (isListDeletable ? 'Unable to modify Filters. Duplicate this list if you want to modify' : null), customClass: 'q-tooltip q-tooltip--style no-pointer-events' }"
                           @click="onRemoveList">
            <delete-red-icon></delete-red-icon>
            <span class="text-danger">
              Delete
            </span>
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </template>
    <template slot="actions">
      <bulk-action-menu :id="id" v-if="checked.length > 0"></bulk-action-menu>
    </template>

    <template slot="table">
      <datatable
        :stickyHeaders="true"
        :columns="columns"
        :hasMore="hasMore"
        :isEmpty="isEmpty || isStartState"
        :isLoadingMore="isLoadingMore"
        :is-loading="isLoading"
        :contact-list-id="id"
        :paginated="true"
        :show-pagination="!isStartState"
        :total-rows="listItems[id].total"
        :current-page="listItems[id].current_page"
        :last-page="listItems[id].last_page"
        @reordered="onColumnsReordered"
        @checked="onCheckAllItems"
        @sort="onSortByField"
        @paginated="onPaginate"
        @more="onLoadMore">
        <template slot="tbody">
          <table-row
            v-for="(contact, index) in listItems[id].data"
            :key="contact.id + index + Math.random()"
            :contact="contact"
            :columns="columns"
            :checked="checked"
            :contactListId="id"
            @checked="onCheckedRows"
          />
        </template>

        <template slot="empty" v-if="isStartState">
          <router-link
            v-slot="{ navigate }"
            :to="'/contacts/list/' + $route.params.id + '/add'"
          >
            <div class="start-state" @click="navigate">
              <div
                class="p-4 bg-light w-100 text-center border-bottom text-primary"
              >
                <template v-if="list.type == ContactListType.STATIC">
                  Add contacts <i class="fa fa-plus"></i>
                </template>
                <template v-else-if="list.type == ContactListType.DYNAMIC">
                  Add Contacts through a Filter <i class="fa fa-plus"></i>
                </template>
              </div>
            </div>
          </router-link>
        </template>
      </datatable>
    </template>
    <template slot="filters">
      <contacts-filters @filtersUpdated="updateFilterHasChanges"/>
    </template>
    <template slot="footer">
      <import-contacts-modal ref="importContacts" />
    </template>
  </contacts-screen>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'
import _ from 'lodash'
import BulkActionMenu from 'src/components/bulk-action-menu'
import CompactBtn from 'src/components/compact-btn.vue'
import ContactsScreen from 'src/components/contacts/contacts-screen.vue'
import Datatable from 'src/components/datatable.vue'
import ImportContactsModal from 'src/components/import-contacts-modal.vue'
import TableRow from 'src/components/table-row.vue'
import ContactsFilters from 'src/components/contacts/contacts-filters'
import { FROM_FILTERS } from 'src/constants/contacts-list-create-mode'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
import ContactCreateModal from 'components/contacts/contact-create-modal'
import talk2Api from 'src/plugins/api/api'
import FolderStaticIcon from 'components/icons/folder-static-icon'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon'
import CloseIcon from 'components/icons/close-icon'
import SlashIcon from 'components/icons/slash-icon'
import EllipseIcon from 'components/icons/ellipse-icon'
import SearchIcon from 'components/icons/search-icon'
import PlusIcon from 'components/icons/plus-icon'
import Search from 'components/search'
import EditHamburgerIcon from 'components/icons/edit-hamburger-icon'
import PowerDialerMobileIcon from 'components/icons/mobile-menu/power-dialer-mobile-icon'
import ExportIcon from 'components/icons/export-icon'
import DeleteRedIcon from 'components/icons/delete-red-icon'
import BackButton from 'components/back-button'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  components: {
    BackButton,
    DeleteRedIcon,
    ExportIcon,
    PowerDialerMobileIcon,
    EditHamburgerIcon,
    Search,
    PlusIcon,
    SearchIcon,
    EllipseIcon,
    SlashIcon,
    CloseIcon,
    FolderDynamicIcon,
    FolderStaticIcon,
    ContactCreateModal,
    ContactsFilters,
    BulkActionMenu,
    CompactBtn,
    ContactsScreen,
    Datatable,
    ImportContactsModal,
    TableRow
  },

  mixins: [contactsMixins],

  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },

  data () {
    return {
      filterHasChanges: false,
      defaultContactLists: DEFAULT_PINNED_LIST,
      isUpdatingList: false,
      folderPath: [],
      createContactModalId: 'contacts-list-create-contact-modal'
    }
  },

  methods: {
    ...mapActions('contacts', [
      'columnsOpen',
      'openFilters',
      'closeFilters',
      'contactsLoaded',
      'columnsReordered',
      'setListSelectedContacts',
      'createListOpen',
      'setCurrentListFilters',
      'removeListOpen',
      'resetSearch',
      'setShouldUpdateSelectedListContactCount',
      'setSelectedListContactCount',
      'pinnedCountLoaded',
      'setShowContactsListSidebar',
      'createListClose',
      'foldersLoaded',
      'setUnsavedList'
    ]),
    onColumnsReordered (nextColumns) {
      this.columnsReordered({
        id: this.id,
        headers: nextColumns
      })
    },
    onCheckAllItems (checked) {
      let items = []
      let _this = this
      document
        .querySelectorAll('.checker')
        .forEach(function (checkbox) {
          if (checked) {
            items.push(_this.listItems[_this.id].data.find(item => item.id === Number(checkbox.value)))
          } else {
            items = items.filter(item => item.id !== Number(checkbox.value))
          }
        })

      this.setListSelectedContacts({ id: this.id, contacts: items })
    },
    onCheckedRows (checked) {
      this.setListSelectedContacts({ id: this.id, contacts: checked })
    },
    onEditColumnsClicked () {
      this.columnsOpen({
        id: this.id,
        headers: this.columns,
        name: this.list.name
      })
    },
    onImportContactsClicked () {
      this.$refs.importContacts.open()
    },
    onFiltersClicked () {
      if (this.isFiltersOpen) {
        this.closeFilters()
      } else {
        this.openFilters()
      }
    },
    onCreateStaticList () {
      this.createListOpen({
        type: 1,
        mode: FROM_FILTERS,
        contact_folder_id: null
      })
    },
    onCreateDynamicList () {
      this.createListOpen({
        type: 2,
        mode: FROM_FILTERS,
        contact_folder_id: null
      })
    },
    onUpdateContactList () {
      if (this.selectedList.type === this.ContactListType.STATIC || this.defaultIds.includes(this.id)) {
        return
      }
      this.isUpdatingList = true
      if (_.isEmpty(this.unsavedList)) {
        console.log('Updating existing dynamic list...')
        return this.$axios
          .put('/api/v2/contacts-list/' + this.selectedList.id, { filters: this.currentListFilters })
          .then(() => {
            this.setSelectedListContactCount(this.listItemsTotalContacts)
            this.initialListFilters = this.currentListFilters
            this.updateFilterHasChanges()
            this.isUpdatingList = false
            this.$generalNotification('Changes to contact list has been saved.')

            this.pinnedCountLoaded({
              id: this.selectedList.id,
              count: this.listItems[this.selectedList.id].total
            })
          })
          .catch((_err) => {
            this.$generalNotification('Unable to update contact list.', 'error')
          })
      } else {
        console.log('Creating new dynamic list...')
        // debugger
        let params = this.unsavedList.params
        params.filters = this.currentListFilters
        return this.$axios
          .post('/api/v2/contacts-list', params)
          .then((response) => {
            const data = response.data.data
            const message = response.data.message

            this.createListClose()

            this.$generalNotification(message)

            this.loadFolders()
            this.setUnsavedList(null)
            this.$router.push(`/contacts/list/${data.id}`)
          })
          .catch((error) => {
            const { message, html } = extractErrorMessage(error)
            console.log(html)
            this.errorMsg = message
            this.$generalNotification(message, 'error')
          })
          .finally(() => {
            this.isUpdatingList = false
          })
      }
    },
    loadFolders () {
      this.$axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },
    onShowCreateContact (e) {
      this.$root.$emit('bv::show::modal', this.createContactModalId, e.target)
      e.stopImmediatePropagation()
    },
    onAddContactsToList () {
      this.$router.push(`/contacts/list/${this.$route.params.id}/add`)
    },
    onRemoveList () {
      this.removeListOpen({ id: this.selectedList.id, name: this.selectedList.name })
    },
    hasFilterChanges () {
      return JSON.stringify(this.initialListFilters) !== JSON.stringify(this.currentListFilters)
    },
    updateFilterHasChanges () {
      this.filterHasChanges = this.hasFilterChanges()
    },
    resetFilters (resetSearch = false) {
      const defaultFilters = this.fixDefaultFilters()
      this.setCurrentListFilters(defaultFilters)
      if (resetSearch) {
        this.resetSearch()
      }
      this.$VueEvent.fire('filters-reset')
      this.filterHasChanges = false
    },
    onContactCreated (contact) {
      if (this.list.type === this.ContactListType.STATIC) {
        talk2Api.V2.contactListItem.addContact(this.id, [contact]).then(res => {
          this.setShouldUpdateSelectedListContactCount(true)
          this.fetch()
        })
      } else {
        this.fetch({
          page: this.listItems[this.id].current_page
        })
      }
    },
    generateFolderPath (folders = [], folderNames = [], level = 0) {
      let tempFolderNames = _.clone(folderNames)

      if (!folders.length && level > 0) {
        return [tempFolderNames, false]
      }

      for (let item of folders) {
        if (level > 0) {
          tempFolderNames.push(item.name)
        } else {
          tempFolderNames = []
        }

        let found = false

        if (item.lists.length) {
          for (let list of item.lists) {
            const isNotNumber = isNaN(this.id / 1)

            if (isNotNumber || (!isNotNumber && list.id !== parseInt(this.id))) {
              continue
            }

            if (level === 0) {
              return []
            }

            return [tempFolderNames, true]
          }
        }

        const childFolders = _.get(item, 'child_folders', [])

        if (childFolders.length === 0 && !found) {
          tempFolderNames.pop()
        }

        if (childFolders.length === 0 && found) {
          return [tempFolderNames, found]
        }

        [tempFolderNames, found] = this.generateFolderPath(item.child_folders, tempFolderNames, (level + 1))

        if (found && level > 0) {
          return [tempFolderNames, found]
        }

        if (found && level === 0) {
          return tempFolderNames
        }

        tempFolderNames.pop()
      }

      if (level > 0) {
        return [tempFolderNames, false]
      }

      return []
    },

    toggleSidebar () {
      this.setShowContactsListSidebar(!this.showContactsListSidebar)
    },

    reRouteToBase () {
      if (this.id === 'unsaved' && _.isEmpty(this.unsavedList)) {
        this.$router.push(`/contacts`)
      }
    }
  },

  computed: {
    ...mapGetters('auth', [
      'profile'
    ]),
    ...mapState('contacts', [
      'folders',
      'showContactsListSidebar',
      'shouldUpdateSelectedListContactCount'
    ]),
    ...mapGetters('contacts', [
      'lists',
      'listItems',
      'selectedContacts',
      'isFiltersOpen',
      'selectedList',
      'currentListFilters',
      'unsavedList'
    ]),
    ...mapState([
      'isTabletOrMobile'
    ]),
    checked () {
      return this.selectedContacts[this.id] || []
    },
    saveFilterButtonClass () {
      return {
        'disabledButton': this.selectedList.type === this.ContactListType.STATIC ||
          (this.selectedList.type === this.ContactListType.DYNAMIC &&
            !this.filterHasChanges) ||
          this.defaultIds.includes(this.id)
      }
    },
    listItemsDataCount () {
      const total = _.get(this.listItems, `[${this.id}].data.length`, null)
      return total !== null ? total : 0
    },
    listItemsTotalContacts () {
      const total = _.get(this.listItems, `[${this.id}].total`, null)
      return total !== null ? total : 0
    },
    filterButtonVariant () {
      return this.isFiltersOpen ? 'primary' : 'outlined-light'
    },
    filterBadgeVariant () {
      return this.isFiltersOpen ? 'light' : 'primary'
    },
    resetButtonVariant () {
      return this.filterHasChanges ? 'primary' : 'outlined-light'
    },
    saveFilterButtonVariant () {
      return this.filterHasChanges ? 'primary' : 'secondary'
    },
    saveFilterButtonCustomClass () {
      return !this.filterHasChanges ? 'button-disabled' : ''
    },
    isResetDisabled () {
      return !this.filterHasChanges
    },
    isListDeletable () {
      // eslint-disable-next-line no-unused-vars
      for (const [key, list] of Object.entries(this.defaultContactLists)) {
        if (list.id === this.selectedList.id) {
          return true
        }
      }

      return false
    },
    hasAppliedFilters () {
      return this.filtersCount > 0
    },
    isUnsavedList () {
      return this.id === 'unsaved' && !_.isEmpty(this.unsavedList)
    }
  },

  mounted () {
    this.reRouteToBase()
    this.setShouldUpdateSelectedListContactCount(true)
    this.fetch()
    // force close filter
    this.closeFilters()
    this.folderPath = this.generateFolderPath(this.folders)
  },

  watch: {
    '$route.params.id': function () {
      if (this.$route.name === 'Contacts') {
        this.resetFilters()
        this.initialListFilters = this.currentListFilters
        this.myContacts = false
        this.setShouldUpdateSelectedListContactCount(true)
      }
    },
    currentListFilters: {
      deep: true,
      handler: function () {
        if (this.$route.name === 'Contacts') {
          let params = typeof this.currentListFilters === 'string' ? {} : this.currentListFilters
          this.fetch(params)
          this.filtersCount = this.getFiltersCount(this.currentListFilters)
        }
      }
    },
    selectedList: function (value) {
      if (this.selectedContacts[value.id]) {
        this.setListSelectedContacts({ id: value.id, contacts: [] })
      }
      this.folderPath = this.generateFolderPath(this.folders)
    },
    shouldUpdateSelectedListContactCount (val) {
      if (val) {
        this.setShouldUpdateSelectedListContactCount(true)
        this.fetch()
      }
    },
    id () {
      this.reRouteToBase()
    }
  }
}
</script>
