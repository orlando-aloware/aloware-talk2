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
      <StartDialOptions />
      <StartDialing />
    </template>

    <template slot="table">
      <div>
        <b-card class="border-0 text-center">
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
        </b-card>
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

                <b-dropdown
                  text="..."
                  no-caret
                  right size="sm"
                  variant="white"
                  class="m-0 p-0 pr-2 b-compact-dropdown-button text-bold">
                  <b-dropdown-item href="#">
                    <i class="fa fa-search mr-1"></i> Select Contact
                  </b-dropdown-item>
                  <b-dropdown-item href="#" v-b-modal:create-contact-modal>
                    <i class="fa fa-plus mr-1"></i>
                    Create Contact
                  </b-dropdown-item>
                </b-dropdown>

                <q-btn
                  no-caps
                  unelevated
                  size="sm"
                  color="primary"
                  class="px-2">
                  Add Contacts
                </q-btn>

              </div>
            </b-col>
          </b-row>
        </b-container>
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
                      <label class="custom-checkbox-container">
                        <input
                          type="checkbox"
                          class="checker"
                          :value="contact.id"
                          :checked="checked.find(item => item.id === contact.id)" />
                        <span class="checkmark"></span>
                      </label>
                    </td>
                    <!-- COLUMN: Name -->
                    <td
                      v-else-if="column.name === 'name'"
                      :key="column.name"
                      class="datatable-row__name">
                      <div class="d-flex align-items-center">
                        <div class="pr-2">
                          <avatar :name="contact.name"/>
                        </div>
                        <div class="flex-grow-1">
                          <router-link
                            :to="`/power-dialer/${contact.id}`"
                            v-slot="{ href, route, navigate }">
                            <a :href="href"
                              @click="navigate"
                              class="d-flex align-items-center item contact-name">
                              <template v-if="contact.name">
                                <div class="ellipse">{{ contact.name | ucwords }}</div>
                              </template>
                              <template v-if="!contact.name">No Name</template>
                            </a>
                          </router-link>
                        </div>
                      </div>
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
                    <td
                      v-else-if="column.name === 'pd_status'"
                      :key="key">
                      <StatusChip
                        :status="contact.pd_status"
                        size="12px"
                        :outline="true" />
                    </td>
                    <td
                      v-else
                      :key="key">
                      --- {{ column.name }}
                    </td>
                  </template>
                </template>
              </TableRow>
            </template>
          </Datatable>

        </div>
      </div>
    </template>
  </PowerDialerViewScreen>
</template>

<script>

import { mapState, mapGetters } from 'vuex'
import PowerDialerViewScreen from './power-dialer-view-screen'
import StartDialOptions from './activities/start-dial-options'
import SummaryInfoLabels from './details/summary-info-labels'
import Datatable from 'src/components/datatable'
import TableRow from 'src/components/table-row'
import SearchList from 'src/components/search'
import StartDialing from './session-settings/start-dial-sessions-settings'
import StatusChip from '../status-chip'
import TagPopover from '../tag-popover'
import Breadcrumbs from 'src/components/breadcrumbs'
import { DEFAULT_FILTER_LIST, ALL_COLUMNS } from 'src/constants/power-dialer/power-dialer-list'

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
    StartDialOptions,
    Datatable,
    SearchList,
    SummaryInfoLabels,
    StartDialing,
    TableRow,
    StatusChip,
    TagPopover,
    Breadcrumbs
  },
  computed: {
    ...mapState(['prevRoute']),
    ...mapGetters('powerDialer', [
      'contactResources'
    ]),
    ...mapGetters('powerDialer', [
      'powerDialerList'
    ]),
    powerDialerListOfObjects () {
      return this.powerDialerList || []
    },
    listFilters () {
      return DEFAULT_FILTER_LIST
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
      if (this.$route.name === 'Power Dialer Individual') {
        return this.$route.fullPath
      } else if (this.$route.name === 'Power Dialer Individual Advance') {
        return `/power-dialer/list/${this.$route.params.id}`
      }
      return '/power-dialer/list'
    }
  },
  data () {
    return {
      checked: []
    }
  },
  methods: {
    processedLink (id = '') {
      return `${this.activeRoute.fullPath}/${id}`
    },
    onCheckedRows (data) {
      console.log('data from table : ', data)
    }
  }
}
</script>
