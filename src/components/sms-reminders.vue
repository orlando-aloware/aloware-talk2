<template>
  <div class="sms-reminders-wrapper border-0 p-0">
    <div>
      <div v-if="campaignId">
        <q-select class="p-1"
                  use-input
                  emit-value
                  map-options
                  clearable
                  input-debounce="0"
                  label="Send from"
                  option-value="id"
                  option-label="name"
                  v-model="selectedCampaignId"
                  :options="filteredCampaigns"
                  @filter="filterFn">
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="no-results text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      <div class="pb-2">
        <q-btn no-caps
               unelevated
               size="md"
               color="primary"
               :loading="loading"
               v-if="recentShowSendSmsReminderButton"
               @click="sendDefaultSmsReminder">
          <div class="mx-2 px-1">
            Send SMS Reminder
          </div>
        </q-btn>
      </div>
    </div>
  </div>
</template>
<script>
import auth from 'boot/auth'
import { mapState } from 'vuex'

export default {
  name: 'sms-reminders',
  props: {
    communicationId: {
      required: true
    },

    campaignId: {
      required: true
    },

    appointmentDatetime: {
      required: true
    }
  },

  data () {
    return {
      auth: auth,
      loading: false,
      selectedCampaignId: this.campaignId,
      recentShowSendSmsReminderButton: false,
      filteredCampaigns: []
    }
  },

  computed: {
    ...mapState(['campaigns'])
  },

  mounted () {
    this.filteredCampaigns = this.campaigns
    this.selectedCampaign = this.campaigns.find(campaign => campaign.id === this.campaignId)
    this.showSendSmsReminderButton()
  },

  methods: {
    showSendSmsReminderButton () {
      // let appointmentDate = this.$moment(new Date(this.appointmentDatetime)).tz('UTC')
      this.recentShowSendSmsReminderButton = true // appointmentDate.isAfter()
      return this.recentShowSendSmsReminderButton
    },

    sendDefaultSmsReminder () {
      if (!this.selectedCampaignId) {
        this.$generalNotification('Please select a line where to send from.', 'error')
      }

      if (this.selectedCampaignId) {
        this.loading = true
        this.$axios
          .post(`/api/v1/communications/${this.communicationId}/send-sms-reminder`, {
            campaign_id: this.selectedCampaignId
          })
          .then(res => {
            this.loading = false
            switch (res.status) {
              case 200:
                this.$generalNotification('SMS reminder is sent.')
                break
              default:
                this.$generalNotification(res.data.message, 'error')
            }
          })
          .catch(err => {
            console.log(err)
            this.loading = false
            this.$generalNotification('Something went wrong.', 'error')
          })
      }
    },
    filterFn (val, update) {
      if (this.selectedCampaignId && val === this.selectedCampaignId) {
        update(() => {
          this.filteredCampaigns = this.campaigns.filter(campaign => campaign.id === this.selectedCampaignId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.filteredCampaigns = this.campaigns
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.filteredCampaigns = this.campaigns.filter(campaign => campaign.name.toLowerCase() === needle)
      })
    }
  },
  watch: {
    campaignId (value) {
      this.selectedCampaign = this.campaigns.find(campaign => campaign.id === value)
    }
  }
}
</script>
