<template>
  <div class="sms-reminders-wrapper border-0 p-0 w-100">
    <div class="w-100">
      <div class="pb-2">
        <q-btn no-caps
               unelevated
               size="md"
               color="primary"
               class="btn-filter-wrapper"
               :loading="loading"
               :disable="loading"
               data-testid="send-sms-reminder-button"
               @click="onClickSendSmsReminder">
          <div class="mx-2 px-1 text-nowrap">
            Send SMS Reminder
          </div>
          <q-popup-proxy
            v-model="showLineSelectorPopup"
            no-parent-event
            self="top end"
            anchor="bottom right"
            transition-show="jump-down"
            transition-hide="jump-up"
          >
          <div class="d-flex line-selector-popup-wrapper">
            <line-selector
              width="255px"
              class="line-selector flex-grow-1"
              prepend="Send SMS From:"
              check-blocked-messaging
              hide-bottom-space
              :show-all-lines="!activeInboxId"
              :line-count.sync="lineCount"
              :pre-selected-team-inbox-line-id="campaignId"
              :generic-multiselect="false"
              :use-only-actives="true"
              @change="onLineChange"
            />
            <q-btn
              round
              no-caps
              unelevated
              icon="send"
              size="md"
              class="ml-1"
              color="primary"
              :loading="loading"
              :disable="loading || !selectedId"
              data-testid="send-sms-reminder-button"
              @click="createSmsReminder"
            >
            <q-tooltip
              anchor="top middle"
              self="center middle"
              content-class="fs-12"
            >
              Send Reminder
            </q-tooltip>
            </q-btn>
          </div>
          </q-popup-proxy>
        </q-btn>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import LineSelector from 'components/generic-selectors/line-selector'

export default {
  name: 'sms-reminders',

  components: {
    LineSelector
  },

  props: {
    communicationId: {
      required: true
    },

    campaignId: {
      type: Number,
      required: true
    },

    contactId: {
      type: Number,
      required: true
    },

    appointmentDatetime: {
      required: true
    }
  },

  data () {
    return {
      loading: false,
      selectedId: null,
      showLineSelectorPopup: false,
      lineCount: 0
    }
  },

  computed: {
    ...mapState(['campaigns']),
    ...mapState('TeamInbox', ['activeInboxId'])
  },

  methods: {
    checkShouldForceSendSmsReminder () {
      setTimeout(() => {
        if (this.showLineSelectorPopup && this.lineCount === 0) {
          // If the line popup should be shown but no lines are available,
          // force the creation of the SMS reminder with the saved campaign ID
          // (even if the line is not available in the current inbox)
          // 1ms delay to ensure the lineCount sync is complete
          this.showLineSelectorPopup = false
          this.createSmsReminder()
        }
      }, 1)
    },

    onClickSendSmsReminder () {
      // Always show the line selector popup when the button is clicked
      this.showLineSelectorPopup = !this.showLineSelectorPopup

      // If the popup is being shown, pre-select the saved campaign ID
      if (this.showLineSelectorPopup && this.campaignId) {
        this.selectedId = this.campaignId
      }

      // Check if we should force send (when no lines are available)
      return this.checkShouldForceSendSmsReminder()
    },

    createSmsReminder () {
      // Only use the selected ID from the line selector
      const campaignId = this.selectedId

      this.loading = true
      this.showLineSelectorPopup = false

      this.$axios
        .post(`/api/v1/communications/${this.communicationId}/send-sms-reminder`, {
          campaign_id: campaignId
        })
        .then(res => {
          if (res.status === 200) {
            return this.$generalNotification('SMS reminder is sent.')
          }
          this.$generalNotification(res.data.message, 'error')
        })
        .catch(err => {
          console.log(err)
          this.$generalNotification('Something went wrong.', 'error')
        })
        .finally(() => {
          this.loading = false
        })
    },

    onLineChange (lineId) {
      this.selectedId = lineId
    }
  },

  watch: {
    showLineSelectorPopup (value) {
      if (!value) {
        this.selectedId = null
      }
    }
  }
}
</script>
