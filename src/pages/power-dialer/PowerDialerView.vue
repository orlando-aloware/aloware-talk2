<template>
  <contacts-screen :loading="isLoading"
                   v-if="list">
    <template slot="title">
      <breadcrumbs :directory-list="folders" />
    </template>

    <template slot="options">
      <div class="text-13 pr-3 border-right right-spacing-2">
        {{ labelForNumberOfContacts }}
      </div>
      <start-dial-session-settings :disabled-trigger="numberOfContacts === 0"
                                   :list="filteredList"
                                   @start="beginDial"
                                   @on-update-session-metrics="onSessionMetricsUpdate" />
    </template>

    <template slot="actions">
      <div class="w-100">
        <summary-info-labels />
        <b-container class="bv-example-row m-0 p-0 pb-0"
                     fluid>
          <b-row class="pr-2 pt-4 pb-3"
                 v-if="showMobileFilters">
            <b-col class="d-flex justify-content-center"
                   cols="12">
              <div class="d-flex">
                <power-dialer-filter :list-data="fixedContactsData"
                                     :id="selectedListId"
                                     :filter="filter"
                                     :active-route="activeRoute" />
              </div>
            </b-col>
          </b-row>
          <b-row class="pr-2"
                 :class="{ 'pt-4': !showMobileFilters }">
            <b-col class="p-0 pr-2 m-0">
              <div class="d-flex">

                <search-list class="width-260"
                             limitSearchCharacters
                             :search="search"
                             @search="onSearch" />

              </div>
            </b-col>
            <b-col cols="8"
                   v-if="!showMobileFilters">
              <div class="d-flex justify-content-center">
                <power-dialer-filter :list-data="fixedContactsData"
                                     :id="selectedListId"
                                     :filter="filter"
                                     :active-route="activeRoute" />
              </div>
            </b-col>
            <b-col class="p-0">
              <div class="d-flex float-right">

                <b-dropdown class="m-0 mb-3 b-compact-dropdown-button text-bold text-black dropdown-white filter-toggle-button"
                            toggle-class="filter-toggle-button py-0 my-0 d-flex align-items-center"
                            text="Add Contacts"
                            variant="light"
                            right
                            no-caret
                            :disabled="taskAddAndClearingDisabled">
                  <template class="filter-toggle-button"
                            #button-content>
                    <div class="filter-toggle-button d-flex align-items-center"
                         style="margin-top: -2px;font-size:13px;">
                      Add Contacts
                    </div>
                    <i class="fa fa-chevron-down fs-12 filter-toggle-button d-flex align-items-center ml-2"
                       style="margin-top: 2px;font-size: 9px !important;position: relative;top: -2px;"/>
                    <q-tooltip content-class="bg-grey-light11"
                               anchor="top middle"
                               self="center middle"
                               v-if="taskAddAndClearingDisabled">
                      Clearing of task is currently disabled.
                    </q-tooltip>
                  </template>
                  <b-dropdown-item href="#"
                                   :disabled="taskAddAndClearingDisabled"
                                   @click="onAddContactsToList">
                    <i class="fa fa-search mr-1"/>
                    Select Contacts & Add to List
                  </b-dropdown-item>
                  <b-dropdown-item href="#"
                                   :disabled="taskAddAndClearingDisabled"
                                   v-b-modal:create-contact-modal>
                    <i class="fa fa-plus mr-1"/>
                    {{ createContactToListText }}
                  </b-dropdown-item>
                </b-dropdown>

                <contact-create-modal @created="onContactCreated"/>

                <b-dropdown class="m-0 mb-3 ml-2 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown"
                            text="..."
                            right size="sm"
                            variant="white"
                            no-caret>
                  <template #button-content>
                    <i class="fa fa-ellipsis-h"/>
                  </template>
                  <b-dropdown-item href="#"
                                   @click="onEditColumnsClicked">
                    <i class="fa fa-bars mr-1"/>
                    Edit Columns
                  </b-dropdown-item>
                  <b-dropdown-item href="#"
                                   v-if="isAdmin"
                                   @click="exportAsCsv">
                    <i class="fa fa-file-csv mr-1"/>
                    Export as CSV
                  </b-dropdown-item>
                  <b-dropdown-item href="#"
                                   :disabled="taskAddAndClearingDisabled"
                                   @click="onClearList">
                    <i class="fa fa-trash-alt mr-1 text-red"/>
                    <span class="text-red">Clear</span>
                    <q-tooltip content-class="bg-grey-light11"
                               anchor="top middle"
                               self="center middle"
                               v-if="taskAddAndClearingDisabled">
                      Clearing of task is currently disabled.
                    </q-tooltip>
                  </b-dropdown-item>
                  <!--b-dropdown-item href="#"
                                   v-else
                                   @click="onRemoveList">
                    <i class="fa fa-trash-alt mr-1 text-red"/>
                    <span class="text-red">Delete</span>
                  </b-dropdown-item-->
                </b-dropdown>

              </div>
            </b-col>
          </b-row>
        </b-container>
      </div>
    </template>

    <template slot="actions">
      <bulk-action-menu :id="filteredSelectedListId"
                        :disabled-delete="taskAddAndClearingDisabled"
                        :total-rows="totalRows"
                        :checked-count="selectedAllCount"
                        :is-loading-more="isLoadingMore"
                        :is-loading="isLoading"
                        v-if="filteredSelectedListId"
                        @moved-contacts="onMovedContacts"
                        @onSelectedAll="onSelectedAll"/>
    </template>

    <template slot="table">
      <datatable scroll-area-class="pd-datatable"
                 :stickyHeaders="true"
                 :columns="columns"
                 :is-empty="isEmpty || isStartState"
                 :is-loading-more="isLoadingMore"
                 :is-loading="isLoading"
                 :contact-list-id="selectedListId"
                 :paginated="false"
                 :show-pagination="!isStartState"
                 :current-page="currentPage"
                 :last-page="lastPage"
                 :total-rows="totalRows"
                 @onMouseMove="datatableOnMouseMove"
                 @onMouseLeave="datatableOnMouseMove"
                 @reordered="onColumnsReordered"
                 @checked="onCheckAllItems"
                 @sort="onSortByField"
                 @paginated="onPaginate"
                 @more="onLoadMore">
        <template slot="tbody">
          <tr class="datatable-row"
              :key="`${index}`"
              v-for="(contact, index) in fixedContactsData.data">
            <template v-for="(column, key) in filteredColumns">
              <!-- change date added to date created -->
              <!-- COLUMN: Checkboxes -->
              <!-- <div :key="`key-${key}`">{{contact}}</div> -->
              <td class="text-left pull-left datatable-row__checkbox"
                  :key="`c-${key}`"
                  v-if="column.name === 'checkbox'">
                <label class="custom-checkbox-container">
                  <input type="checkbox"
                         class="checker"
                         :value="contact.id"
                         :checked="checked.find(item => item.id === contact.id)"
                         @change="onCheckerClicked(contact)" />
                  <span class="checkmark"/>
                </label>
              </td>
              <!-- COLUMN: Name  -->
              <td class="datatable-row__name"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'name'">
                <div class="d-flex align-items-center">
                  <div class="pr-2">
                    <div class="avatar"
                         :style="computedStyle">
                      <div class="avatar__inner">
                        <span v-if="!contact.name || !contact.name.length">
                          <i class="fa fa-user"/>
                        </span>
                        <span v-else>
                          {{ getInitials(contact.name || 'No Name') }}
                        </span>
                      </div>
                      <slot></slot>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <router-link class="d-flex align-items-center item contact-name"
                                 :to="generateRoute(contact.id)">
                      <template v-if="contact.name">
                        <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                          {{ contact.name | ucwords }}
                        </div>
                      </template>
                      <template v-if="!contact.name">
                        <div :class="`${column.draggable ? 'col-indented' : ''}`">
                          No Name
                        </div>
                      </template>
                    </router-link>

                    <b-badge variant="danger"
                             class="badge-phone-info"
                             v-if="contact.is_dnc">
                      DNC
                    </b-badge>
                  </div>
                </div>
              </td>
              <!-- COLUMN: Phone Number -->
              <td class="datatable-row__phone"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'phone_number'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`"
                     v-if="contact.phone_number">
                  {{ contact.phone_number | fixPhone('NATIONAL', true, false, true) }}
                </div>
                <div class="ml-1 text-grey-7 text-center "
                     :class="`${column.draggable ? 'col-indented' : ''}`"
                     v-else>
                  --
                </div>
              </td>
              <td :key="`c-${key}`"
                  v-else-if="column.name === 'last_engagement_text'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  <div>{{ contact.last_engagement_text }}</div>
                  <div class="small text-muted">
                    {{ moment(contact.last_engagement_at).format('LLL') }}
                  </div>
                </div>
              </td>
              <!-- COLUMN: Date Added/Created At -->
              <td class="text-left"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'created_at'">
                <div :class="`ellipse ${column.draggable === true ? 'col-indented' : ''}`">
                  {{ contact.created_at | fixFullDateTime }}
                </div>
              </td>
              <!-- COLUMN: Tags -->
              <td :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'tags'"
                  @mouseleave="onMouseLeavePopover($event)">

                <template v-if="!contact.tags || (contact.tags && !contact.tags.length)">
                  --
                </template>

                <template v-if="Array.isArray(contact.tags) && contact.tags.length">
                  <div class="d-flex align-items-center contact-tags-item popover-items"
                       :id="`pt-${index}-${key}`"
                       v-if="contact.id"
                       @mouseenter="onMouseOverPopover('Tags', `pt-${index}-${key}`, index, column.name, $event)">
                    <span>
                      <i class="fa fa-circle"
                         :style="`color: ${contact.tags[0].color};font-size:36%;position: relative; top: -3px;`"></i>
                      <span v-if="contact.tags.length > 1">
                        {{ contact.tags[0].name | truncate(17) }}
                      </span>
                      <span v-else>
                        {{ contact.tags[0].name | truncate(27) }}
                      </span>
                    </span>
                    <span class="ml-1 text-grey-7"
                          v-if="contact.tags.length > 1">
                      +{{ (contact.tags.length - 1) }} more
                    </span>
                  </div>
                </template>
              </td>
              <!-- COLUMN: Status -->
              <td :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'task_status_name' || column.name === 'task_status'">
                <q-chip text-color="red"
                        size="12px"
                        class="p-0 m-0"
                        :outline="true"
                        :color="getStatusColor(getStatusName(contact.task_status))">
                  {{ getStatusName(contact.task_status) }}
                </q-chip>
              </td>
              <td :key="key"
                  v-else-if="column.name === 'actions'">
                <button class="btn btn-sm btn-link datatable-row__actions__action--trash"
                        :disabled="taskAddAndClearingDisabled"
                        @click="onRemove(contact)">
                  <trash-o-icon />
                  <q-tooltip content-class="bg-grey-light11"
                             anchor="top middle" self="center middle"
                             v-if="taskAddAndClearingDisabled">
                    Clearing of task is currently disabled.
                  </q-tooltip>
                </button>
              </td>
              <td class="datatable-row__name"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'contact_owner'">
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
              <td class="text-left"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'text_authorized_at'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ contact.text_authorized_at ? 'Yes' : 'No' }}
                </div>
              </td>
              <td class="text-left"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'initial_campaign_id'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ getLineName(contact.initial_campaign_id) }}
                </div>
              </td>
              <td :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'unread_missed_calls_count'">
                <span class="badge badge-danger unread-text bg-red-80"
                      v-if="contact.unread_missed_calls_count > 0">
                  {{ contact.unread_missed_calls_count }}
                </span>
              </td>
              <td :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'unread_voicemails_count'">
                <span class="badge badge-danger unread-text bg-red-80"
                      v-if="contact.unread_voicemails_count > 0">
                  {{ contact.unread_voicemails_count }}
                </span>
              </td>
              <td :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'unread_texts_count'">
                <span class="badge badge-danger unread-text bg-red-80"
                      v-if="contact.unread_texts_count > 0">
                  {{ contact.unread_texts_count }}
                </span>
              </td>
              <td :key="`c-${key}`"
                  v-else
                  @mouseleave="onMouseLeavePopover($event)">

                <div class="text-left"
                     v-if="isColumnArrayValueEmpty(contact[column.name])">
                  <div :class="`${column.draggable ? 'col-indented' : ''}`">
                    -
                  </div>
                </div>

                <div class="text-left"
                     v-else-if="isColumnArrayValueNotEmpty(contact[column.name])">
                  <div class="d-flex align-items-center popover-items"
                       :id="`ot-${index}-${key}`"
                       v-if="contact[column.name].length > 0"
                       @mouseenter="onMouseOverPopover(column.label, `ot-${index}-${key}`, index, column.name, $event)">
                    <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`"
                         v-if="typeof contact[column.name][0].phone_number !== 'undefined'">
                      {{ contact[column.name][0].phone_number | fixPhone('NATIONAL', true) }}
                    </div>
                    <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`"
                         v-else>
                      {{ contact[column.name][0].name }}
                    </div>
                    <span class="ml-1 text-grey-7"
                          v-if="contact[column.name].length > 1">
                      +{{ (contact[column.name].length - 1) }} more
                    </span>
                  </div>
                  <span v-if="contact[column.name].length === 0">
                    -
                  </span>
                </div>
                <div class="text-left"
                     v-else-if="isColumnObjectValueNotEmpty(contact[column.name])">
                  <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`"
                       v-if="contact[column.name].id && typeof contact[column.name].name !== 'undefined'">
                    {{ contact[column.name].name }}
                  </div>
                </div>
                <span class="text-left"
                      v-else-if="isColumnObjectValueEmpty(contact[column.name])">
                  - {{ contact[column.name] }}
                </span>
                <div class="text-left ellipse col-indented"
                     v-else-if="column.name.includes('_at')">
                  {{ contact[column.name] | fixFullDateTime }}
                </div>
                <div class="text-left ellipse col-indented"
                     v-else-if="column.name.includes('date_of_birth')">
                  {{ contact[column.name] | fixFullDate }}
                </div>
                <div class="ellipse"
                     :class="getColumnClass(column.name, column.draggable)"
                     v-else>
                  {{ getColumnValue(contact[column.name]) }}
                </div>
              </td>
            </template>
          </tr>
        </template>
      </datatable>

      <b-popover triggers="hover"
                 placement="topright"
                 boundary="window"
                 ref="popover"
                 :key="hoverPopover.key"
                 :show.sync="hoverPopover.show"
                 :target="hoverPopover.target"
                 v-if="hoverPopover.target">
        <template #title>
          <div class="contact-tags-title">{{ hoverPopover.title }}</div>
        </template>
        <template v-if="hoverPopover.title === 'Tags'">
          <span class="d-flex align-items-center contact-tags-item"
                :key="`t-${index}`"
                v-for="(item, index) in hoverPopover.data">
            <span>
              <i class="fa fa-circle"
                 :style="`color: ${item.color};font-size:50%;position: relative; top: -2px;`"/>
              {{ item.name }}
            </span>
          </span>
        </template>
        <template v-if="hoverPopover.title !== 'Tags'">
          <div class="ml-1 w-100"
               :key="`ct-${index}`"
               v-for="(item, index) in hoverPopover.data">
            <i class="fa fa-circle text-black"
               :style="`font-size:36%;position: relative; top: -3px;`"/>
            <span v-if="typeof item.phone_number !== 'undefined'">
              {{ item.phone_number | fixPhone('NATIONAL', true) }}
            </span>
            <span v-else>
              {{ item.name }}
            </span>
          </div>
        </template>
        <span class="ml-1 text-grey-7"
              v-if="hoverPopover.dataLength > 11">
          +{{ (hoverPopover.dataLength - 11) }} more
        </span>
      </b-popover>

      <confirm-dialog title="Are you really really sure?"
                      size="sm"
                      :id="dialogName"
                      :is-open="isOpen"
                      :hide-header="true"
                      :hide-footer="true"
                      v-model="isOpen"
                      v-if="selectedItem"
                      @close="closeModal">
        <div slot="content">
          <div class="text-center text-h6 pb-4">
            <trash-o-icon height="20"
                          width="20" />
            Remove Contact?
          </div>
          <div class="text-center py-3">
            <div class="text-dark">
              <div v-html="`Do you want to remove the contact: ${fullname}?`"></div>
            </div>
          </div>
          <div class="row text-center pt-3 pb-0">
            <div class="col-6 p-1">
              <b-button variant="dark-grey"
                        class="f-btn--cancel"
                        size="sm"
                        block
                        @click="closeModal">
                Cancel
              </b-button>
            </div>
            <div class="col-6 p-1">
              <b-button variant="danger"
                        size="sm"
                        block
                        @click="onDeleteContact">
                Remove
              </b-button>
            </div>
          </div>
        </div>
      </confirm-dialog>

    </template>
  </contacts-screen>
</template>

<script>

import { mapFields } from 'vuex-map-fields'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import ContactsScreen from 'src/components/contacts/contacts-screen'
import PowerDialerFilter from 'src/components/power-dialer/details/power-dialer-filters'
import SummaryInfoLabels from 'src/components/power-dialer/details/summary-info-labels'
import Datatable from 'src/components/datatable'
import SearchList from 'src/components/search'
import StartDialSessionSettings from 'src/components/power-dialer/session-settings/start-dial-sessions-settings'
import Breadcrumbs from 'src/components/breadcrumbs'
import TrashOIcon from 'components/icons/trash-o-icon'
import ConfirmDialog from 'components/confirm-dialog'
import BulkActionMenu from 'src/components/bulk-action-menu'
import ContactCreateModal from 'components/contacts/contact-create-modal'
import talk2Api from 'src/plugins/api/api'
import { POWER_DIALER_ROUTE_META_ID } from 'src/constants/power-dialer/power-dialer'
import { isEqual, get, isEmpty } from 'lodash'
import {
  aclMixin,
  viewMixin,
  avatarMixin,
  powerDialerMixin,
  powerDialerInitMixin
} from 'src/plugins/mixins'
import { PD_MAX_FILTER_LG } from 'src/constants/viewport-sizes'

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

  mixins: [
    powerDialerMixin,
    powerDialerInitMixin,
    aclMixin,
    viewMixin,
    avatarMixin
  ],

  components: {
    ContactsScreen,
    PowerDialerFilter,
    Datatable,
    SearchList,
    SummaryInfoLabels,
    StartDialSessionSettings,
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
    this.$VueEvent.fire('setListSelectedContacts', { id: this.id, contacts: [] })

    this.removeListClose()

    if (!this.isMyQueue) {
      await this.myQueueList()
    }

    this.init()
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapFields('powerDialer', [
      'powerDialerActiveList'
    ]),

    ...mapState([
      'prevRoute',
      'users'
    ]),

    ...mapState('powerDialer', [
      'metrics',
      'pdViewCancelToken',
      'pdViewSource',
      'myQueue'
    ]),

    ...mapGetters('powerDialer', [
      'contactResources',
      'powerDialerLists',
      'powerDialerDirectoryList',
      'datatableLoader',
      'activeFilter'
    ]),

    ...mapGetters('contacts', [
      'folders',
      'lists',
      'listItems',
      'selectedList',
      'isFiltersOpen',
      'currentListFilters',
      'clearList'
    ]),

    taskAddAndClearingDisabled () {
      const isAddDisabled = !this.isAdmin && this.currentCompany.disable_power_dialer_add
      return isAddDisabled || this.isLoading
    },

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

      const totalContacts = total || 0
      const postfix = totalContacts > 1 ? 's' : ''

      return `${this.listItemsTotalContacts} of ${totalContacts} Contact${postfix}`
    },

    activeList () {
      return this.listItems[this.selectedListId]?.data || []
    },

    hasContacts () {
      return this.activeList.length > 0
    },

    currentPage () {
      return this.listItems?.[this.selectedListId]?.current_page || 1
    },

    lastPage () {
      return this.listItems?.[this.selectedListId]?.last_page || 0
    },

    fullname () {
      if (!this.selectedItem) {
        return ''
      }

      return `${this.selectedItem.first_name} ${this.selectedItem.last_name}`
    },

    deleteEndpoint () {
      // if selected task is not empty and there's a task list
      // currently selected/in view, then it's safe to delete
      if (isEmpty(this.selectedItem) ||
        [null, undefined].includes(this.filteredListId)) {
        return ''
      }

      return `/api/v2/power-dialer-lists/${this.filteredListId}/items/${this.selectedItem.contact_list_item_id}`
    },

    isMyQueue () {
      return this.$route.name === 'Power Dialer' && this.$route.params.id === 'in-queue'
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

    checkedCount () {
      return this.checked.length
    },

    createContactToListText () {
      const text = this.taskAddAndClearingDisabled ? '' : ' & Add to List'

      return `Create Contact${text}`
    },

    showMobileFilters () {
      return this.$q.screen.width <= PD_MAX_FILTER_LG
    }
  },

  data () {
    return {
      selectedItem: null
    }
  },

  created () {
    this.setPDListCancelToken(window.axios.CancelToken)
    this.setPDListSource(this.pdViewCancelToken.source())

    this.pdViewListeners.contactListItemDeleting = (task) => {
      // console.log(` %c PUSHER caught: contact_list_item_deleting `, 'background:black;color:yellow;', task)
      // console.log(' %c TASK was DELETED : ', 'background: green; color: #000;', task)
    }

    this.$VueEvent.stop('contact_list_item_deleting', this.pdViewListeners.contactListItemDeleting)
    this.$VueEvent.listen('contact_list_item_deleting', this.pdViewListeners.contactListItemDeleting)
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
      'createListOpen',
      'removeListClose',
      'setCurrentListFilters',
      'removeListOpen',
      'resetSearch',
      'setShouldUpdateSelectedListContactCount',
      'listLoaded',
      'pinnedCountLoaded',
      'setShowMyContacts'
    ]),

    ...mapActions('powerDialer', [
      'updateContactsList',
      'getMyQueueList',
      'setPDListSource',
      'setPDListCancelToken'
    ]),

    createNewPowerDialerContact (contact) {
      console.log('PD contact to create : ', contact)
    },

    async myQueueList () {
      // this.$emit('on-my-queue-list')
    },

    onSearch (searchText) {
      this.$emit('search', searchText)
    },

    onFetchMyContacts (checked) {
      this.setShowMyContacts(checked)
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

    async beginDial () {
      this.$router.push(`/power-dialer/list/${this.filteredListId}/sessions`)
      this.START_DIAL_TOGGLE(true)
    },

    onAddContactsToList () {
      if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
        this.$router.push(`/power-dialer/list/add`)

        return
      }

      this.$router.push(`/power-dialer/list/${this.$route.params.id}/add`)
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
      this.$VueEvent.fire('setListSelectedContacts', { id: this.filteredSelectedListId, contacts: obj.data })
    },

    onCheckAllItems (checked) {
      let items = []

      if (checked) {
        document
          .querySelectorAll('.checker')
          .forEach((checkbox) => {
            let foundContact = this.fixedContactsData.data.find(item => item.id === Number(checkbox.value))

            if (!(foundContact.is_blocked || foundContact.is_dnc)) {
              items.push(foundContact)
            }
          })
      }

      this.$VueEvent.fire('setListSelectedContacts', { id: this.filteredSelectedListId, contacts: items })
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
      this.$VueEvent.fire('setListSelectedContacts', { id: this.selectedListId, contacts: checked })
    },

    onEditColumnsClicked () {
      let listIdentity = this.selectedList.type === null ? 'my-queue' : this.selectedListId

      this.columnsOpen({
        id: listIdentity,
        headers: this.filteredColumns,
        name: this.list?.name
      })
    },

    onSessionMetricsUpdate () {
      this.$axios
        .get('/api/v2/power-dialer-lists/' + this.selectedListId)
        .then((response) => response.data)
        .then((response) => {
          this.activeMetrics = response.session_metrics
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
      if (this.taskAddAndClearingDisabled) {
        return
      }

      let params = {
        contact_ids: [contact.id]
      }

      if (this.selectedList.name) {
        params.contact_list_id = this.filteredSelectedListId
      }

      talk2Api.V2.powerDialerListItem.add(params).then(res => {
        this.setShouldUpdateSelectedListContactCount(true)
        this.onFetch()
        this.$generalNotification('Selected contacts were successfully added.')
      })
    },

    onDeleteContact (data) {
      const deleteEndpoint = this.deleteEndpoint

      // if endpoint is empty, then it's an invalid delete
      if (isEmpty(deleteEndpoint)) {
        this.$generalNotification('Unable to delete the selected contact. Please contact system administrator.', 'error')
        return
      }

      return this.$axios
        .delete(
          deleteEndpoint
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
      if (resetSearch) {
        this.resetSearch()
      }

      this.$VueEvent.fire('filters-reset')
      this.filterHasChanges = false
    },

    init (loadList = true) {
      this.resetFilters(true)
      this.$VueEvent.fire('clearContacts')
      this.initialListFilters = this.currentListFilters

      if (loadList) {
        this.loadList(this.selectedListId)
      }
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
    }
  },

  watch: {
    '$route.params.filter': {
      handler () {
        if (!this.$route.name.includes('Contact')) {
          this.init(false)
        }
      },
      deep: true
    },

    '$route.params.id': {
      handler () {
        if (!this.$route.name.includes('Contact')) {
          this.init(true)
        }
      },
      deep: true
    },

    currentListFilters: {
      deep: true,
      handler: function (val) {
        if (this.$route.name === 'Power Dialer') {
          let params = typeof this.currentListFilters === 'string' ? {} : this.currentListFilters
          this.onFetch(params, false, true)
        }
      }
    },

    selectedList (value) {
      this.$VueEvent.fire('setListSelectedContacts', { id: value.id, contacts: [] })
    },

    clearList (value) {
      this.onFetch()
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('contact_list_item_deleting', this.pdViewListeners.contactListItemDeleting)
  }
}
</script>
