<template>
  <PowerDialerViewScreen
    v-if="list"
    :loading="isLoading">

    <template slot="title">
      <Breadcrumbs :directory-list="folders" />
    </template>

    <template slot="options">
      <div class="text-13 pr-3 border-right right-spacing-2">
        {{ labelForNumberOfContacts }}
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
                  :list-data="fixedContactsData"
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
                  :list-data="fixedContactsData"
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
        :id="filteredSelectedListId"
        @moved-contacts="onFetch({}, false)" />
    </template>

    <template slot="table">
      <Datatable
        :stickyHeaders="true"
        :columns="columns"
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
            v-for="(contact, nkey) in fixedContactsDataItems"
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
                <!-- COLUMN: All Phone Numbers -->
                <td
                  v-else-if="column.name === 'phone_numbers'"
                  :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="column.name">
                  <ChippedItems
                    :chips="contact[column.name]"
                    :resource="contact"
                    key-name="phone_number"
                    title="Phone Numbers"
                    meta="phone-numbers" />
                </td>
                <!-- COLUMN: Lines -->
                <td
                  v-else-if="column.name === 'campaigns'"
                  :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="column.name">
                  <ChippedItems
                    :chips="contact[column.name]"
                    :resource="contact"
                    title="Lines"
                    meta="campaigns" />
                </td>
                <!-- COLUMN: Ring Groups -->
                <td
                  v-else-if="column.name === 'ring_groups'"
                  :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="column.name">
                  <ChippedItems
                    :chips="contact[column.name]"
                    :resource="contact"
                    title="Ring Groups"
                    meta="ring-groups" />
                </td>
                <!-- COLUMN: Broadcasts -->
                <td
                  v-else-if="column.name === 'broadcasts'"
                  :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="column.name">
                  <ChippedItems
                    :chips="contact[column.name]"
                    :resource="contact"
                    title="Broadcasts"
                    meta="broadcasts" />
                </td>
                <!-- COLUMN: Contact Lists -->
                <td
                  v-else-if="column.name === 'contact_lists'"
                  :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="column.name">
                  <ChippedItems
                    :chips="contact[column.name]"
                    :resource="contact"
                    title="Contact Lists"
                    meta="contact-lists" />
                </td>
                <!-- COLUMN: Status -->
                <td
                  v-else-if="column.name === 'task_status_name' || column.name === 'task_status'"
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
                  v-else-if="column.name === 'contact_owner'"
                  :key="key">
                  <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                      <div v-if="contact.user_id">
                        <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                          {{ (getUserName(contact.user_id)) | ucwords }}
                        </div>
                      </div>
                      <div v-else>
                        <div :class="`${column.draggable ? 'col-indented' : ''}`">
                          No Name
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  v-else-if="column.name === 'initial_campaign_id'"
                  :key="key">
                  {{ contact['initial_campaign'].name }}
                </td>
                <td
                  v-else-if="column.name === 'inbound_calls_count'"
                  :key="key">
                  {{ contact['inbound_call_count'] }}
                </td>
                <td
                  v-else-if="column.name === 'outbound_calls_count'"
                  :key="key">
                  {{ contact['outbound_call_count'] }}
                </td>
                <td
                  v-else-if="column.name === 'inbound_texts_count'"
                  :key="key">
                  {{ contact['inbound_sms_count'] }}
                </td>
                <td
                  v-else-if="column.name === 'outbound_texts_count'"
                  :key="key">
                  {{ contact['outbound_sms_count'] }}
                </td>
                <td
                  v-else-if="column.name === 'communications_count'"
                  :key="key">
                  {{ contact['nb_communications'] }}
                </td>
                <td
                  v-else-if="column.name === 'unread_missed_calls_count'"
                  :key="key">
                  {{ contact['unread_missed_call_count'] }}
                </td>
                <td
                  v-else-if="column.name === 'unread_voicemails_count'"
                  :key="key">
                  {{ contact['unread_voicemail_count'] }}
                </td>
                 <td
                  v-else-if="column.name === 'unread_texts_count'"
                  :key="key">
                  {{ contact['unread_count'] }}
                </td>
                <td
                  v-else
                  :key="key">
                  <template>
                    <span v-if="valueIsObject(contact[column.name])">
                      {{ getObjectKey(contact[column.name], column.name) }}
                    </span>
                    <span v-else>
                      {{ contact[column.name] | prefetchValue }} ({{column.name}})
                    </span>
                  </template>
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

import { mapFields } from 'vuex-map-fields'
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
import ChippedItems from 'src/components/chipped-items'
import CheckBox from 'src/components/checkbox-interactive'
import NameWrapper from 'src/components/name-wrapper'
import Breadcrumbs from 'src/components/breadcrumbs'
import TrashOIcon from 'components/icons/trash-o-icon'
import ConfirmDialog from 'components/confirm-dialog'
import BulkActionMenu from 'src/components/bulk-action-menu-2'
import ContactCreateModal from 'components/contacts/contact-create-modal'
import powermixin from 'src/plugins/mixins/power-dialer'
import pdMixin from 'src/plugins/mixins/power-dialer-init.mixin'
import talk2Api from 'src/plugins/api/api'
import { POWER_DIALER_DEFAULT_COLUMNS } from 'src/constants/contacts-columns'
import { POWER_DIALER_ROUTE_META_ID } from 'src/constants/power-dialer/power-dialer'
import { isEqual, isEmpty, get } from 'lodash'

export default {
  name: 'PowerDialerView',
  props: {
    onFetch: Function,
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
    ChippedItems,
    CheckBox,
    NameWrapper,
    TrashOIcon,
    ConfirmDialog,
    Breadcrumbs,
    ContactCreateModal,
    BulkActionMenu
  },
  filters: {
    prefetchValue (value) {
      if (!value) return '-'
      return value
    }
  },

  async mounted () {
    this.removeListClose()
    await this.myQueueList()
    this.init()
    // this.loadList(this.selectedListId)

    this.$VueEvent.listen('export_event_updates', (task) => {
      console.log(' %c EXPORT EVENT : ', 'background: green; color: #000;', task)
    })

    this.$VueEvent.listen('export_event_create', (task) => {
      this.$generalNotification('Power Dialer list is being exported. Please wait for a while.', 'success')
    })

    this.$VueEvent.listen('export_event_update', (task) => {
      console.log(' %c EXPORT EVENT UPDATE : ', 'background: blue; color: #fff;', task)
      this.$generalNotification(
        `Your export is now available. You can now download the file <b><a href="https://app.alodev.org/download/${task.export.uuid}" download>here</a></b>.`,
        'success',
        0,
        true
      )
    })

    this.$VueEvent.listen('export_event_delete', (task) => {
      console.log(' %c EXPORT EVENT DELETE : ', 'background: red; color: #fff;', task)
    })
  },
  computed: {
    ...mapFields('powerDialer', [
      'powerDialerActiveList'
    ]),
    ...mapState([
      'prevRoute',
      'users'
    ]),
    ...mapState('powerDialer', [
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
      return this.fixedContactsData?.data.length
    },
    labelForNumberOfContacts () {
      let list = this.powerDialerActiveList
      let total = 0
      let currentTotal = this.fixedContactsData?.data.length
      switch (this.filter) {
        case 'in-queue':
          total = list.total_queued
          break
        case 'called':
          total = list.total_called
          break
        case 'failed':
          total = list.total_failed
          break
        case 'scheduled':
          total = list.total_scheduled
          break
        default:
          total = list.total_items
      }
      return `${currentTotal} of ${total} Contacts`
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
      return `/api/v2/power-dialer-lists/${this.filteredListId}/items/${this.selectedItem.contact_list_item_id}`
    },
    isMyQueue () {
      return this.selectedList.name === 'My Queue' || !this.selectedList.name
    },
    filteredList () {
      if (this.selectedListId === 'my-queue') {
        return this.myQueue
        // return this.lists['my-queue']
      }
      return this.list
    },
    filteredListId () {
      if (this.filteredList.id === 'my-queue') {
        return this.myQueue.id
      }
      return this.filteredList.id
    },
    hasMore () {
      return (this.fixedContactsData?.next_page_url &&
          !this.isLoadingMore &&
          !this.isLoading) ||
        false
    },
    fixedContactsData () {
      if (isEqual(this.$parent.$data.contactsData, this.contactsData)) {
        return this.contactsData
      }

      return this.$parent.$data.contactsData
    },
    fixedContactsDataItems () {
      return this.fixedContactsData.data
    },
    listItemsDataCount () {
      const total = get(this.fixedContactsData, 'data.length', null)
      return total !== null ? total : 0
    },
    filteredSelectedListId () {
      let route = this.$route.meta.id
      let id = route === 'power-dialer-queue-filter' ? this.myQueue?.id : this.selectedListId
      return id
    },
    checked () {
      return this.selectedContacts[this.filteredSelectedListId] || []
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
    ...mapActions('contacts', [
      'setContact',
      'columnsOpen',
      'openFilters',
      'closeFilters',
      'columnsReordered',
      'setListSelectedContacts',
      'createListOpen',
      'removeListClose',
      'setCurrentListFilters',
      'removeListOpen',
      'resetSearch',
      'setShouldUpdateSelectedListContactCount',
      'listLoaded',
      'pinnedCountLoaded'
    ]),
    ...mapActions('powerDialer', [
      'updateContactsList',
      'getMyQueueList',
      'exportCsv'
    ]),
    createNewPowerDialerContact (contact) {
      console.log('PD contact to create : ', contact)
    },
    async myQueueList () {
      let response = await this.getMyQueueList()
      if (response.status === 200) {
        this.listLoaded({ ...response.data, id: 'my-queue' })
      } else {
        this.$generalNotification('My Queue list not found! Please contact administrator.', 'error')
      }
    },
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
      if (response.status === 200) {
        this.$generalNotification('CSV export request has been sent!', 'success')
      }
    },
    async beginDial () {
      // this.setContact(this.contact)
      this.$router.push(`/power-dialer/list/${this.filteredListId}/sessions`)
      this.START_DIAL_TOGGLE(true)
    },
    onAddContactsToList () {
      if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
        this.$router.push(`/power-dialer/list/add`)
      } else {
        this.$router.push(`/power-dialer/list/${this.$route.params.id}/add`)
      }
    },
    onColumnsReordered (nextColumns) {
      let id = this.selectedList.name ? this.selectedListId : 'my-queue'
      this.columnsReordered({
        id: id,
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
    onCheckboxCheck (obj) {
      this.setListSelectedContacts({ id: this.filteredSelectedListId, contacts: obj.data })
    },
    onCheckAllItems (checked) {
      let items = []
      if (checked) {
        items = this.fixedContactsDataItems
      } else {
        items = []
      }
      this.setListSelectedContacts({ id: this.filteredSelectedListId, contacts: items })
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
        this.removeListOpen({ id: this.selectedList.id, name: this.selectedList.name || 'My Queue', clear: true })
      }, 10)
    },
    onCheckedRows (checked) {
      this.setListSelectedContacts({ id: this.selectedListId, contacts: checked })
    },
    onEditColumnsClicked () {
      let listIdentity = this.selectedList.type === null ? 'my-queue' : this.selectedListId
      this.columnsOpen({
        id: listIdentity,
        headers: this.filteredColumns,
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
      let params = {
        contact_ids: [contact.id]
      }
      if (this.selectedList.name) {
        params.contact_list_id = this.filteredSelectedListId
      }
      talk2Api.V2.powerDialerListItem.add(params).then(res => {
        this.setShouldUpdateSelectedListContactCount(true)
        this.onFetch()
        this.$generalNotification('Selected contacts were successfully added')
      })
    },
    onDeleteContact (data) {
      return this.$axios
        .delete(
          this.deleteEndpoint
        )
        .then((res) => {
          this.$generalNotification(res.data.message)
          this.$emit('on-list-update', { id: this.filteredListId })
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
    },
    init () {
      this.resetFilters(true)
      this.$VueEvent.fire('clearContacts')
      this.initialListFilters = this.currentListFilters
      this.loadList(this.selectedListId)
    },
    valueIsArray (value) {
      return Array.isArray(value)
    },
    valueIsObject (obj) {
      if (!obj) {
        return false
      }
      return typeof obj === 'object'
    },
    getObjectKey (obj, key) {
      if (obj?.name) {
        return obj.name
      }
      return obj
    },
    getUserName (userId) {
      const user = this.users.find(item => item.id === userId)
      return user ? user.name : '-'
    }
  },
  watch: {
    '$route.params': {
      handler (params) {
        if (!this.$route.name.includes('Contact')) {
          console.log('Initializing...')
          this.init()
        }
      },
      deep: true
    },
    currentListFilters: {
      deep: true,
      handler: function (val) {
        if (this.$route.name === 'Power Dialer') {
          let params = typeof this.currentListFilters === 'string' ? {} : this.currentListFilters
          this.onFetch(params, this.hasFilters, true)
          this.$emit('onFiltersCount', this.currentListFilters)
        }
      }
    },
    selectedList (value) {
      this.setListSelectedContacts({ id: value.id, contacts: [] })
    },
    clearList (value) {
      this.onFetch()
    },
    checked: function (value) {
      const elem = document.querySelector('.data-table-check-all')
      if (elem) {
        elem.checked = this.listItemsDataCount > 0 && value.length === this.listItemsDataCount
      }
    }
  }
}
</script>
