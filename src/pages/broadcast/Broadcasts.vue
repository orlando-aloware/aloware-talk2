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
      <q-table hide-pagination
               separator="none"
               row-key="id"
               :data="broadcastData"
               :columns="broadcastsColumns">
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.label ?? col.string }}
            </q-th>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import Search from 'src/components/search.vue'
import PlusIcon from 'components/icons/plus-icon.vue'

const broadcastsColumns = [
  {
    name: 'id',
    string: 'id',
    field: 'id'
  },
  {
    name: 'name',
    string: 'Name',
    field: 'name'
  },
  {
    name: 'status',
    string: 'Status',
    field: 'status'
  },
  {
    name: 'pending_tasks',
    string: 'Pending Tasks',
    field: 'pending_tasks'
  },
  {
    name: 'engagement',
    string: 'Engagement',
    field: 'engagement'
  },
  {
    name: 'unsubscribed',
    string: 'Unsubscribed',
    field: 'unsubscribed'
  },
  {
    name: 'target_group',
    string: 'Target Group',
    field: 'target_group'
  },
  {
    name: 'line_used',
    string: 'Line Used',
    field: 'line_used'
  },
  {
    name: 'throttling',
    string: 'Throttling',
    field: 'throttling'
  }
]

export default {
  name: 'broadcasts',

  components: {
    Search,
    PlusIcon
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
    broadcastsColumns
  })
}
</script>
