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
      <div class="hubspot-inbox-header">
        <div class="hubspot-inbox-header-content">
          <img
            src="/app-icons/menu/aloware-logo-original-inverse.svg"
            alt="Aloware Logo"
            class="aloware-logo"
          >
        </div>
      </div>

      <!-- Main Content -->
      <div class="hubspot-inbox-content-container q-pa-md d-flex flex-column">
        <template v-if="!setupError">
          <div class="text-center q-mb-md">
            <h1 class="text-h5 text-weight-medium q-my-none">Select a Line Number</h1>
            <p class="text-body2 text-grey-7 q-my-sm">Choose the Aloware line number you want to connect as an SMS channel</p>
          </div>

          <!-- Search Bar -->
          <div class="hubspot-inbox-search-container q-mb-sm">
            <q-input
              v-model="searchQuery"
              placeholder="Search a specific line"
              outlined
              dense
              class="hubspot-inbox-search-input"
              bg-color="white"
              debounce="300"
            >
              <template v-slot:prepend>
                <q-icon name="search" class="q-pl-sm" />
              </template>
            </q-input>
          </div>

          <div class="hubspot-inbox-table-wrapper">
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
                <tr
                  v-for="row in filteredCampaigns"
                  :key="row.id"
                  :class="{
                    'disabled-row': !row.is_selectable,
                    'selectable-row': row.is_selectable
                  }"
                >
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
                          :disable="!row.is_selectable"
                        />
                        <q-tooltip
                          v-if="!row.is_selectable && row.not_selectable_reason"
                          :offset="[10, 10]"
                          class="bg-grey-8"
                        >
                          {{ row.not_selectable_reason }}
                        </q-tooltip>
                      </div>
                    </template>
                    <template v-else-if="col.name === 'capabilities'">
                      <div class="hubspot-inbox-capabilities">
                        <div
                          v-for="(value, key) in row.capabilities"
                          :key="key"
                          :class="[
                            'hubspot-inbox-chip',
                            value ? 'hubspot-inbox-chip-enabled' : 'hubspot-inbox-chip-disabled'
                          ]"
                        >
                          <q-tooltip
                            v-if="value"
                            :offset="[10, 10]"
                            class="bg-grey-8"
                          >
                            {{ getCapabilityTooltip(key) }}
                          </q-tooltip>
                          <q-icon
                            :name="!value ? 'close' : getCapabilityIcon(key)"
                            size="12px"
                            class="q-mr-xs"
                          />
                          {{ getCapabilityLabel(key) }}
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <span
                        :class="[
                          'hubspot-inbox-ellipsis',
                          'hubspot-inbox-cell-text',
                          {
                            'text-grey-6': !row.incoming_number,
                            'hubspot-inbox-disabled-text': !row.is_selectable,
                            'hubspot-inbox-selectable-text': row.is_selectable
                          }
                        ]"
                      >{{ col.field(row) }}</span>
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
              :disable="!selectedCampaign || isConnecting"
              :loading="isConnecting"
              class="hubspot-inbox-connect-btn"
              style="background: #FF7A59; color: white"
              no-caps
              unelevated
              @click="connectInbox"
            >
              <template v-slot:loading>
                <q-spinner-dots color="white" />
              </template>
            </q-btn>
          </div>
        </template>

        <!-- Error State -->
        <template v-else>
          <div class="hubspot-inbox-error-container text-center">
            <q-icon name="error" size="48px" color="negative" />
            <h2 class="text-h6 text-negative q-mt-md q-mb-xs">Aloware Connection Error</h2>
            <p class="text-body2 text-grey-6">Please contact your administrator</p>
            <pre class="error-code"><code>{{ setupErrorMessage }}</code></pre>
            <q-btn
              label="Retry"
              icon="refresh"
              color="primary"
              no-caps
              unelevated
              @click="reloadPage"
              style="min-width: 120px"
            />
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
import { dialerDataMixin } from 'src/plugins/mixins'

export default {
  name: 'HubSpotInboxConnect',

  components: {
    Datatable
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
          name: 'id',
          required: true,
          label: 'ID',
          align: 'center',
          field: row => row.id,
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
          name: 'capabilities',
          required: true,
          label: 'Capabilities',
          align: 'center',
          field: row => row,
          sortable: false
        }
      ]
    }
  },

  computed: {
    ...mapState('auth', ['authenticated']),

    filteredCampaigns () {
      if (!this.searchQuery.trim()) return this.campaigns

      const query = this.searchQuery.trim().toLowerCase()
      return this.campaigns.filter(campaign => {
        const name = campaign.name?.toLowerCase() || ''
        const id = String(campaign.id)
        return name.includes(query) || id.includes(query)
      })
    }
  },

  methods: {
    ...mapActions('auth', ['check']),

    reloadPage () {
      window.location.reload()
    },

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

        if (error.response && error.response.status === 403) {
          this.setupErrorMessage = "You don't have enough permissions to connect an Aloware SMS channel. Please make sure you have access to both HubSpot's Integration Settings and Campaign Lines in Aloware."
        } else {
          this.setupErrorMessage = error.response.data.error || error.response.data.message || 'An error occurred while fetching the setup data. Please try again later.'
        }
      }
    },

    async connectInbox () {
      this.isConnecting = true
      try {
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

    getCapabilityLabel (capability) {
      const labels = {
        sms: 'SMS',
        call: 'Calling',
        fax: 'Fax',
        mms: 'MMS'
      }
      return labels[capability] || capability
    },

    getCapabilityIcon (capability) {
      const icons = {
        sms: 'sms',
        call: 'phone',
        fax: 'fax',
        mms: 'mms'
      }
      return icons[capability] || 'help'
    },

    getCapabilityTooltip (capability) {
      const tooltips = {
        sms: 'Send and Receive SMS',
        call: 'Make and Receive Calls',
        fax: 'Send and Receive Fax',
        mms: 'Send and Receive MMS'
      }
      return tooltips[capability] || capability
    },

    handleRowClick (row) {
      if (!row.is_selectable) return
      this.selectedCampaign = row.id === this.selectedCampaign?.id ? null : row
    }
  },

  async created () {
    this.isLoading = true

    await this.handleAuthRedirect()
    await this.getSetupData()

    this.isLoading = false
  }
}
</script>

<style scoped>
.hubspot-inbox-header {
  background-color: #15163f;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0;
  width: 100%;
  justify-content: center;
}

.hubspot-inbox-header-content {
  width: 100%;
  max-width: 800px;
  padding: 0 16px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

.hubspot-inbox-content-container {
  padding: 16px;
  background-color: white;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.hubspot-inbox-search-container {
  width: 80%;
  margin: 0 auto 12px;
}

.hubspot-inbox-search-input {
  width: 100%;
}

.hubspot-inbox-search-input :deep(.q-field__control) {
  border-radius: 4px;
  height: 36px;
}

.hubspot-inbox-table-wrapper {
  min-height: 0;
  max-height: 60vh;
  margin-bottom: 12px;
}

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

/* Style for disabled rows */
.numbers-table :deep(tr.disabled-row),
tr.disabled-row {
  background-color: #f5f5f5 !important;
}

.numbers-table :deep(tr.selectable-row),
tr.selectable-row {
  background-color: white;
}

.numbers-table :deep(tr.disabled-row td),
tr.disabled-row td {
  color: #999 !important;
  opacity: 0.6 !important;
}

/* Only fade main text, not chips */
.numbers-table :deep(tr.disabled-row .hubspot-inbox-cell-text),
.numbers-table :deep(tr.disabled-row .hubspot-inbox-ellipsis),
.numbers-table :deep(tr.disabled-row span),
tr.disabled-row .hubspot-inbox-cell-text,
tr.disabled-row .hubspot-inbox-ellipsis,
tr.disabled-row span {
  color: #999 !important;
  opacity: 0.6 !important;
}

/* Restore chip and icon color in disabled rows */
.numbers-table :deep(tr.disabled-row .hubspot-inbox-chip),
tr.disabled-row .hubspot-inbox-chip {
  color: white !important;
  opacity: 1 !important;
}
.numbers-table :deep(tr.disabled-row .hubspot-inbox-chip-disabled),
tr.disabled-row .hubspot-inbox-chip-disabled {
  background-color: #9e9e9e !important;
  color: white !important;
}
.numbers-table :deep(tr.disabled-row .hubspot-inbox-chip-enabled),
tr.disabled-row .hubspot-inbox-chip-enabled {
  background-color: #4caf50 !important;
  color: white !important;
}
.numbers-table :deep(tr.disabled-row .hubspot-inbox-chip q-icon),
tr.disabled-row .hubspot-inbox-chip q-icon {
  color: white !important;
  opacity: 1 !important;
}

.numbers-table :deep(tr.disabled-row:hover),
tr.disabled-row:hover {
  background-color: #f0f0f0 !important;
  cursor: not-allowed;
}

.numbers-table :deep(tr.disabled-row) span,
.numbers-table tr.disabled-row span {
  color: #999 !important;
  opacity: 0.6 !important;
}

.numbers-table :deep(tr.disabled-row) .hubspot-inbox-ellipsis,
.numbers-table tr.disabled-row .hubspot-inbox-ellipsis {
  color: #999 !important;
  opacity: 0.6 !important;
}

.hubspot-inbox-connect-btn {
  min-width: 200px;
  font-weight: 500;
}

.hubspot-inbox-connect-btn:not(:disabled):hover {
  background: #ff8f73 !important;
}

.hubspot-inbox-connect-btn:disabled {
  opacity: 0.7;
}

.hubspot-inbox-ellipsis {
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hubspot-inbox-error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 15% 32px 32px;
}

.hubspot-inbox-error-container p {
  max-width: 400px;
  margin: 0 auto;
}

.error-code {
  background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
  max-width: 600px;
  width: 100%;
  overflow-x: auto;
  font-family: monospace;
  font-size: 12px;
  text-align: left;
  color: #476582;
  white-space: pre-wrap;
  word-break: break-word;
}

.hubspot-inbox-capabilities {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  padding: 4px 0;
}

.hubspot-inbox-chip {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  color: white;
  text-align: center;
  line-height: 1.2;
  margin: 2px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.hubspot-inbox-chip-enabled {
  background-color: #4caf50;
}

.hubspot-inbox-chip-disabled {
  background-color: #9e9e9e;
}

.hubspot-inbox-cell-text {
  display: block;
  text-align: center;
  width: 100%;
  margin: 0 auto;
}

.hubspot-inbox-selectable-text {
  color: #333 !important;
  opacity: 1 !important;
}

.hubspot-inbox-disabled-text {
  color: #999 !important;
  opacity: 0.6 !important;
}
</style>
