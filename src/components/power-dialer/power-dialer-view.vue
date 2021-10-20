<template>
  <PowerDialerViewScreen
    :loading="datatableLoader">

    <template slot="title">
      <Breadcrumbs :list-objects="powerDialerListOfObjects" />
    </template>

    <template slot="options">
      <div class="text-13 pr-3 border-right right-spacing-2">
        99 Contacts
      </div>
      <StartDialing
        @start="beginDial" />
    </template>

    <template slot="actions">
      <div>
        <PowerDialerFilter
          v-if="activeRoute"
          :id="filter"
          :active-route="activeRoute" />
        <b-container fluid class="bv-example-row m-0 p-0 pl-3 pb-0 border-bottom">
          <b-row class="pr-2">
            <b-col class="p-0 pr-2 m-0">
              <div class="d-flex">

                <SearchList
                  @search="onSearch"
                  :search="search"
                  class="width-250" />
                <SummaryInfoLabels />

              </div>
            </b-col>
            <b-col col lg="4" class="p-0 m-0">
              <div class="px-0 d-flex align-items-center float-right">

                <!-- <q-btn
                  no-caps
                  unelevated
                  size="sm"
                  color="primary"
                  class="px-2"
                  v-b-modal:create-contact-modal>
                  Add Contacts
                </q-btn> -->

                <b-dropdown text="Add Contacts"
                  right
                  no-caret
                  variant="light"
                  class="m-2 b-compact-dropdown-button text-bold text-black dropdown-white filter-toggle-button"
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
                    @click="{}">
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

                <b-dropdown
                  text="..."
                  no-caret
                  right size="sm"
                  variant="white"
                  class="m-2 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown">
                  <template #button-content>
                    <i class="fa fa-ellipsis-h"></i>
                  </template>
                  <b-dropdown-item href="#">
                    <i class="fa fa-bars mr-1"></i>
                    Edit Columns
                  </b-dropdown-item>
                  <b-dropdown-item href="#">
                    <i class="fa fa-file-csv mr-1"></i>
                    Export as CSV
                  </b-dropdown-item>
                  <b-dropdown-item href="#">
                    <i class="fa fa-trash-alt mr-1"></i>
                    Delete
                  </b-dropdown-item>
                </b-dropdown>

              </div>
            </b-col>
          </b-row>
        </b-container>
      </div>
    </template>

    <template slot="actions">
      <BulkActionMenu :id="id" v-if="checked.length > 0" />
    </template>

    <template slot="table">
      <div>
        <div class="pr-2">

          <Datatable
            :stickyHeaders="true"
            :columns="columns2"
            :has-more="true"
            :is-empty="!hasContacts"
            :is-loading-more="true"
            :paginated="true"
            scroll-area-class="none"
            :total-rows="totalList"
            @reordered="onColumnsReordered"
            @sort="onSortByField"
            @more="onLoadMore">
            <template slot="tbody">
              <TableRow
                v-for="(contact, nkey) in currentContacts"
                :key="`power-dialer-${contact.id}-${nkey}`"
                :contact="contact"
                :columns="columns2"
                :checked="checked"
                :contactListId="id"
                :custom-row-content="true"
                @checked="onCheckedRows">
                <template slot="custom-content">
                  <template v-for="(column, key) in columns2">
                    <!-- change date added to date created -->
                    <!-- COLUMN: Checkboxes -->
                    <td
                      v-if="column.name === 'checkbox'"
                      :key="key"
                      class="p-0">
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
                        link-path="/power-dialer/" />
                    </td>
                    <!-- COLUMN: Phone Number -->
                    <td
                      v-else-if="column.name === 'phone_number'"
                      :key="column.name"
                      class="datatable-row__phone">
                      <div
                        v-if="contact.phone_number"
                        :class="`ellipse ${column.draggable ? 'pl-3' : ''}`">
                        {{ contact.phone_number | fixPhone('NATIONAL', true) }}
                      </div>
                      <span v-else class="ml-1 text-grey-7 text-center">--</span>
                    </td>
                    <!-- COLUMN: Date Added/Created At -->
                    <td
                      class="text-left"
                      :key="column.name"
                      v-else-if="column.name === 'created_at'">
                      <div :class="`ellipse ${column.draggable ? 'pl-3' : ''}`">
                        {{ contact.created_at | fixDate }}
                      </div>
                    </td>
                    <!-- COLUMN: Tags -->
                    <td
                      v-else-if="column.name === 'tags'"
                      :class="`tags-cell ${column.draggable ? 'pl-4' : ''}`"
                      :key="column.name">
                      <TagPopover
                        :resource="contact" />
                    </td>
                    <!-- COLUMN: Status -->
                    <td
                      v-else-if="column.name === 'status'"
                      :class="`tags-cell ${column.draggable ? 'pl-4' : ''}`"
                      :key="key">
                      <StatusChip
                        :status="contact.status"
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
                    <!-- <td
                      v-else
                      :key="key">
                      -> {{ column.name }}
                    </td> -->
                  </template>
                </template>
              </TableRow>
            </template>
          </Datatable>

        </div>
      </div>
      <ConfirmDialog
        v-model="isOpen"
        @close="closeModal"
        :id="dialogName"
        :is-open="isOpen"
        :hide-header="true"
        :hide-footer="true"
        title="Are you really really sure?"
        size="sm">
        <div slot="content">
          <div class="text-center text-h6 pb-4">
            <TrashOIcon height="20" width="20" />
            Remove Contact?
          </div>
          <div class="text-center py-3">
            <div class="text-dark">
              <div v-html="`Do you want to remove the contact: ${selectedItem.name}?`"></div>
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
                @click="{}">
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
import PowerDialerViewScreen from './power-dialer-view-screen'
import PowerDialerFilter from './details/power-dialer-filters'
// import StartDialOptions from './activities/start-dial-options'
import SummaryInfoLabels from './details/summary-info-labels'
import Datatable from 'src/components/datatable'
import TableRow from 'src/components/table-row'
import SearchList from 'src/components/search'
import StartDialing from './session-settings/start-dial-sessions-settings'
import StatusChip from '../status-chip'
import TagPopover from '../tag-popover'
import CheckBox from '../checkbox-interactive'
import NameWrapper from '../name-wrapper'
import Breadcrumbs from 'src/components/breadcrumbs'
import TrashOIcon from 'components/icons/trash-o-icon'
import ConfirmDialog from 'components/confirm-dialog'
import BulkActionMenu from 'src/components/bulk-action-menu-2'
import { ALL_COLUMNS } from 'src/constants/power-dialer/power-dialer-list'
import powermixin from 'src/plugins/mixins/power-dialer'
// import { get } from 'lodash'

export default {
  name: 'PowerDialerView',
  props: {
    id: {
      type: String,
      required: true
    },
    filter: {
      type: String,
      required: true
    }
  },
  mixins: [powermixin],
  components: {
    PowerDialerViewScreen,
    PowerDialerFilter,
    // StartDialOptions,
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
    BulkActionMenu
  },
  computed: {
    ...mapState(['prevRoute']),
    ...mapGetters('powerDialer', [
      'contactResources',
      'contacts',
      'selectedContacts',
      'powerDialerLists',
      'powerDialerListItems',
      'powerDialerDirectoryList',
      'datatableLoader'
    ]),
    checked () {
      return this.selectedContacts[this.id] || []
    },
    totalList () {
      return this.powerDialerListItems[this.id]?.total || 0
    },
    currentContacts () {
      return this.powerDialerListItems?.[this.id]?.data || []
    },
    powerDialerListOfObjects () {
      return this.powerDialerDirectoryList || []
    },
    columns2 () {
      return ALL_COLUMNS
    },
    activeRoute () {
      if (this.$route.meta === 'Power Dialer Individual') {
        return this.$route.fullPath
      } else if (this.$route.meta === 'Power Dialer Individual Advance') {
        return `/power-dialer/list/${this.$route.params.id}`
      }
      return '/power-dialer/list'
    },
    dialogName () {
      return `remove-power-dialer-item-dialog`
    },
    hasContacts () {
      return this.currentContacts.length > 0
    }
  },
  data () {
    return {
      isOpen: false,
      selectedItem: { id: '' }
    }
  },
  methods: {
    ...mapMutations('powerDialer', [
      'SET_LIST_SELECTED_CONTACTS',
      'START_DIAL_TOGGLE'
    ]),
    ...mapActions('powerDialer', [
      'columnsReordered'
    ]),
    ...mapActions('inbox', [
      'setSelectedContact'
    ]),

    beginDial () {
      this.START_DIAL_TOGGLE(true)
      this.setSelectedContact({})
      this.$router.push({ name: 'Power Dialer Session' })
    },
    onColumnsReordered (nextColumns) {
      console.log('Re-ordered columns...', nextColumns)
    },
    onRemove (obj) {
      this.selectedItem = obj
      this.isOpen = true
    },
    processedLink (id = '') {
      return `${this.activeRoute.fullPath}/${id}`
    },
    onCheckboxCheck (data) {
      this.SET_LIST_SELECTED_CONTACTS({
        id: this.id,
        contacts: data
      })
    },
    onCheckedRows (data) {
      console.log('data from table 999 : ', data)
    },
    closeModal () {
      this.isOpen = false
    }
  }
}
</script>
