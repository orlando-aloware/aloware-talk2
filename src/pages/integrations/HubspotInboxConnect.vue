<template>
  <div class="full-height">
    <!-- Start Loading indicator -->
    <div v-if="isLoading" class="flex flex-center full-height">
      <q-spinner-bars color="primary" size="40px" />
    </div>
    <!-- End Loading indicator -->

    <!-- Start Main Content-->
    <template v-if="!isLoading">
      <!-- Header with Logo -->
      <div class="header">
        <div class="header-content">
          <img
            src="/app-icons/menu/aloware-logo-original-inverse.svg"
            alt="Aloware Logo"
            class="aloware-logo"
          >
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-container q-pa-md d-flex flex-column">
        <template v-if="!setupError">
          <div class="text-center q-mb-md">
            <h1 class="text-h5 text-weight-medium q-my-none">Select a Line Number</h1>
            <p class="text-body2 text-grey-7 q-my-sm">Choose the Aloware line number you want to connect as an SMS channel</p>
          </div>

          <!-- Search Bar -->
          <div class="search-container q-mb-sm">
            <q-input
              v-model="searchQuery"
              placeholder="Search a specific number"
              outlined
              dense
              class="search-input"
              bg-color="white"
              debounce="300"
            >
              <template v-slot:prepend>
                <q-icon name="search" class="q-pl-sm" />
              </template>
            </q-input>
          </div>

          <div class="table-wrapper">
            <datatable
              custom-class="numbers-table talk-table"
              sticky-headers
              scroll-area-class="numbers-table-scroll-area"
              :paginated="false"
              :columns="columns"
              :data="filteredCampaigns"
              :total-rows="filteredCampaigns.length"
              :is-loading="false"
              :is-loading-more="false"
              :binary-state-sort="false"
              @row-click="handleRowClick"
            >
              <template #tbody>
                <tr v-for="row in filteredCampaigns" :key="row.id">
                  <td
                    v-for="col in columns"
                    :key="col.name"
                    :style="col.style"
                    class="text-center q-py-md"
                  >
                    <template v-if="col.name === 'select'">
                      <div class="flex justify-center items-center">
                        <q-radio
                          v-model="selectedCampaign"
                          :val="row"
                          color="primary"
                          dense
                          :disable="!row.incoming_number"
                        />
                      </div>
                    </template>
                    <template v-else-if="col.name === 'ring_group'">
                      <div class="flex justify-center items-center">
                        <ring-group :ring-group-id="col.field(row)" />
                      </div>
                    </template>
                    <template v-else>
                      <div class="flex justify-center items-center">
                        <span :class="['ellipsis', { 'text-grey-6': !row.incoming_number }]">{{ col.field(row) }}</span>
                      </div>
                    </template>
                  </td>
                </tr>
              </template>

              <template #empty>
                <div class="w-100 text-center q-pa-sm">
                  <h2 class="text-subtitle2 text-grey-7 q-my-none">No numbers found</h2>
                  <p class="text-caption text-grey-6 q-my-xs">Try adjusting your search criteria</p>
                </div>
              </template>
            </datatable>
          </div>

          <!-- Connect Button -->
          <div class="text-right q-mt-sm">
            <q-btn
              label="Connect with HubSpot"
              :disable="!selectedCampaign"
              class="connect-btn"
              style="background: #FF7A59; color: white"
              no-caps
              unelevated
              @click="connectInbox"
            />
          </div>
        </template>

        <!-- Error State -->
        <template v-else>
          <div class="error-container text-center">
            <q-icon name="error" size="48px" color="negative" />
            <h2 class="text-h6 text-negative q-mt-md q-mb-xs">Aloware Connection Error</h2>
            <p class="text-body2 text-grey-6">Please contact your administrator</p>
            <pre style="background: #f5f5f5; border: 1px solid #eee; border-radius: 4px; padding: 16px; margin-top: 24px; margin-bottom: 8px; max-width: 600px; width: 100%; overflow-x: auto; font-family: monospace; font-size: 12px; text-align: left; color: #476582; white-space: pre-wrap; word-break: break-word;"><code>{{ setupErrorMessage }}</code></pre>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import Datatable from 'src/components/datatable.vue'
import RingGroup from 'src/components/communications/communications-table/ring-group.vue'
import { dialerDataMixin } from 'src/plugins/mixins'

export default {
  name: 'HubSpotInboxConnect',

  components: {
    Datatable,
    RingGroup
  },

  mixins: [
    dialerDataMixin
  ],

  data () {
    return {
      isLoading: false,
      setupError: false,
      setupErrorMessage: '',
      isConnecting: false,
      searchQuery: '',
      campaigns: [],
      selectedCampaign: null,
      columns: [
        {
          name: 'select',
          label: '',
          field: row => row,
          align: 'center',
          style: 'width: 40px',
          sortable: false
        },
        {
          name: 'name',
          required: true,
          label: 'Name',
          align: 'center',
          field: row => row.name || 'Unnamed Line',
          sortable: false
        },
        {
          name: 'phone',
          required: true,
          label: 'Number',
          align: 'center',
          field: row => this.getPhoneNumber(row),
          sortable: false
        },
        {
          name: 'ring_group',
          required: true,
          label: 'Ring Group',
          align: 'center',
          field: row => row.ring_group_id,
          sortable: false
        },
        {
          name: 'type',
          required: true,
          label: 'Type',
          align: 'center',
          field: row => this.getLineType(row),
          sortable: false
        }
      ]
    }
  },

  computed: {
    ...mapState('auth', ['authenticated']),
    ...mapState(['ringGroups']),

    filteredCampaigns () {
      if (!this.searchQuery.trim()) return this.campaigns

      const query = this.searchQuery.trim().toLowerCase()
      return this.campaigns.filter(campaign => {
        const name = campaign.name?.toLowerCase() || ''
        const number = this.getPhoneNumber(campaign).toLowerCase()

        return name.includes(query) || number.includes(query)
      })
    }
  },

  methods: {
    ...mapActions('auth', ['check']),

    async handleAuthRedirect () {
      if (this.authenticated) return

      try {
        await this.check()
      } catch (error) {
        await this.$router.push({
          name: 'Login',
          query: { redirect: this.$route.fullPath }
        }).catch(() => {})
      }
    },

    async getSetupData () {
      try {
        const response = await talk2Api.V1.integrations.hubspot.getInboxSetupData()
        this.campaigns = response.data.data.campaigns
      } catch (error) {
        this.setupError = true
        this.setupErrorMessage = error.response.data
      }
    },

    async connectInbox () {
      this.isConnecting = true
      try {
        console.log('selectedCampaign', this.selectedCampaign)
        const response = await talk2Api.V1.integrations.hubspot.connectInbox({
          'account_token': this.$route.query.accountToken,
          'channel_id': this.$route.query.channelId,
          'inbox_id': this.$route.query.inboxId,
          'user_id': this.$route.query.userId,
          'portal_id': this.$route.query.portalId,
          'redirect_url': this.$route.query.redirectUrl,
          'campaign_id': this.selectedCampaign.id
        })

        // Redirect to HubSpot's success page
        if (response.status === 200) {
          window.location.href = decodeURIComponent(this.$route.query.redirectUrl)
        }
      } catch (error) {
        this.$handleErrors(error.response)
      } finally {
        this.isConnecting = false
      }
    },

    getLineType (campaign) {
      if (campaign.has_tollfree_pn) return 'Toll-free'
      if (campaign.has_local_pn) return 'Local'
      return 'Unknown'
    },

    getPhoneNumber (campaign) {
      return campaign.incoming_number ?? '-'
    },

    handleRowClick (row) {
      if (!row.incoming_number) return
      this.selectedCampaign = row.id === this.selectedCampaign?.id ? null : row
    }
  },

  async created () {
    this.isLoading = true
    await this.handleAuthRedirect()
    await Promise.all([
      this.getSetupData(),
      this.getRingGroups()
    ])
    this.isLoading = false
  }
}
</script>

<style>
.header {
  background-color: #15163f;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0;
  width: 100%;
  justify-content: center;
}

.aloware-logo {
  height: 24px;
}

.content-container {
  padding: 16px;
  background-color: white;
  height: calc(100vh - 40px); /* Subtract header height */
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.search-container {
  width: 80%;
  margin: 0 auto 12px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.q-field__control) {
  border-radius: 4px;
  height: 36px;
}

.table-wrapper {
  min-height: 0; /* Important for Firefox */
  max-height: 60vh; /* More flexible height based on viewport */
  margin-bottom: 12px;
}

/* Table styles */
.numbers-table :deep(.q-table__container) {
  background-color: white;
  border-radius: 4px;
  border: 1px solid #eee;
}

.numbers-table :deep(.q-table__middle) {
  max-height: none !important;
  overflow-y: auto;
  overflow-x: hidden;
}

.numbers-table :deep(thead tr) {
  background-color: #f5f7fa;
  position: sticky;
  top: 0;
  z-index: 1;
}

.numbers-table :deep(th) {
  font-weight: 500 !important;
  font-size: 13px;
  color: #333;
  padding: 16px;
  min-height: 60px;
  cursor: default !important;
  pointer-events: none !important;
}

.numbers-table :deep(tr) {
  min-height: 60px;
}

.numbers-table :deep(td) {
  font-size: 13px;
  padding: 16px;
  height: 60px;
}

.numbers-table :deep(td .flex) {
  min-height: 28px;
}

.connect-btn {
  min-width: 200px;
  font-weight: 500;
}

.connect-btn:not(:disabled):hover {
  background: #ff8f73 !important;
}

.connect-btn:disabled {
  opacity: 0.7;
}

/* Handle text overflow */
.ellipsis {
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Add a container for the logo to match content width */
.header-content {
  width: 100%;
  max-width: 800px;
  padding: 0 16px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

/* Add error container styles */
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 32px;
  padding-top: 15%;
}

.error-container p {
  max-width: 400px;
  margin: 0 auto;
}
</style>
