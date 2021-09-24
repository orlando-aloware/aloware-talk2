<template>
  <div class="row">
    <div class="col-12">
      <SessionTabsHeaders />
    </div>
    <div class="col-4 p-1">
      <q-card flat class="p-3">
        <q-card-section class="p-0">
          <div class="text-subtitle1 text-weight-medium">Scripts</div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-4 p-1">
      <q-card flat class="p-3">
        <q-card-section class="p-0">
          <div class="text-subtitle1 text-weight-medium">Open in HubSpot</div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-4 p-1">
      <q-card flat class="p-3">
        <q-card-section class="p-0">
          <div class="text-subtitle1 text-weight-medium">All Numbers</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>

import SessionTabsHeaders from 'src/components/power-dialer/sessions/session-filters'

export default {
  name: 'SessionPage',
  components: {
    SessionTabsHeaders
  }
}
</script>
