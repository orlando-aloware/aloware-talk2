<template>
  <div class="broadcast-add broadcast-add__schedule">
    <div class="broadcast-add__schedule__row">
      <div class="broadcast-add__schedule__row__label">
        Schedule
      </div>
      <div class="broadcast-add__schedule__row__fields">
        <broadcast-time-restriction-alert />

        <b-form-group>
          <b-form-radio value="now"
                        v-model="time">
            Now
          </b-form-radio>
          <b-form-radio value="scheduled"
                        v-model="time">
            Pick a time
            <div class="time-schedule"
                 v-if="time === 'scheduled'">
              <div class="time-schedule__row">
                <div class="time-schedule__row__label">
                  Day
                </div>
                <div class="time-schedule__row__field">
                  <date-selector v-model="schedule.date"
                                 @dateSelected="onDateSelected"/>
                </div>
              </div>
              <div class="time-schedule__row">
                <div class="time-schedule__row__label">
                  Time
                </div>
                <div class="time-schedule__row__field time-schedule__row__field__time-selector">
                  <date-selector only-time
                                 format="hh:mm a"
                                 formatted="hh:mm a"
                                 placeholder="Select time"
                                 :date-only="false"
                                 :auto-close="false"
                                 :value="scheduledTimeValue"
                                 @dateSelected="onTimeSelected"/>
                  <b-badge class="mr-2 position-absolute"
                           style="right: -50px; top: 15px"
                           variant="light">
                    {{ companyTimezone.format('z') }}
                  </b-badge>
                </div>
              </div>
            </div>
          </b-form-radio>
        </b-form-group>
      </div>
    </div>

    <div class="broadcast-add__schedule__row">
      <div class="broadcast-add__schedule__row__label" />
      <div class="broadcast-add__schedule__row__fields flex-row align-items-center">
        <b>{{ sendTimeLabel }}</b>
        <b-badge class="ml-2"
                 variant="light">
          {{ companyTimezone.format('z') }}
        </b-badge>
      </div>
    </div>

    <div class="broadcast-add__schedule__row">
      <div class="broadcast-add__schedule__row__label">
        From
        <span>
          <information-circle-icon class="cursor-pointer"/>
          <q-tooltip>
            The line you want to send the bulk messages campaign from.
          </q-tooltip>
        </span>
      </div>
      <div class="broadcast-add__schedule__row__fields mx-w-70">
        <contact-line-selector :value="propCampaign?.id"
                               @select="onCampaignSelected"/>
        <warning-note :campaign="propCampaign"
                      :useMmsRate="useMmsRate"/>
      </div>
    </div>

    <div class="broadcast-add__schedule__row">
      <div class="broadcast-add__schedule__row__label">
        Throttling
        <a target="_blank"
           :href="propCampaign?.max_mps <= mpsLimit ? getComplianceURL() : '#'">
          <information-circle-icon class="ml-2 cursor-pointer"/>
          <q-tooltip>
            This is an hourly throttling limit on your bulk message campaign.<br>
            Throttling comes directly from the carrier based on brand trust score.<br>
            <span v-if="propCampaign?.max_mps <= mpsLimit">
              To increase your MPS rate, please register your line cliking on this button.
            </span>
          </q-tooltip>
        </a>
      </div>
      <div class="broadcast-add__schedule__row__fields mx-w-70">
        <throttle-selector :campaign="propCampaign"
                           v-model="throttle"/>
      </div>
    </div>
  </div>
</template>

<script>
import BroadcastTimeRestrictionAlert from 'src/components/broadcasts/broadcast-time-restriction-alert'
import ContactLineSelector from 'src/components/contact-line-selector.vue'
import DateSelector from 'src/components/date-selector.vue'
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'
import ThrottleSelector from 'src/components/generic-selectors/throttle-selector.vue'
import WarningNote from 'src/components/warning-note.vue'
import { classicMixin, companyTimezone } from 'src/plugins/mixins'
import { mapState, mapGetters } from 'vuex'
import { isEmpty } from 'lodash'

export default {
  name: 'broadcast-add-view-schedule',

  mixins: [
    classicMixin,
    companyTimezone
  ],

  components: {
    BroadcastTimeRestrictionAlert,
    ContactLineSelector,
    InformationCircleIcon,
    DateSelector,
    ThrottleSelector,
    WarningNote
  },

  props: {
    propCampaign: {
      type: Object,
      required: false,
      default: null
    },

    propTime: {
      type: Object,
      required: false,
      default: null
    },

    propThrottle: {
      type: Object,
      required: false,
      default: null
    }
  },

  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),

    ...mapGetters('contacts', ['messageComposer']),

    isValid () {
      const time = this.time === 'scheduled'
        ? this.schedule.date && this.schedule.time
        : true

      return time &&
        !isEmpty(this.propCampaign) &&
        !isEmpty(this.throttle) &&
        !this.scheduleIsPast
    },

    scheduledTimeValue () {
      if (!this.schedule.date || !this.schedule.time) {
        return null
      }

      return `${this.schedule.date} ${this.schedule.time}`
    },

    sendTimeLabel () {
      return 'Send ' + (this.time === 'now'
        ? `today at ${this.companyDate.format('hh:mm a')}`
        : 'message at ' + window.moment(this.schedule.date + ' ' + this.schedule.time).format('MM/DD/YYYY hh:mm a'))
    },

    scheduleIsPast () {
      if (this.time === 'now') {
        return false
      }

      const scheduledDate = `${this.schedule.date} ${this.schedule.time}`

      return window.moment(scheduledDate).isBefore(this.companyDate)
    },

    isInsideRestrictedTime () {
      if (!this.currentCompany.broadcast_open || !this.currentCompany.broadcast_close) {
        return false
      }

      const time = this.time === 'now'
        ? this.companyDate.format('HH:mm:ss')
        : this.schedule.time

      return time >= this.currentCompany.broadcast_open && time <= this.currentCompany.broadcast_close
    },

    useMmsRate () {
      return this.messageComposer.sms.attachments.length > 0 || this.messageComposer.sms.gif_url.length > 0
    }
  },

  data: () => ({
    time: 'now',
    schedule: {
      date: null,
      time: null
    },
    throttle: null,
    mpsLimit: 0.25
  }),

  created () {
    this.onCampaignSelected(this.propCampaign || {})
    this.throttle = this.propThrottle

    if (this.propTime) {
      this.time = this.propTime.time
    }

    if (this.propTime?.schedule) {
      this.schedule = this.propTime.schedule
    } else {
      this.schedule.date = this.companyTimezone.format('MM/DD/YYYY')
      this.schedule.time = this.companyTimezone.format('HH:mm')
    }
  },

  methods: {
    onDateSelected (date) {
      this.schedule.date = date.substr(0, 10)
    },

    onTimeSelected (time) {
      this.schedule.time = window.moment(this.schedule.date + ' ' + time).format('HH:mm')
    },

    onCampaignSelected (campaign) {
      this.$emit('campaign', campaign)
    },

    emitValues () {
      this.$emit('time', {
        time: this.time,
        schedule: this.schedule
      })

      const date = this.time === 'now'
        ? this.companyDate.format('YYYY-MM-DD HH:mm')
        : `${this.schedule.date} ${this.schedule.time}`

      this.$emit('date-changed', date)
    }
  },

  watch: {
    isValid: {
      immediate: true,
      handler (state) {
        this.$emit('input', state)
      }
    },

    time: {
      immediate: true,
      handler () {
        this.emitValues()
      }
    },

    schedule: {
      deep: true,
      handler () {
        this.emitValues()
      }
    },

    isInsideRestrictedTime: {
      immediate: true,
      handler (state) {
        this.$emit('restricted-time', !state)
      }
    },

    throttle (value) {
      this.$emit('throttle', value)
    }
  }
}
</script>
