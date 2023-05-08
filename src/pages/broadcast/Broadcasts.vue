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
    <search/>
    <q-btn-toggle class="custom-toggle-button mx-2 mt-2 mb-1"
                  no-caps
                  spread
                  unelevated
                  dense
                  v-model="broadcasts"
                  :options="broadcastOptions">
      <template v-slot:one>
        <div class="d-flex justify-content-center align-items-center w-100 px-1 options"
                 :class="[broadcasts === 1 ? 'text-white' : 'text-grey-90']">
                <span class="text-left">
                  New
                </span>
            </div>
      </template>
      <template v-slot:two>
        <div class="d-flex justify-content-center align-items-center w-100 px-1 options"
                 :class="[broadcasts === 2 ? 'text-white' : 'text-grey-90']">
                <span class="text-left">
                  Enrolling
                </span>
            </div>
      </template>
      <template v-slot:three>
        <div class="d-flex justify-content-center align-items-center w-100 px-1 options"
                 :class="[broadcasts === 3 ? 'text-white' : 'text-grey-90']">
                <span class="text-left">
                  Sent
                </span>
            </div>
      </template>
      <template v-slot:four>
        <div class="d-flex justify-content-center align-items-center w-100 px-1 options"
                 :class="[broadcasts === 4 ? 'text-white' : 'text-grey-90']">
                <span class="text-left">
                  Paused
                </span>
            </div>
      </template>
      <template v-slot:five>
        <div class="d-flex justify-content-center align-items-center w-100 px-1 options"
                 :class="[broadcasts === 5 ? 'text-white' : 'text-grey-90']">
                <span class="text-left">
                  All
                </span>
            </div>
      </template>
    </q-btn-toggle>
    <router-link :to="{ path: '/broadcasts/new' }">
      New
    </router-link>
  </div>
</template>

<script>
import Search from 'src/components/search.vue'
export default {
  name: 'broadcasts',

  components: { Search },

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
    ]
  })
}
</script>
