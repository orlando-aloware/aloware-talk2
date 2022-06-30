<template>
  <div class="power-dialer-list t-menu border-top"
       data-popper-target="power-dialer-list">
    <contacts-folders
      :is-contact-module-type="false"
      @openHubspotListImportDialog="onHubspotImportDialogOpen">
    </contacts-folders>
    <hubspot-list-import-modal :is-open="isHubspotImportDialogOpen"
                               @close="onHubspotImportDialogClose"/>
  </div>
</template>

<script>

import ContactsFolders from '../contacts/contacts-folders'
import HubspotListImportModal from 'components/hubspot-list-import-modal'

export default {
  name: 'PowerDialerList',
  components: {
    HubspotListImportModal,
    ContactsFolders
  },
  data () {
    return {
      isCreatingFolder: false,
      active: '',
      toggleFolders: true,
      isHubspotImportDialogOpen: false
    }
  },
  methods: {
    onHubspotImportDialogClose () {
      this.isHubspotImportDialogOpen = false
    },
    onHubspotImportDialogOpen () {
      this.isHubspotImportDialogOpen = true
    }
  },
  watch: {
    '$route': {
      handler (routeObj) {
        this.toggleFolders = routeObj.name === 'Power Dialer'
      },
      deep: true
    }
  }
}
</script>
