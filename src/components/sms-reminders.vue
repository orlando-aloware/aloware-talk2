<template>
  <div class="sms-reminders-wrapper border-0 p-0">
    <div>
      <div v-if="!campaignId">
        <q-select class="p-1"
                  use-input
                  clearable
                  input-debounce="0"
                  label="Send from"
                  option-value="id"
                  option-label="name"
                  :options="campaigns"
                  @filter="filterFn"
                  v-model="selectedCampaign">
        </q-select>
      </div>
      <div class="pb-2">
        <q-btn no-caps
               unelevated
               size="md"
               color="primary"
               :loading="loading"
               v-if="recentshowSendSmsReminderButton"
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
      selectedCampaign: this.campaign_id,
      recentshowSendSmsReminderButton: false,
      filteredCampaigns: null
    }
  },

  computed: {
    ...mapState(['campaigns'])
  },

  mounted () {
    this.filteredCampaigns = this.campaigns
    this.showSendSmsReminderButton()
  },

  methods: {
    showSendSmsReminderButton () {
      let appointmentDate = this.$moment(new Date(this.appointmentDatetime)).tz('UTC')
      this.recentshowSendSmsReminderButton = appointmentDate.isAfter()
      return this.recentshowSendSmsReminderButton
    },

    sendDefaultSmsReminder () {
      if (!this.selectedCampaign) {
        this.$generalNotification('Please select a line where to send from.', 'error')
      }

      if (this.selectedCampaign) {
        this.loading = true
        this.$axios
          .post(`/api/v1/communications/${this.communicationId}/send-sms-reminder`, {
            campaign_id: this.selectedCampaign
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
      if (val === '') {
        update(() => {
          this.filteredCampaigns = this.campaigns
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.filteredCampaigns = this.campaigns.filter(campaign => campaign.toLowerCase().indexOf(needle) > -1)
      })
    }
  }
}
</script>
