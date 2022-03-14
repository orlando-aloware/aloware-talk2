<template>
  <PowerDialerViewScreen
    v-if="list"
    :loading="isLoading">dsd

    <template slot="title">
      <Breadcrumbs :directory-list="folders" />
    </template>

    <template slot="options">
      <div class="text-13 pr-3 border-right right-spacing-2">
        {{ numberOfContacts }} Contacts
      </div>
      <StartDialing
        :disabled-trigger="numberOfContacts === 0"
        :list="filteredList"
        @start="beginDial" />
    </template>

    <template slot="actions">
      <div>
        <SummaryInfoLabels />
        <b-container fluid class="bv-example-row m-0 p-0 pb-0 border-bottom">
          <b-row
            class="pr-2 pt-4 pb-3"
            v-if="$q.screen.name !== 'lg'">
            <b-col cols="12">
              <div class="d-flex">
                <PowerDialerFilter
                  v-if="activeRoute"
                  :id="selectedListId"
                  :filter="filter"
                  :active-route="activeRoute" />
              </div>
            </b-col>
          </b-row>
          <b-row class="pr-2 pt-4">
            <b-col class="p-0 pr-2 m-0">
              <div class="d-flex">

                <SearchList
                  :search="search"
                  @search="onSearch"
                  class="width-250" />

              </div>
            </b-col>
            <b-col
              cols="8"
              v-if="$q.screen.name === 'lg'">
              <div class="d-flex">
                <PowerDialerFilter
                  v-if="activeRoute"
                  :id="selectedListId"
                  :filter="filter"
                  :active-route="activeRoute" />
              </div>
            </b-col>
            <b-col class="p-0">
              <div class="d-flex float-right">

                <b-dropdown text="Add Contacts"
                  right
                  no-caret
                  variant="light"
                  class="m-0 mb-3 b-compact-dropdown-button text-bold text-black dropdown-white filter-toggle-button"
                  toggle-class="filter-toggle-button py-0 my-0 d-flex align-items-center">
                  <template
                    #button-content class="filter-toggle-button">
                    <div
                      class="filter-toggle-button d-flex align-items-center"
                      style="margin-top: -2px;font-size:13px;">
                      Add Contacts
                    </div>
                    <i
                      class="fa fa-chevron-down fs-12 filter-toggle-button d-flex align-items-center ml-2"
                      style="margin-top: 2px;font-size: 9px !important;position: relative;top: -2px;">
                    </i>
                  </template>
                  <b-dropdown-item
                    href="#"
                    @click="onAddContactsToList">
                    <i class="fa fa-search mr-1"></i>
                    Select Contacts
                  </b-dropdown-item>
                  <b-dropdown-item
                    href="#"
                    v-b-modal:create-contact-modal>
                    <i class="fa fa-plus mr-1"></i>
                    Create Contact
                  </b-dropdown-item>
                </b-dropdown>

                <ContactCreateModal
                  @created="onContactCreated">
                </ContactCreateModal>

                <b-dropdown
                  text="..."
                  no-caret
                  right size="sm"
                  variant="white"
                  class="m-0 mb-3 ml-2 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown">
                  <template #button-content>
                    <i class="fa fa-ellipsis-h"></i>
                  </template>
                  <b-dropdown-item
                    @click="onEditColumnsClicked"
                    href="#">
                    <i class="fa fa-bars mr-1"></i>
                    Edit Columns
                  </b-dropdown-item>
                  <b-dropdown-item
                    href="#"
                    @click="exportAsCsv">
                    <i class="fa fa-file-csv mr-1"></i>
                    Export as CSV
                  </b-dropdown-item>
                  <b-dropdown-item
                    href="#"
                    @click="onClearList"
                    v-if="isMyQueue">
                    <i class="fa fa-trash-alt mr-1 text-red"></i>
                    <span class="text-red">Clear</span>
                  </b-dropdown-item>
                  <b-dropdown-item
                    href="#"
                    @click="onRemoveList"
                    v-else>
                    <i class="fa fa-trash-alt mr-1 text-red"></i>
                    <span class="text-red">Delete</span>
                  </b-dropdown-item>
                </b-dropdown>

              </div>
            </b-col>
          </b-row>
        </b-container>
      </div>
    </template>

    <template slot="actions">
      <BulkActionMenu
        v-if="checked.length > 0"
        :id="selectedListId"
        @moved-contacts="fetch({}, false)" />
    </template>

    <template slot="table">
      <Datatable
        :stickyHeaders="true"
        :columns="filteredColumns"
        :has-more="hasMore"
        :is-empty="isEmpty || isStartState"
        :is-loading-more="isLoadingMore"
        :is-loading="isLoading"
        :contact-list-id="selectedListId"
        :paginated="false"
        :show-pagination="!isStartState"
        scroll-area-class="pd-datatable"
        :total-rows="totalRows"
        :current-page="currentPage"
        :last-page="lastPage"
        @reordered="onColumnsReordered"
        @checked="onCheckAllItems"
        @sort="onSortByField"
        @paginated="onPaginate"
        @more="onLoadMore">
        <template slot="tbody">
          <TableRow
            v-for="(contact, nkey) in fixedContactsData.data"
            :key="`${contact.id}-${nkey}`"
            :contact="contact"
            :columns="filteredColumns"
            :checked="checked"
            :contactListId="selectedListId"
            :custom-row-content="true"
            @checked="onCheckedRows">
            <template slot="custom-content">
              <template v-for="(column, key) in filteredColumns">
                <!-- change date added to date created -->
                <!-- COLUMN: Checkboxes -->
                <!-- <div :key="`key-${key}`">{{contact}}</div> -->
                <td
                  v-if="column.name === 'checkbox'"
                  :key="key"
                  class="p-0 text-left pull-left datatable-row__checkbox">
                  <CheckBox
                    :resource="contact"
                    :checked-items="checked"
                    @checked="onCheckboxCheck" />
                </td>
                <!-- COLUMN: Name  -->
                <td
                  v-else-if="column.name === 'name'"
                  :key="column.name"
                  class="datatable-row__name">
                  <NameWrapper
                    :resource="contact"
                    link-path="/contacts/" />
                </td>
                <!-- COLUMN: Phone Number -->
                <td
                  v-else-if="column.name === 'phone_number'"
                  :key="column.name"
                  class="datatable-row__phone">
                  <div
                    v-if="contact.phone_number"
                    :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                    {{ contact.phone_number | fixPhone('NATIONAL', true) }}
                  </div>
                  <span v-else class="ml-1 text-grey-7 text-center">--</span>
                </td>
                <!-- COLUMN: Date Added/Created At -->
                <td
                  class="text-left"
                  :key="column.name"
                  v-else-if="column.name === 'created_at'">
                  <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                    {{ contact.created_at | fixDate }}
                  </div>
                </td>
                <!-- COLUMN: Tags -->
                <td
                  v-else-if="column.name === 'tags'"
                  :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="column.name">
                  <TagPopover
                    :resource="contact" />
                </td>
                <!-- COLUMN: Status -->
                <td
                  v-else-if="column.name === 'task_status'"
                  :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="key">
                  <StatusChip
                    :status="contact.task_status"
                    size="12px"
                    :outline="true" />
                </td>
                <td
                  v-else-if="column.name === 'actions'"
                  :key="key">
                  <button
                    @click="onRemove(contact)"
                    class="btn btn-sm btn-link datatable-row__actions__action--trash">
                    <TrashOIcon />
                  </button>
                </td>
                <td
                  v-else
                  :key="key"
                  class="col-indented-2">
                  {{ contact[column.name] }}
                </td>
              </template>
            </template>
          </TableRow>
        </template>
      </Datatable>

      <ConfirmDialog
        v-model="isOpen"
        @close="closeModal"
        :id="dialogName"
        :is-open="isOpen"
        :hide-header="true"
        :hide-footer="true"
        title="Are you really really sure?"
        size="sm"
        v-if="selectedItem">
        <div slot="content">
          <div class="text-center text-h6 pb-4">
            <TrashOIcon height="20" width="20" />
            Remove Contact?
          </div>
          <div class="text-center py-3">
            <div class="text-dark">
              <div v-html="`Do you want to remove the contact: ${fullname}?`"></div>
            </div>
          </div>
          <div class="row text-center pt-3 pb-0">
            <div class="col-6 p-1">
              <b-button
                variant="dark-grey"
                class="f-btn--cancel"
                size="sm"
                block
                @click="closeModal">
                Cancel
              </b-button>
            </div>
            <div class="col-6 p-1">
              <b-button
                variant="danger"
                size="sm"
                block
                @click="onDeleteContact">
                Remove
              </b-button>
            </div>
          </div>
        </div>
      </ConfirmDialog>

    </template>
  </PowerDialerViewScreen>
</template>

<script>

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import PowerDialerViewScreen from 'src/components/power-dialer/power-dialer-view-screen'
import PowerDialerFilter from 'src/components/power-dialer/details/power-dialer-filters'
import SummaryInfoLabels from 'src/components/power-dialer/details/summary-info-labels'
import Datatable from 'src/components/datatable'
import TableRow from 'src/components/table-row'
import SearchList from 'src/components/search'
import StartDialing from 'src/components/power-dialer/session-settings/start-dial-sessions-settings'
import StatusChip from 'src/components/status-chip'
import TagPopover from 'src/components/tag-popover'
import CheckBox from 'src/components/checkbox-interactive'
import NameWrapper from 'src/components/name-wrapper'
import Breadcrumbs from 'src/components/breadcrumbs'
import TrashOIcon from 'components/icons/trash-o-icon'
import ConfirmDialog from 'components/confirm-dialog'
import BulkActionMenu from 'src/components/bulk-action-menu-2'
import ContactCreateModal from 'components/contacts/contact-create-modal'
import powermixin from 'src/plugins/mixins/power-dialer'
import pdMixin from 'src/plugins/mixins/power-dialer-init.mixin'
// import contactsMixins from 'src/plugins/mixins/contacts.mixin'
import talk2Api from 'src/plugins/api/api'
import { POWER_DIALER_DEFAULT_COLUMNS } from 'src/constants/contacts-columns'
import { POWER_DIALER_ROUTE_META_ID } from 'src/constants/power-dialer/power-dialer'
import { isEqual, isEmpty } from 'lodash'

export default {
  name: 'PowerDialerView',
  props: {
    list: {
      type: Object,
      default: () => {}
    },
    isLoadingDisabled: {
      type: Boolean,
      default: false
    },
    isStartState: {
      type: Boolean,
      default: false
    },
    isEditable: {
      type: Boolean,
      default: false
    },
    search1: {
      type: String,
      default: ''
    },
    isMyContactsView: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    },
    isEmpty: {
      type: Boolean,
      default: false
    },
    isLoadingMore: {
      type: Boolean,
      default: false
    },
    filtersCount: {
      type: Number,
      default: 0
    },
    customRowContent: {
      type: Boolean,
      default: false
    },
    selectedListId: {
      type: [String, Number],
      default: null
    }
  },
  mixins: [powermixin, pdMixin],

  inject: [
    'contactsData'
  ],

  components: {
    PowerDialerViewScreen,
    PowerDialerFilter,
    Datatable,
    SearchList,
    SummaryInfoLabels,
    StartDialing,
    TableRow,
    StatusChip,
    TagPopover,
    CheckBox,
    NameWrapper,
    TrashOIcon,
    ConfirmDialog,
    Breadcrumbs,
    ContactCreateModal,
    BulkActionMenu
  },
  mounted () {
    this.removeListClose()
    this.loadList(this.selectedListId)
  },
  computed: {
    ...mapState(['prevRoute']),
    ...mapState('powerDialer', [
      // 'activeMetrics',
      'metrics'
    ]),
    ...mapGetters('powerDialer', [
      'contactResources',
      'powerDialerLists',
      'powerDialerDirectoryList',
      'datatableLoader',
      'myQueue',
      'activeFilter'
    ]),
    ...mapGetters('contacts', [
      'contact',
      'folders',
      'lists',
      'listItems',
      'selectedContacts',
      'selectedList',
      'isFiltersOpen',
      'currentListFilters',
      'clearList'
    ]),
    filter () {
      return this.activeFilter
    },
    routeId () {
      return POWER_DIALER_ROUTE_META_ID
    },
    activeRoute () {
      switch (this.$route.meta.title) {
        case this.routeId['power-dialer']:
        case this.routeId['queue-filter']:
          return '/power-dialer'
        case this.routeId['list-filter']:
          return this.$route.path
        case this.routeId['list']:
          return `/power-dialer/list/${this.$route.params.id}`
        default:
          return '/power-dialer/list'
      }
    },
    numberOfContacts () {
      return this.activeList.length
    },
    activeList () {
      return this.listItems[this.selectedListId]?.data || []
    },
    hasContacts () {
      return this.activeList.length > 0
    },
    pdColumns () {
      return POWER_DIALER_DEFAULT_COLUMNS
    },
    filteredColumns () {
      if (!isEmpty(this.columns)) {
        return this.columns
      }
      return this.pdColumns
    },
    totalRows () {
      return this.listItems?.[this.selectedListId]?.total || 0
    },
    currentPage () {
      return this.listItems?.[this.selectedListId]?.current_page || 1
    },
    lastPage () {
      return this.listItems?.[this.selectedListId]?.last_page || 0
    },
    fullname () {
      return `${this.selectedItem.first_name} ${this.selectedItem.last_name}`
    },
    deleteEndpoint () {
      return `/api/v2/power-dialer-lists/${this.selectedList.id}/items/${this.selectedItem.contact_list_item_id}`
    },
    isMyQueue () {
      return this.selectedListId === 'my-queue'
    },
    filteredList () {
      if (this.selectedListId === 'my-queue') {
        return this.myQueue
        // return this.lists['my-queue']
      }
      return this.list
    },
    hasMore () {
      return (this.fixedContactsData?.next_page_url &&
          !this.isLoadingMore &&
          !this.isLoading) ||
        false
    },
    fixedContactsData () {
      if (isEqual(this.$parent.$data.contactsData, this.contactsData)) {
        return this.$parent.$data.contactsData
      }

      return this.contactsData
    }
  },
  data () {
    return {
      selectedItem: null,
      hasFilters: false
    }
  },
  methods: {
    ...mapMutations('powerDialer', [
      'SET_LIST_SELECTED_CONTACTS',
      'START_DIAL_TOGGLE'
    ]),
    // ...mapActions('inbox', [
    //   'setSelectedContact'
    // ]),
    ...mapActions('contacts', [
      'setContact',
      'columnsOpen',
      'openFilters',
      'closeFilters',
      'columnsReordered',
      'setListSelectedContacts',
      // 'setSelectedList',
      'createListOpen',
      'removeListClose',
      'setCurrentListFilters',
      'removeListOpen',
      'resetSearch',
      'setShouldUpdateSelectedListContactCount',
      // 'setSelectedListContactCount',
      'pinnedCountLoaded'
    ]),
    ...mapActions('powerDialer', [
      'updateContactsList',
      'exportCsv'
    ]),
    onSearch (searchText) {
      this.$emit('search', searchText)
    },
    onFetchMyContacts (checked) {
      this.$emit('checkboxChanged', checked)
    },
    onSortByField (sorts) {
      this.$emit('sort', sorts)
    },
    onPaginate (params) {
      this.$emit('paginated', params)
    },
    onLoadMore () {
      this.$emit('loadMore')
    },
    async exportAsCsv () {
      let response = await this.exportCsv(this.selectedList.id)
      console.log('CSV response :>> ', response)
    },
    async beginDial () {
      this.START_DIAL_TOGGLE(true)
      // this.setSelectedContact({})
      this.setContact(this.contact)
      this.$router.push(`/power-dialer/list/${this.filteredList.id}/sessions`)
    },
    onAddContactsToList () {
      if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
        this.$router.push(`/power-dialer/list/add`)
      } else {
        this.$router.push(`/power-dialer/list/${this.$route.params.id}/add`)
      }
    },
    onColumnsReordered (nextColumns) {
      this.columnsReordered({
        id: this.selectedListId,
        headers: nextColumns
      })
    },
    onRemove (obj) {
      this.selectedItem = obj
      this.isOpen = true
    },
    processedLink (id = '') {
      return `${this.activeRoute.fullPath}/${id}`
    },
    onCheckboxCheck (data) {
      this.setListSelectedContacts({ id: this.selectedListId, contacts: data })
    },
    onCheckAllItems (checked) {
      let items = []
      let _this = this
      document
        .querySelectorAll('.checker')
        .forEach(function (checkbox) {
          if (checked) {
            items.push(_this.listItems[_this.selectedListId].data.find(item => item.id === Number(checkbox.value)))
          } else {
            items = items.filter(item => item.id !== Number(checkbox.value))
          }
        })

      this.setListSelectedContacts({ id: this.selectedListId, contacts: items })
    },
    onRemoveList () {
      this.removeListClose()
      setTimeout(() => {
        // this.removeListOpen({ id: this.selectedListId, name: this.name })
        this.removeListOpen({ id: this.selectedList.id, name: this.selectedList.name })
      }, 10)
    },
    onClearList () {
      this.removeListClose()
      setTimeout(() => {
        // this.removeListOpen({ id: this.selectedListId, name: this.name })
        this.removeListOpen({ id: this.selectedList.id, name: this.selectedList.name, clear: true })
      }, 10)
    },
    onCheckedRows (checked) {
      this.setListSelectedContacts({ id: this.selectedListId, contacts: checked })
    },
    onEditColumnsClicked () {
      this.columnsOpen({
        id: this.selectedListId,
        headers: this.columns,
        name: this.list?.name
      })
    },
    generateParams (contact) {
      if (this.selectedList.name === 'My Queue') {
        return {
          contact_ids: [contact.id]
        }
      }
      return {
        contact_list_id: this.selectedList.id,
        contact_ids: [contact.id]
      }
    },
    onContactCreated (contact) {
      if (this.list.type === this.ContactListTypes.STATIC) {
        if (this.list.type === this.ContactListTypes.STATIC) {
          talk2Api.V2.contactListItem.addContact(this.selectedListId, [contact]).then(res => {
            this.setShouldUpdateSelectedListContactCount(true)
            this.fetch()
            this.$generalNotification('Selected contacts were successfully added')
          })
        } else {
          this.fetch({
            page: this.listItems[this.selectedListId].current_page
          })
        }
      }
    },
    onDeleteContact (data) {
      return this.$axios
        .delete(
          this.deleteEndpoint
        )
        .then((res) => {
          this.$generalNotification(res.data.message)
          this.$emit('on-list-update', this.selectedList)
        })
        .catch(() => {
          this.$generalNotification('Unable to delete the selected contact. Please contact system administrator.', 'error')
        })
        .finally(() => {
          this.isOpen = false
        })
    },
    saveFilterButtonCustomClass () {
      return !this.filterHasChanges ? 'button-disabled' : ''
    },
    resetFilters (resetSearch = false) {
      // const defaultFilters = this.fixDefaultFilters()
      // this.setCurrentListFilters(defaultFilters)
      if (resetSearch) {
        this.resetSearch()
      }
      this.$VueEvent.fire('filters-reset')
      this.filterHasChanges = false
    }
  },
  watch: {
    '$route.params.id': function () {
      console.log('CHANGED LIST')
      this.resetFilters()
      this.initialListFilters = this.currentListFilters
      this.loadList(this.selectedListId)
    },
    currentListFilters: {
      deep: true,
      handler: function (val) {
        if (this.$route.name === 'Power Dialer') {
          let params = typeof this.currentListFilters === 'string' ? {} : this.currentListFilters
          console.log('params :>> ', params)
          this.fetch(params, this.hasFilters)
          this.$emit('onFiltersCount', this.currentListFilters)
          // this.filtersCount = this.getFiltersCount(this.currentListFilters)
        }
        // this.isLoading = false
      }
    },
    selectedList (value) {
      this.setListSelectedContacts({ id: value.id, contacts: [] })
      if (this.activeList.length > 0) {
        // this.isLoading = false
      }
    },
    clearList (value) {
      this.fetch()
    }
  }
}
</script>
