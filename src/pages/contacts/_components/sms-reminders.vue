<template>
  <div class="sms-reminders-wrapper mt-4 border-0 p-0">
    <div class="text-center">
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
      <el-button v-loading="loading"
                 v-if="recentshowSendSmsReminderButton"
                 type="primary"
                 @click="sendDefaultSmsReminder">
        Send SMS reminder now
      </el-button>
    </div>
  </div>
</template>
<script>
import auth from '../../../boot/auth'
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
    },

    sendDefaultSmsReminder () {
      if (!this.selectedCampaign) {
        this.$q.notify({
          duration: 2500,
          title: 'Line is required',
          message: 'Please select a line where to send from.',
          type: 'warning',
          showClose: true,
          position: 'top-right'
        })
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
                this.$q.notify({
                  duration: 5000,
                  title: 'SMS reminder',
                  message: 'SMS reminder is sent.',
                  type: 'success',
                  showClose: true,
                  position: 'top-right'
                })
                break
              default:
                this.$q.notify({
                  duration: 5000,
                  title: 'Sending SMS reminder',
                  message: res.data.message,
                  type: 'error',
                  showClose: true,
                  position: 'top-right'
                })
            }
          })
          .catch(err => {
            console.log(err)
            this.loading = false
            this.$q.notify({
              duration: 5000,
              title: 'Sending SMS reminder',
              message: 'Something went wrong.',
              type: 'error',
              showClose: true,
              position: 'top-right'
            })
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
