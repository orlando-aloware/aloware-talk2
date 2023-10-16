<template>
  <div class="integration-wrapper">
    <q-card class="hubspot-card"
            flat>
      <q-item class="p-0">
        <q-item-section v-if="contactLink">
          <b-link target="_blank"
                  :href="contactLink">
            <table>
              <tr>
                <td><img class="gohighlevel-btn" /></td>
                <td><span class="integration-title">GoHighLevel</span></td>
              </tr>
            </table>
          </b-link>
        </q-item-section>
        <q-item-section v-else>
          <a href="#"
             onclick="return false;">
              <table>
                <tr>
                  <td><img class="gohighlevel-btn" /></td>
                  <td><span class="integration-title">GoHighLevel</span></td>
                </tr>
              </table>
          </a>
        </q-item-section>
      </q-item>

      <q-separator/>

      <q-card-section v-if="integrationData && integrationData.contact_details">
        <p class="mb-0"
           v-if="integrationData.contact_details.contact.firstName !== undefined">
          <span class="data-icon-label">First Name: </span>
          <span class="data-value">
             <q-tooltip anchor="top middle"
                        self="center middle">
              {{ integrationData.contact_details.contact.firstName }}
            </q-tooltip>
            {{ integrationData.contact_details.contact.firstName }}
          </span>
        </p>
        <p class="mb-0"
           v-if="integrationData.contact_details.contact.lastName !== undefined">
          <span class="data-icon-label">Last Name: </span>
          <span class="data-value">
             <q-tooltip anchor="top middle"
                        self="center middle">
              {{ integrationData.contact_details.contact.lastName }}
            </q-tooltip>
            {{ integrationData.contact_details.contact.lastName }}
          </span>
        </p>
        <p class="mb-0"
           v-if="integrationData.contact_details.contact.email !== undefined">
          <span class="data-icon-label">Email: </span>
          <span class="data-value">
             <q-tooltip anchor="top middle"
                        self="center middle">
              {{ integrationData.contact_details.contact.email }}
            </q-tooltip>
            {{ integrationData.contact_details.contact.email }}
          </span>
        </p>
        <p class="mb-0"
           v-if="integrationData.contact_details.contact.phone !== undefined">
          <span class="data-icon-label">Phone: </span>
          <span class="data-value">
             <q-tooltip anchor="top middle"
                        self="center middle">
              {{ integrationData.contact_details.contact.phone }}
            </q-tooltip>
            {{ integrationData.contact_details.contact.phone }}
          </span>
        </p>
      </q-card-section>

      <q-card-section>
        <b-row>
          <b-button class="text-white"
                    size="sm"
                    variant="primary"
                    tabindex="0"
                    block
                    @click="syncGHL">
            <i class="fa fa-sync-alt"
               v-if="!isSyncing"/>
            <q-spinner-bars v-if="isSyncing"
                            color="white"/>
            {{ isSyncing ? 'Syncing...' : 'Sync with GoHighLevel' }}
            <q-tooltip anchor="center start"
                       self="center left"
                       :offset="[-220, 10]">
              <p class="font-weight-bold mb-0">Click on this button to sync the data for this contact between {{ whiteLabelText }} and GoHighLevel.</p>
              <p class="font-weight-bold">You'll want to click on this button if:</p>
              <p class="mt-1 mb-0">- The contact was recently merged in GoHighLevel with another contact.</p>
              <p class="mt-0 mb-0">- You notice any inconsistencies between {{ whiteLabelText }} and GoHighLevel data on this contact.</p>
            </q-tooltip>
          </b-button>
        </b-row>
      </q-card-section>

    </q-card>

  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import _ from 'lodash'
import {
  gohighlevelIntegrationMixin,
  integrationMixin
} from 'src/plugins/mixins'

export default {
  name: 'integration-gohighlevel',

  components: { },

  mixins: [
    gohighlevelIntegrationMixin,
    integrationMixin
  ],

  props: {
    contact: {
      type: Object,
      required: true
    },

    dialer_mode: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState(['statics']),

    contactLink () {
      if (!this.contactIntegrationDataLoaded) {
        return
      }

      return this.gohighlevelContactLink(this.integrationData.contact_details.contact.id)
    },

    whiteLabelText () {
      return this.statics.whitelabel ? this.statics.name : 'Aloware'
    }
  },

  data () {
    return {
      isSyncing: false,
      integrationData: null,
      contactIntegrationDataLoaded: false
    }
  },

  async mounted () {
    if (this.contact && this.contact.id) {
      this.getData()
    }
  },

  methods: {
    ...mapActions('contacts', ['setContact', 'setContactClone']),

    getData () {
      return this.getIntegrationData(this.contact, 'gohighlevel')
        .then(response => {
          this.integrationData = response.data
          this.contactIntegrationDataLoaded = true
        })
    },

    syncGHL (showAlert = true) {
      this.isSyncing = true
      talk2Api.V1.contact.syncGHL(this.contact.id).then(response => {
        this.isSyncing = false
        this.getData()

        if (showAlert) {
          this.$generalNotification('Contact has been successfully synced.')
        }
      })
    }

  },

  watch: {
    'contact.id': _.debounce(function () {
      if (this.contact && this.contact.id && this.$route.params.id === this.contact.id.toString()) {
        this.contactIntegrationDataLoaded = false
        this.getData()
      }
    }, 500)
  }
}
</script>
