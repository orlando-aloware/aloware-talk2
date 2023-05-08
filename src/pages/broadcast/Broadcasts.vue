<template>
  <div class="broadcast position-relative">
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>
    <div class="row align-items-center justify-content-between px-3 my-2 w-100">
      <div class="col-3">
        <search placeholder="Search name, id"/>
      </div>
      <div class="col-6">
        <q-btn-toggle class="custom-toggle-button mx-2 mt-2 mb-1"
                      no-caps
                      spread
                      unelevated
                      dense
                      v-model="broadcasts"
                      :options="broadcastOptions">
          <template v-slot:one>
            <div class="d-flex justify-content-center w-100 px-1 options"
                    :class="[broadcasts === 1 ? 'active' : 'text-grey-90']">
                    <span class="text-white text-left task-status">
                      New
                    </span>
                    <div class="text-center task-count">
                      <span>1</span>
                    </div>
                </div>
          </template>
          <template v-slot:two>
            <div class="d-flex justify-content-center w-100 px-1 options"
                    :class="[broadcasts === 2 ? 'text-white' : 'text-grey-90']">
                    <span class="text-left">
                      Enrolling
                    </span>
                </div>
          </template>
          <template v-slot:three>
            <div class="d-flex justify-content-center w-100 px-1 options"
                    :class="[broadcasts === 3 ? 'text-white' : 'text-grey-90']">
                    <span class="text-left">
                      Sent
                    </span>
                </div>
          </template>
          <template v-slot:four>
            <div class="d-flex justify-content-center w-100 px-1 options"
                    :class="[broadcasts === 4 ? 'text-white' : 'text-grey-90']">
                    <span class="text-left">
                      Paused
                    </span>
                </div>
          </template>
          <template v-slot:five>
            <div class="d-flex justify-content-center w-100 px-1 options"
                    :class="[broadcasts === 5 ? 'text-white' : 'text-grey-90']">
                    <span class="text-left">
                      All
                    </span>
                </div>
          </template>
        </q-btn-toggle>
      </div>
      <div class="col-2 d-flex justify-content-end">
        <q-btn class="px-4 border-half-rounded stats-page-btn"
              :to="{ path: '/broadcasts/new' }"
              color="primary"
              padding="0rem"
              unelevated
              no-caps
              dense>
            <plus-icon class="mr-1"
                      color="white"/>
          New Bulk Message
        </q-btn>
      </div>
    </div>
    <q-separator/>
    <div>
      Chart goes here
    </div>
    <q-separator/>
    <div class="px-2">
      <datatable ref="broadcastsTable"
                 :stickyHeaders="true"
                 :columns="broadcastsColumns"
                 :isEmpty="isBroadcastsTableEmpty"
                 :paginated="false"
                 :total-rows="broadcastData.length ?? 0"
                 @checked="onCheckerClicked()">
        <template slot="tbody">
          <tr v-for="(row, rowIndex) in broadcastData"
              v-bind:key="rowIndex">
            <template v-for="(col, colIndex) in broadcastsColumns">
              <td :key="`c-${colIndex}`"
                  v-if="col.name == 'checkbox'"
                  class="text-left pull-left datatable-row__checkbox">
                  <label class="custom-checkbox-container">
                  <input
                    type="checkbox"
                    class="checker"
                    :value="row.id"
                    :checked="checked.find(item => item.id === row.id) || isAllChecked"
                    @change="onCheckerClicked(row)" />
                  <span class="checkmark"></span>
                </label>
              </td>
              <td :key="`c-${colIndex}`"
                  v-else>
                {{ row[col.field] }}
              </td>
            </template>
          </tr>
        </template>
      </datatable>
    </div>
  </div>
</template>

<script>
import Search from 'src/components/search.vue'
import PlusIcon from 'components/icons/plus-icon.vue'
import talk2Api from 'src/plugins/api/api'
import Datatable from 'src/components/datatable.vue'

const broadcastsColumns = [
  {
    name: 'checkbox',
    label: '',
    field: ''
  },
  {
    name: 'id',
    label: 'Id',
    field: 'id'
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status'
  },
  {
    name: 'pending_tasks',
    label: 'Pending Tasks',
    field: 'pending_tasks'
  },
  {
    name: 'engagement',
    label: 'Engagement',
    field: 'engagement'
  },
  {
    name: 'unsubscribed',
    label: 'Unsubscribed',
    field: 'unsubscribed'
  },
  {
    name: 'target_group',
    label: 'Target Group',
    field: 'target_group'
  },
  {
    name: 'line_used',
    label: 'Line Used',
    field: 'line_used'
  },
  {
    name: 'throttling',
    label: 'Throttling',
    field: 'throttling'
  }
]

export default {
  name: 'broadcasts',

  components: {
    Search,
    PlusIcon,
    Datatable
  },

  data: () => ({
    loading: false,
    broadcasts: 1,
    broadcastOptions: [
      {
        value: 1,
        slot: 'one'
      },
      {
        value: 2,
        slot: 'two'
      },
      {
        value: 3,
        slot: 'three'
      },
      {
        value: 4,
        slot: 'four'
      },
      {
        value: 5,
        slot: 'five'
      }
    ],
    broadcastData: [],
    broadcastsColumns,
    checked: [],
    isAllChecked: false
  }),

  mounted () {
    talk2Api.V1.broadcasts.get().then(res => {
      this.broadcastData = res.data
    })
  },

  computed: {
    isBroadcastsTableEmpty () {
      return this.broadcastData.length === 0
    }
  },

  methods: {
    onCheckerClicked (row) {
      if (!row) {
        this.isAllChecked = !this.isAllChecked
        return
      }

      let foundItem = this.checked.find(item => item.id === row.id)

      if (foundItem) {
        this.checked = this.checked.filter(item => item.id !== row.id)
        return
      }

      this.checked.push(row)
    }
  }
}
</script>
