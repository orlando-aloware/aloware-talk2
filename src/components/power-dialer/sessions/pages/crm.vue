<template>
  <div class="row full-height">
    <div class="col-12 p-1">
      <iframe
        v-if="hubspotLink"
        :src="hubspotLink"
        frameborder="0"
        style="height:100%; width:100%;">
      </iframe>
      <!-- <q-card flat class="p-3">
        <q-card-section class="p-0">
          <div class="text-subtitle1 text-weight-medium">
            <iframe
              v-if="hubspotLink"
              :src="hubspotLink"
              frameborder="0"
              style="height:100%; width:100%;">
            </iframe>
          </div>
        </q-card-section>
      </q-card> -->
    </div>
  </div>
</template>

<script>

import { mapFields } from 'vuex-map-fields'

export default {
  name: 'SessionPageCrm',
  computed: {
    ...mapFields('powerDialer', [
      'hubspot'
    ]),
    hubspotLink () {
      return this.hubspot.link
    }
  }
}
</script>
