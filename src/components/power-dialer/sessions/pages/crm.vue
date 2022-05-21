<template>
  <div class="row full-height">
    <div class="col-12 p-0 px-3 pb-2">
      <div class="hubspot-iframe-container">
        <iframe
          v-if="hubspotLink"
          :src="hubspotLink"
          frameborder="0"
          id="hubspot-crm">
        </iframe>
      </div>
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
      <!-- var pDiv = document.getElementById('hubspot-crm'); -->
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
    },
    test () {
      let iframe = document.getElementById('hubspot-crm')
      let el = iframe.contentWindow
      return el
    }
  },
  data () {
    return {
      sample: ''
    }
  }
}
</script>

<style>
  iframe > * {
    overflow: hidden;
  }
</style>
