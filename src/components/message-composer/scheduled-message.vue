<template>
  <b-modal class="schedule-message-modal"
           size="md"
           modal-class="column-headers-modal"
           scrollable
           v-model="isOpen"
           :title="title"
           data-testid="schedule-message-modal"
           @hidden="onHidden">
    <div>
      <b-row>
        <b-col cols="12 p-0">
          <b-calendar :min="minDate"
                      v-model="date"
                      locale="en-US"
                      hide-header
                      block
                      data-testid="schedule-message-calendar"
                      @context="onContext">
          </b-calendar>
        </b-col>
        <b-col cols="12 p-0">
          <b-time v-model="time"
                  class="mt-2 w-100"
                  locale="en"
                  hide-header
                  data-testid="schedule-message-time"
                  @context="onContext">
          </b-time>
        </b-col>

        <b-col cols="12 p-0">
          <b-alert class="schedule-notice p-1 mt-2 mb-0"
                   :show="!isScheduleDeliverable"
                   data-testid="schedule-message-notice-alert"
                   variant="warning">
            Schedule must be in future date
          </b-alert>
        </b-col>
      </b-row>
    </div>

    <template slot="modal-footer">
      <div class="w-100 d-flex align-items-center">
        <div class="d-flex align-items-center">
          <b-button variant="outline-success"
                    class="custom-btn"
                    size="sm"
                    data-testid="schedule-message-reset-btn"
                    :disabled="isSending"
                    @click="onReset">
            Reset
          </b-button>
        </div>
        <div class="flex-grow-1"></div>
        <b-button variant="primary"
                  class="custom-btn"
                  size="sm"
                  data-testid="schedule-message-send-btn"
                  :disabled="isSending || !isScheduleDeliverable"
                  @click="onSend">
          <q-spinner-bars v-if="isSending"
                          color="white">
          </q-spinner-bars>
          {{ isSending ? 'Scheduling Message...' : 'Schedule Send' }}
        </b-button>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'scheduled-message',

  computed: {
    ...mapGetters('contacts', ['isScheduleMessageOpen']),
    ...mapState('contacts', ['contact', 'messageComposer', 'selectedLine']),

    minDate () {
      return new Date()
    },
    isOpen: {
      get () {
        return this.isScheduleMessageOpen
      },
      set (isOpen) {
        return isOpen
      }
    }
  },

  mounted () {
    this.setNow()
  },

  data () {
    return {
      isSending: false,
      title: 'Schedule Message',
      date: new Date(),
      time: '',
      scheduleDate: window.moment(),
      context: null,
      isScheduleDeliverable: false
    }
  },

  methods: {
    onHidden () {
      this.scheduleMessageOpen(false)
    },

    onContext (ctx) {
      this.context = ctx
    },

    onReset () {
      this.setNow()
    },

    onSend () {
      this.isSending = true
      return talk2Api.V1.message.scheduled(this.formatMessage())
        .then(() => {
          this.$generalNotification('Message has been successfully scheduled to be sent.', 'success')
          this.resetMessageComposerSms()
          this.scheduleMessageOpen(false)
        }).finally(() => {
          this.isSending = false
        })
    },

    formatMessage () {
      return {
        body: this.messageComposer.sms.body,
        contact_id: this.contact.id,
        campaign_id: this.selectedLine.id,
        phone_number: this.messageComposer.sms.phone_number,
        schedule_date: this.scheduleDate,
        gif: this.messageComposer.sms.gif_url,
        attachments: this.messageComposer.sms.attachments
      }
    },

    setNow () {
      this.scheduleDate = window.moment()

      this.time = this.scheduleDate.format('HH:mm')
      this.date = this.scheduleDate.toDate()
    },

    validateScheduleDate () {
      this.isScheduleDeliverable = this.scheduleDate.isAfter(window.moment())
    },

    ...mapActions('contacts', ['scheduleMessageOpen', 'resetMessageComposerSms'])
  },

  watch: {
    date: function (date) {
      if (typeof date === 'object') {
        this.scheduleDate
          .set('year', window.moment(date).year())
          .set('month', window.moment(date).month())
          .set('date', window.moment(date).date())
      }

      if (typeof date === 'string') {
        this.scheduleDate
          .set('year', date.slice(0, 4))
          .set('month', (parseInt(date.slice(5, 7)) - 1))
          .set('date', date.slice(8, 10))
      }
      this.validateScheduleDate()
    },
    time: function (time) {
      this.scheduleDate
        .set('hour', time.slice(0, 2))
        .set('minute', time.slice(3, 5))
      this.validateScheduleDate()
    },
    isOpen: function (value) {
      if (!value) {
        this.setNow()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.schedule-message-modal {
  .modal-body {
    overflow-x: hidden !important;
  }

}

.schedule-notice {
  font-size: 0.75rem;
}
</style>
