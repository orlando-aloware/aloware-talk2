<template>
  <div class="row full-height">
    <div class="col-12 p-0">
      <div class="hubspot-iframe-container">
        <iframe
          v-if="hubspotLink"
          :src="hubspotLink"
          frameborder="0"
          id="hubspot-crm">
        </iframe>
      </div>
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
