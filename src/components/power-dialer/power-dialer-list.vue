<template>
  <div class="power-dialer-list t-menu border-top"
       data-popper-target="power-dialer-list">
    <contacts-folders
      :is-contact-module-type="false"
      @openHubspotListImportDialog="onHubspotImportDialogOpen">
    </contacts-folders>
    <hubspot-list-import-modal :is-open="isHubspotImportDialogOpen"
                               v-if="isHubspotImportDialogOpen"
                               @close="onHubspotImportDialogClose"/>
  </div>
</template>

<script>
import ContactsFolders from '../contacts/contacts-folders'
import HubspotListImportModal from 'components/hubspot-list-import-modal'
import { mapActions } from 'vuex'

export default {
  name: 'power-dialer-list',

  components: {
    HubspotListImportModal,
    ContactsFolders
  },

  data () {
    return {
      isCreatingFolder: false,
      active: '',
      toggleFolders: true,
      isHubspotImportDialogOpen: false,
      notification: null
    }
  },

  mounted () {
    this.$VueEvent.stop('contact_list_import_hubspot')
    this.$VueEvent.listen('contact_list_import_hubspot', event => {
      if (this.notification) {
        this.notification()
      }

      this.reloadFolders()
      this.$generalNotification('Success! HubSpot list imported to Power Dialer.', 'redirect', 0, false, {
        path: `/power-dialer/list/${event.contact_list.id}/in-queue`
      })
    })
  },

  methods: {
    ...mapActions('contacts', ['foldersLoaded']),
    onHubspotImportDialogClose (data = {}) {
      this.isHubspotImportDialogOpen = false

      if (data.notification) {
        this.notification = data.notification
      }
    },
    onHubspotImportDialogOpen () {
      this.isHubspotImportDialogOpen = true
    },
    reloadFolders () {
      return this.$axios
        .get('/api/v2/power-dialer-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch(() => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
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
