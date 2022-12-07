<template>
  <div class="row full-height">
    <div class="col-12 p-0">
      <div class="hubspot-iframe-container">
        <iframe class="hubspot-crm-iframe"
                :src="hubspotLink"
                frameborder="0"
                id="hubspot-crm"
                v-if="hubspotLink">
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

  mixins: [
    hubspotIntegrationMixin
  ],

  computed: {
    ...mapState('contacts', ['contact']),

    hubspotLink () {
      return this.getHubspotLink(this.contact)
    },

    test () {
      const iframe = document.getElementById('hubspot-crm')
      return iframe.contentWindow
    }
  }
}
</script>
