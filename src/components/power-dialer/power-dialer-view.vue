<template>
  <PowerDialerViewScreen>

    <template slot="title">
      <!-- <div class="row d-flex py-2">
        <div class="d-flex flex-column">
          <div class="small text-muted pt-1">
            Outbound Sales / Google Map Scaping /
          </div>
        </div>
        <div class="px-2 py-0">
          <ListIcon />
        </div>
        Chicago
      </div> -->
      <Breadcrumbs :list-objects="powerDialerListOfObjects" />
    </template>

    <template slot="options">
      <div class="pr-5">
        99 Contacts
      </div>
      <!-- <StartDialOptions /> -->
      <StartDialing />
    </template>

    <template slot="actions">
      <div>
        <PowerDialerFilter
          v-if="activeRoute"
          :id="id"
          :active-route="activeRoute" />
        <!-- <b-card class="border-0 text-center">
          <div class="t-grouped-buttons">

            <router-link
              v-for="(filter, key) in listFilters"
              :key="key"
              :to="`${activeRoute}/${filter.id}`"
              class="link px-1">
              <div :class="`t-grouped-buttons__btn ${id === filter.id ? 'active' : ''}`">
                <div class="t-badge-name">
                  {{ filter.name }}
                </div>
                <div :class="`t__badge ${id === filter.id ? 'active' : ''}`">
                  99+
                </div>
              </div>
            </router-link>

          </div>
        </b-card> -->
        <b-container fluid class="bv-example-row m-0 p-0 pl-3">
          <b-row class="pr-2">
            <b-col class="p-0 pr-2 m-0">
              <div class="d-flex">

                <SearchList
                  class="width-250" />
                <SummaryInfoLabels />

              </div>
            </b-col>
            <b-col col lg="4" class="p-0 m-0">
              <div class="px-0 d-flex align-items-center float-right">

                <q-btn
                  no-caps
                  unelevated
                  size="sm"
                  color="primary"
                  class="px-2"
                  v-b-modal:create-contact-modal>
                  Add Contacts
                </q-btn>
                <b-dropdown
                  text="..."
                  no-caret
                  right size="sm"
                  variant="white"
                  class="m-0 p-0 pl-2 b-compact-dropdown-button text-bold">
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
      <div v-if="checked.length > 0" class="px-3 text-caption">
        Menu here if selected multiple items...
      </div>
      <!-- <bulk-action-menu :id="id" v-if="checked.length > 0"></bulk-action-menu> -->
    </template>

    <template slot="table">
      <div>
        <div class="pr-2">

          <Datatable
            :stickyHeaders="true"
            :columns="columns"
            :has-more="true"
            scroll-area-class="none">
            <template slot="tbody">
              <TableRow
                v-for="(contact, key) in contactResources"
                :key="contact.id + key"
                :contact="contact"
                :columns="columns"
                :checked="checked"
                :contactListId="id"
                :custom-row-content="true"
                @checked="onCheckedRows">
                <template slot="custom-content">
                  <template v-for="(column, key) in columns">
                    <!-- COLUMN: Checkboxes -->
                    <td
                      v-if="column.name === 'checkbox'"
                      :key="key">
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
                        class="ellipse">
                        {{ contact.phone_number | fixPhone('NATIONAL', true) }}
                      </div>
                      <span v-else class="ml-1 text-grey-7 text-center">--</span>
                    </td>
                    <!-- COLUMN: Date Added/Created At -->
                    <td
                      class="text-left"
                      :key="column.name"
                      v-else-if="column.name === 'date_added'">
                      <div class="ellipse">
                        {{ contact.created_at | fixDate }}
                      </div>
                    </td>
                    <!-- COLUMN: Tags -->
                    <td
                      v-else-if="column.name === 'tags'"
                      class="tags-cell"
                      :key="column.name">
                      <TagPopover
                        :resource="contact" />
                    </td>
                    <!-- COLUMN: PD Status -->
                    <td
                      v-else-if="column.name === 'pd_status'"
                      :key="key">
                      <StatusChip
                        :status="contact.pd_status"
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
                      :key="key">
                      --
                    </td>
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

import { mapState, mapGetters, mapMutations } from 'vuex'
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
import { ALL_COLUMNS } from 'src/constants/power-dialer/power-dialer-list'

export default {
  name: 'PowerDialerView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
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
    Breadcrumbs
  },
  computed: {
    ...mapState(['prevRoute']),
    ...mapGetters('powerDialer', [
      'contactResources',
      'selectedContacts',
      'powerDialerList'
    ]),
    checked () {
      return this.selectedContacts[this.id] || []
    },
    powerDialerListOfObjects () {
      return this.powerDialerList || []
    },
    columns () {
      return ALL_COLUMNS
    },
    activeFilter () {
      if (this.$router.currentRoute.params.id) {
        return this.$router.currentRoute.params.id
      }
      return ''
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
      'SET_LIST_SELECTED_CONTACTS'
    ]),
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
