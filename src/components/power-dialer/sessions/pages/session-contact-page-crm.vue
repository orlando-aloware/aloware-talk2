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

import { mapState } from 'vuex'
import { hubspotIntegrationMixin } from 'src/plugins/mixins'

export default {
  name: 'SessionContactPageCrm',
  mixins: [hubspotIntegrationMixin],
  computed: {
    ...mapState('contacts', ['contact']),
    hubspotLink () {
      return this.getHubspotLink(this.contact)
    },
    test () {
      let iframe = document.getElementById('hubspot-crm')
      let el = iframe.contentWindow
      return el
    }
  }
}
</script>

<style>
  iframe > * {
    overflow: hidden;
  }
</style>
