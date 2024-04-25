<template>
  <div class="sms-reminders-wrapper border-0 p-0 w-100">
    <div class="w-100">
      <div class="w-100"
           v-if="showLineSelector">
        <label class="form-control-label mb-1">
          Send from
        </label>
        <q-select ref="smsReminders"
                  class="p-1 q-basic-selector w-100"
                  use-input
                  emit-value
                  map-options
                  clearable
                  dense
                  input-debounce="0"
                  option-value="id"
                  option-label="name"
                  v-model="selectedId"
                  data-testid="sms-reminders-selector"
                  :options="options"
                  @filter="filterFn"
                  @focus="onFocus"
                  @blur="onBlur"
                  @input="onInput">
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="no-results text-grey" data-testid="sms-reminders-item-section">
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
               class="btn-filter-wrapper"
               :loading="loading"
               :disable="loading"
               v-if="recentShowSendSmsReminderButton"
               data-testid="send-sms-reminder-button"
               @click="sendDefaultSmsReminder">
          <div class="mx-2 px-1 text-nowrap">
            Send SMS Reminder
          </div>
        </q-btn>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'sms-reminders',
  mixins: [
    selectorMixin
  ],
  props: {
    communicationId: {
      required: true
    },

    campaignId: {
      type: Number,
      required: true
    },

    showLineSelector: {
      type: Boolean,
      required: false,
      default: false
    },

    appointmentDatetime: {
      required: true
    }
  },

  data () {
    return {
      loading: false,
      selectedId: this.campaignId,
      recentShowSendSmsReminderButton: false,
      options: [],
      reference: 'smsReminders',
      fullOptionsProperty: 'campaigns'
    }
  },

  computed: {
    ...mapState(['campaigns'])
  },

  mounted () {
    this.options = this.campaigns
    this.selectedCampaign = this.campaigns.find(campaign => campaign.id === this.campaignId)
    this.showSendSmsReminderButton()
  },

  methods: {
    showSendSmsReminderButton () {
      // const appointmentDate = this.$moment(new Date(this.appointmentDatetime)).tz('UTC')
      this.recentShowSendSmsReminderButton = true // appointmentDate.isAfter()
      return this.recentShowSendSmsReminderButton
    },

    sendDefaultSmsReminder () {
      if (!this.selectedId) {
        this.$generalNotification('Please select a line where to send from.', 'error')
      }

      if (this.selectedId) {
        this.loading = true
        this.$axios
          .post(`/api/v1/communications/${this.communicationId}/send-sms-reminder`, {
            campaign_id: this.selectedId
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
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.options = this.campaigns.filter(campaign => campaign.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.campaigns
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.campaigns.filter(campaign => campaign.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },
  watch: {
    campaignId (value) {
      this.selectedCampaign = this.campaigns.find(campaign => campaign.id === value)
    },
    selectedId (val) {
      this.showInputPlaceholder()
    }
  }
}
</script>
