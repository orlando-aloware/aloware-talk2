<template>
  <div class="power-dialer-list t-menu border-top"
       data-popper-target="power-dialer-list">
    <contacts-folders :is-contact-module-type="false"
                      @openIntegrationListsImportDialog="onOpenIntegrationImportDialog">
    </contacts-folders>
    <integration-list-import-modal :is-open="isIntegrationImportDialogOpen"
                                   v-if="isIntegrationImportDialogOpen"
                                   @close="onCloseIntegrationImportDialog">
    </integration-list-import-modal>
  </div>
</template>

<script>
import ContactsFolders from '../contacts/contacts-folders'
import IntegrationListImportModal from 'components/integration-list-import-modal'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'power-dialer-list',

  components: {
    IntegrationListImportModal,
    ContactsFolders
  },

  data () {
    return {
      isCreatingFolder: false,
      active: '',
      toggleFolders: true,
      isIntegrationImportDialogOpen: false,
      notification: null
    }
  },

  computed: {
    ...mapGetters('auth', ['profile'])
  },

  mounted () {
    this.$VueEvent.stop('contact_list_import_hubspot')
    this.$VueEvent.stop('contact_list_import_zoho')
    this.$VueEvent.stop('contact_list_import_pipedrive')
    this.$VueEvent.stop('contact_list_import_failed')

    // Handle import successfull
    this.$VueEvent.listen('contact_list_import_hubspot', event => this.handleImportFinishedEvent(event))
    this.$VueEvent.listen('contact_list_import_zoho', event => this.handleImportFinishedEvent(event))
    this.$VueEvent.listen('contact_list_import_pipedrive', event => this.handleImportFinishedEvent(event))
    this.$VueEvent.listen('contact_list_import_failed', event => this.handleImportFailedEvent(event))
  },

  methods: {
    ...mapActions([
      'addIntegrationPDImportSummary'
    ]),

    ...mapActions('contacts', ['foldersLoaded']),

    onCloseIntegrationImportDialog (data = {}) {
      this.isIntegrationImportDialogOpen = false

      if (data.notification) {
        this.notification = data.notification
      }
    },

    onOpenIntegrationImportDialog () {
      this.isIntegrationImportDialogOpen = true
    },

    reloadFolders () {
      return this.$axios
        .get('/api/v2/power-dialer-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch(() => {
          this.$generalNotification(
            'Unable to load folders please try again.',
            'error'
          )
        })
    },

    handleImportFailedEvent (event) {
      // return if event is for another user
      if (event.user_id !== this.profile.id) {
        return
      }

      // dismiss the previous notification
      if (this.notification) {
        this.notification()
        this.notification = null
      }

      this.reloadFolders()
      this.$generalNotification(
        'An error prevented the list from being imported. Please, try again later.',
        'error'
      )
    },

    handleImportFinishedEvent (event) {
      // return if event is for another user
      if (event.user_id !== this.profile.id) {
        return
      }

      // dismiss the previous notification
      if (this.notification) {
        this.notification()
        this.notification = null
      }

      this.reloadFolders()
      this.addIntegrationPDImportSummary({
        id: event.contact_list_id,
        summary: event?.summary ?? []
      })

      this.$generalNotification(
        'Success! Your power dialer queue import is ready.',
        'redirect',
        0,
        false,
        {
          path: `/power-dialer/list/${event.contact_list_id}/in-queue`
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
  },

  beforeDestroy () {
    this.$VueEvent.stop('contact_list_import_hubspot')
    this.$VueEvent.stop('contact_list_import_zoho')
    this.$VueEvent.stop('contact_list_import_pipedrive')
    this.$VueEvent.stop('contact_list_import_failed')
  }
}
</script>
